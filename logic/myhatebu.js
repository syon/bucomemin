const request = require('request-promise-native')
const cheerio = require('cheerio')
const moment = require('moment')
const dg = require('debug')('app:myhatebu')
const Hatena = require('./hatena')
// const { scrapeHatebuPageData } = require('./bHatena')

const options = {
  headers: {
    'User-Agent': 'Request'
  },
  transform: function(body) {
    return cheerio.load(body)
  }
}

/**
 * はてブページからスクレイピング for 新規分析ユーザ登録
 * <対象条件>
 * 指定タイムスタンプより過去
 * <停止条件>
 * １年前に到達 or 200ページ巡回
 */
async function get1YearBookmarks({ user, timestamp }) {
  dg('====[extractUserBookmarks]========================')
  let bookmarks = []
  const startDate = timestamp ? moment(timestamp) : moment()
  for (let i = 0; i < 500; i++) {
    const num = i + 1
    let targets = await extractUserBookmarks(user, num)
    if (targets.length === 0) {
      break
    }
    targets = targets.filter(x => {
      return moment(x.date, 'YYYY/MM/DD') < startDate
    })
    if (targets.length > 0) {
      bookmarks = bookmarks.concat(targets)
      const lastOne = targets[targets.length - 1]
      dg(`Collected ${bookmarks.length}, last one date: ${lastOne.date}`)
    }
    const old = bookmarks.find(x => {
      const oneYearAgo = moment().subtract(1, 'year')
      return moment(x.date, 'YYYY/MM/DD') < oneYearAgo
    })
    if (old) break
  }
  dg(`Total Collected:`, bookmarks.length)

  const exBookmarks = extendBucomeDetail(bookmarks, user)
  return exBookmarks

  // dg('====[scrapeHatebuPageData]========================')
  // // TODO: はてブページのマスタとしてユーザー配下ではなくロビネライクに管理すべき
  // const results = []
  // for (const ex of recentBookmarksEx) {
  //   const bucome = await scrapeHatebuPageData(ex.hatebuPage)
  //   results.push({ ...ex, bucome })
  // }
  // return results
}

async function extendBucomeDetail(bookmarks, user) {
  const exBookmarks = []
  for (let i = 0; i < bookmarks.length; i++) {
    // eid, url, date
    const entry = bookmarks[i]
    dg(`[${i + 1}/${bookmarks.length}] (${entry.date}) ${entry.url}`)
    // title, url, bookmarks, entry_url, eid, count, screenshot
    const detail = await Hatena.Bookmark.getEntryLite(entry.url)
    const { title, entry_url: eurl, count } = detail
    // comment, user, tags, timestamp, uri, stars, can_comment
    const bucome = await Hatena.Custom.extractBucomeDetail(detail, user)
    bucome.stars = bucome.stars || []
    exBookmarks.push({ ...entry, title, eurl, count, ...bucome })
  }
  return exBookmarks
}

/**
 * このメソッドの責務は「対象ユーザが何のページをブックマークしたか」のみ。
 * 得るべきデータは eid, 記事URL, date のみ。それ以外はAPIから取得する。
 */
async function extractUserBookmarks(user, page) {
  // TODO: 本当にすべて取得できてる？ Ajaxあり
  options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${page}`
  dg('<SCRAPING>', options.uri)
  return await request(options)
    .then(function($) {
      const list = $('.bookmark-item').map((i, el) => {
        const eid = $(el)
          .find('.centerarticle-reaction')
          .attr('id')
          .replace(/^bookmark-/, '')
        const url = $(el)
          .find('.centerarticle-entry-title > a')
          .attr('href')
        const date = $(el)
          .find('.centerarticle-reaction-timestamp')
          .text()
        return { eid, url, date }
      })
      return list.get()
    })
    .catch(function(err) {
      throw new Error(err)
    })
}

/**
 * はてブページからスクレイピング for 既存分析ユーザ更新
 * - ブックマーク追加分の登録
 * - 過去ブクマのスター数とコメント修正更新
 * <停止条件>
 * ５日前に到達 or 20ページ巡回
 * ※このメソッドの責務は、結局のところ対象範囲のブクマを
 * 改めて収集してくるのみである。
 */
async function getRecentBookmarks({ user }) {
  dg(`====[getRecentBookmarks] (${user}) ========================`)
  let bookmarks = []
  for (let i = 0; i < 20; i++) {
    const num = i + 1
    dg(`Page ${num} ...`)
    const list = await extractUserBookmarks(user, num)
    bookmarks = bookmarks.concat(list)
    dg(`Collected:`, bookmarks.length)
    const old = bookmarks.find(x => {
      const fiveDaysAgo = moment().subtract(5, 'days')
      return moment(x.date, 'YYYY/MM/DD') < fiveDaysAgo
    })
    if (old) {
      dg('５日前のブクマに到達。スクレイピングを切り上げます。')
      break
    }
  }
  const exBookmarks = extendBucomeDetail(bookmarks, user)
  return exBookmarks
}

async function getFirstBookmarkDate(user, totalBookmarkCount) {
  if (!totalBookmarkCount) return null
  const num = Math.floor(totalBookmarkCount / 20) + 1
  for (let i = 0; i < 10; i++) {
    const list = await extractUserBookmarks(user, num - i)
    if (list.length > 0) {
      const first = list.pop()
      return first.date
    }
  }
  return null
}

module.exports = { get1YearBookmarks, getRecentBookmarks, getFirstBookmarkDate }

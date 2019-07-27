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
 * <停止条件>
 * １年前に到達 or 20ページ巡回
 */
async function get1YearBookmarks({ user }) {
  dg('====[extractEntries]========================')
  let recentBookmarks = []
  for (let i = 0; i < 20; i++) {
    dg('......', i)
    const num = i + 1
    options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${num}`
    const list = await extractEntries(options)
    recentBookmarks = recentBookmarks.concat(list)
    dg(recentBookmarks.length)
    const old = recentBookmarks.find(x => {
      const oneYearAgo = moment().subtract(1, 'year')
      return moment(x.date, 'YYYY/MM/DD') < oneYearAgo
    })
    if (old) break
  }

  dg('====[getBucomeDetailFromAPI]========================')
  const recentBookmarksEx = []
  for (let i = 0; i < recentBookmarks.length; i++) {
    const entry = recentBookmarks[i]
    dg(`[${i + 1}/${recentBookmarks.length}] (${entry.date}) ${entry.url}`)
    const bucome = await Hatena.Custom.getBucomeDetailFromAPI(entry.url, user)
    bucome.stars = bucome.stars || []
    recentBookmarksEx.push({ ...entry, ...bucome })
  }

  return recentBookmarksEx

  // dg('====[scrapeHatebuPageData]========================')
  // // TODO: はてブページのマスタとしてユーザー配下ではなくロビネライクに管理すべき
  // const results = []
  // for (const ex of recentBookmarksEx) {
  //   const bucome = await scrapeHatebuPageData(ex.hatebuPage)
  //   results.push({ ...ex, bucome })
  // }
  // return results
}

async function extractEntries(options) {
  // TODO: 本当にすべて取得できてる？ Ajaxあり
  return await request(options)
    .then(function($) {
      const list = $('.bookmark-item').map((i, el) => {
        const title = $(el)
          .find('.centerarticle-entry-title')
          .text()
          .trim()
        const url = $(el)
          .find('.centerarticle-entry-title > a')
          .attr('href')
        const users = $(el)
          .find('.centerarticle-users > a')
          .text()
          .replace(/ users?/, '')
        const eurl =
          'https://b.hatena.ne.jp' +
          $(el)
            .find('.centerarticle-users > a')
            .attr('href')
        const eid = $(el)
          .find('.centerarticle-reaction')
          .attr('id')
          .replace(/^bookmark-/, '')
        const date = $(el)
          .find('.centerarticle-reaction-timestamp')
          .text()
        const comment = $(el)
          .find('.js-comment')
          .text()
        const commentPermalink =
          'https://b.hatena.ne.jp' +
          $(el)
            .find('.comment-permalink > a')
            .attr('href')
        // Twitter clicks needs ajax evaluation.
        return {
          eid,
          eurl,
          title,
          url,
          users,
          date,
          comment,
          commentPermalink
        }
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
  let recentBookmarks = []
  for (let i = 0; i < 20; i++) {
    const num = i + 1
    dg(`Page ${num} ...`)
    options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${num}`
    const list = await extractEntries(options)
    recentBookmarks = recentBookmarks.concat(list)
    dg(`Collected:`, recentBookmarks.length)
    const old = recentBookmarks.find(x => {
      const fiveDaysAgo = moment().subtract(5, 'days')
      return moment(x.date, 'YYYY/MM/DD') < fiveDaysAgo
    })
    if (old) {
      dg('５日前のブクマに到達。スクレイピングを切り上げます。')
      break
    }
  }
  return recentBookmarks
}

module.exports = { get1YearBookmarks, getRecentBookmarks }

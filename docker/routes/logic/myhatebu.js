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
 * はてブページからスクレイピング
 * <停止条件>
 * １年前に到達 or DB最新に到達
 */
async function getRecentBookmarks({ user }) {
  dg('====[extractEntries]========================')
  let recentBookmarks = []
  for (let i = 0; i < 2; i++) {
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

module.exports = { getRecentBookmarks }

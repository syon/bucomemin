const request = require('request-promise-native')
const cheerio = require('cheerio')
const Hatena = require('./hatena')
const pptr = require('./pptr')

const options = {
  headers: {
    'User-Agent': 'Request'
  },
  transform: function(body) {
    return cheerio.load(body)
  }
}

async function getBookmarks({ user }) {
  console.log('====[extractEntries]========================')
  let recentBookmarks = []
  for (let i = 0; i < 1; i++) {
    console.log('......', i)
    const num = i + 1
    options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${num}`
    const list = await extractEntries(options)
    recentBookmarks = recentBookmarks.concat(list)
    console.log(recentBookmarks.length)
  }

  console.log('====[getBucomeDetailFromAPI]========================')
  const recentBookmarksEx = []
  for (const entry of recentBookmarks) {
    console.log(entry.url)
    const bucome = await Hatena.Custom.getBucomeDetailFromAPI(entry.url, user)
    bucome.stars = bucome.stars || []
    recentBookmarksEx.push({ ...entry, ...bucome })
  }

  console.log('====[scrapeHatebuPageData]========================')
  // TODO: はてブページのマスタとしてユーザー配下ではなくロビネライクに管理すべき
  const results = []
  for (const ex of recentBookmarksEx) {
    const bucome = await scrapeHatebuPageData(ex.hatebuPage)
    results.push({ ...ex, bucome })
  }

  return results
}

async function extractEntries(options) {
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
        const hatebuPage =
          'https://b.hatena.ne.jp' +
          $(el)
            .find('.centerarticle-users > a')
            .attr('href')
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
        // const twitterClicks = $(el)
        //   .find('.twitter-click > a > span')
        //   .text()
        //   .replace(/ clicks?/, '')
        return {
          title,
          url,
          users,
          hatebuPage,
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

async function scrapeHatebuPageData(hatebuPageUrl) {
  const html = await pptr(hatebuPageUrl)
  const $ = cheerio.load(html)
  const popularItems = $('.js-bookmarks-popular .js-bookmark-item')
  const populars = {}
  popularItems.each((i, el) => {
    const user = $(el).find('.entry-comment-username > a').text()
    const comment = $(el).find('.js-bookmark-comment').text()
    const date = $(el).find('.entry-comment-timestamp').text()
    const tw = $(el).find('.twitter-click > a > span').text()
    const twitterClicks = tw.replace(/ clicks$/, '')
    populars[user] = { comment, date, twitterClicks }
  })

  const recentItems = $('.js-bookmarks-recent .js-bookmark-item')
  const recents = {}
  recentItems.each((i, el) => {
    const user = $(el).find('.entry-comment-username > a').text()
    const comment = $(el).find('.js-bookmark-comment').text()
    const date = $(el).find('.entry-comment-timestamp').text()
    const tw = $(el).find('.twitter-click > a > span').text()
    const twitterClicks = tw.replace(/ clicks$/, '')
    recents[user] = { comment, date, twitterClicks }
  })

  return { populars, recents }
}

module.exports = { getBookmarks }

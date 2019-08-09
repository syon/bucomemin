const cheerio = require('cheerio')
const pptr = require('./pptr')

/**
 * スクレイピングしないと取得できないもの
 *   - 人気コメント
 *   - Twitter clicks
 */
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

module.exports = { scrapeHatebuPageData }

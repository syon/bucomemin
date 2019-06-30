const cheerio = require('cheerio')
const pptr = require('./pptr')

;(async () => {
  const html = await pptr('https://b.hatena.ne.jp/entry/s/www3.nhk.or.jp/news/html/20190621/k10011963241000.html')
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

  require('fs').writeFileSync('hhh.json', JSON.stringify({ populars, recents }, null, 2))
})().catch(e => {
  // Deal with the fact the chain failed
})

const debug = require('debug')
const axios = require('axios')
const cheerio = require('cheerio')
const DB = require('../logic/DB')

const dg = debug('app:daily')

// https://b.hatena.ne.jp/hotentry/all/20050210
// https://b.hatena.ne.jp/hotentry/it/20111206

module.exports = async () => {
  const category = 'it'
  const date = '20111206'
  const url = `https://b.hatena.ne.jp/hotentry/${category}/${date}`
  const res = await axios.get(url)
  const $ = cheerio.load(res.data, { decodeEntities: false })
  const entries = $('.entrylist-main .entrylist-contents')
    .map((idx, el) => {
      const main = $(el).find('.entrylist-contents-main')
      const url = $(main).find('.entrylist-contents-title a').attr('href')
      const title = $(main).find('.entrylist-contents-title a').attr('title')
      const popDate = $(main).find('.entrylist-contents-date').text()
      const ranking = idx + 1
      return { date, category, url, title, popDate, ranking }
    })
    .get()
  for (let e of entries) {
    dg(e)
    await DB.insertDailyHotentry(e)
  }

  return null
}

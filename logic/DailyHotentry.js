const axios = require('axios')
const cheerio = require('cheerio')

module.exports = class DailyHotentry {
  static async fetch(date, category) {
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
    return entries
  }
}

const debug = require('debug')
const axios = require('axios')
const cheerio = require('cheerio')

const dg = debug('app:DailyHotentry')
const API_EP = `https://hatena.now.sh/api`

module.exports = class DailyHotentry {
  static async fetch(date, category) {
    const list = await DailyHotentry._getEntrylist(date, category)
    const entries = []
    for (const e of list) {
      const u = `${API_EP}/bookmark/getEntryLite?url=${e.url}`
      const res = await axios.get(u)
      if (!res.data) {
        // TODO: Report
        console.warn('**** ERROR at getEntryLite ****', e)
        entries.push(e)
        continue
      }
      const { eid, entry_url: eurl, count: users } = res.data
      dg(eid, e.url)
      entries.push({ ...e, eid, eurl, users })
    }
    return entries
  }

  static async _getEntrylist(date, category) {
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

const debug = require('debug')
const DB = require('../logic/DB')
const DailyHotentry = require('../logic/DailyHotentry')

const dg = debug('app:daily')

// https://b.hatena.ne.jp/hotentry/all/20050210
// https://b.hatena.ne.jp/hotentry/it/20111206

module.exports = async () => {
  const category = 'it'
  const date = '20200717'
  const entries = await DailyHotentry.fetch(date, category)
  for (let e of entries) {
    dg(e)
    await DB.insertDailyHotentry(e)
  }
  return null
}

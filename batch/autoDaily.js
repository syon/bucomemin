const debug = require('debug')
const moment = require('moment')
const DB = require('../logic/DB')
const DailyHotentry = require('../logic/DailyHotentry')

const dg = debug('app:batch/autoDaily')
const category = 'all'
let date = '20200630'
const stopDate = '20200101'

;(async () => {
  while (Number(date) >= Number(stopDate)) {
    dg(`____ date ${date} ___________________________`)
    const entries = await DailyHotentry.fetch(date, category)
    for (let e of entries) {
      dg(e.title)
      await DB.insertDailyHotentry(e)
    }
    await new Promise((r) => setTimeout(r, 1000))
    date = moment(date, 'YYYYMMDD').add(-1, 'd').format('YYYYMMDD')
  }
})().catch((e) => {
  console.warn(e)
})

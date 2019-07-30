// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config()
const debug = require('debug')
const CronJob = require('cron').CronJob
const dg = debug('app:cron')
debug.enable('app:*')

const orderHandler = require('./handler/orderHandler')
const newbieHandler = require('./handler/newbieHandler')
const bridgeHandler = require('./handler/bridgeHandler')

dg('******** Hello! This is cron.js ********')

/**
 * 毎時 30 分 00 秒に実行
 */
// eslint-disable-next-line
new CronJob(
  '0 30 * * * *', // 毎時 30 分 00 秒
  // '*/10 * * * * *', // 10秒置き
  async () => {
    dg('\n\nStart cron job...')
    await orderHandler().catch(e => {
      dg(e)
    })
    dg('Done!', new Date().toLocaleString(), '\n\n')
  },
  null,
  true
)

/**
 * Newbie
 */
new CronJob(
  // 秒 分 時 日 月 曜
  '0 45 * * * *', // 毎時 45 分 00 秒
  async () => {
    dg('\n\n<< Start Newbie Cron >>')
    try {
      await newbieHandler()
      await bridgeHandler()
    } catch (e) {
      dg(e)
    }
    dg('Done!', new Date().toLocaleString(), '\n\n')
  },
  null,
  true
)

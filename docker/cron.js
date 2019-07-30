// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config()
const debug = require('debug')
const CronJob = require('cron').CronJob
const signBunny = require('sign-bunny')

const dg = debug('app:cron')
debug.enable('app:*')

const orderHandler = require('./handler/orderHandler')
const newbieHandler = require('./handler/newbieHandler')
const bridgeHandler = require('./handler/bridgeHandler')

dg('******** Hello! This is cron.js ********')
console.log(signBunny('Hello! This is cron.js'))

// https://crontab.guru/

new CronJob(
  '0 30 * * * *', // 毎時 30 分 00 秒
  // '*/10 * * * * *', // 10秒置き
  async () => {
    console.log(signBunny('Start Order Cron'))
    await orderHandler().catch(e => {
      dg(e)
    })
    console.log(signBunny(`Done! ${timestamp}`))
  },
  null,
  true
)

/**
 * Newbie
 */
new CronJob(
  // 秒 分 時 日 月 曜
  '0 40 * * * *', // 毎時 45 分 00 秒
  async () => {
    console.log(signBunny('Start Newbie Cron'))
    try {
      await newbieHandler()
      await bridgeHandler()
    } catch (e) {
      dg(e)
    }
    const timestamp = new Date().toLocaleString()
    console.log(signBunny(`Done! ${timestamp}`))
  },
  null,
  true
)

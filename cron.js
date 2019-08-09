/* eslint-disable no-new */
// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config()
const debug = require('debug')
const CronJob = require('cron').CronJob
const signBunny = require('sign-bunny')

const dg = debug('app:cron')
debug.enable('app:*')

const newbieHandler = require('./handler/newbieHandler')
const recentHandler = require('./handler/recentHandler')

bunny('Hello! cron.js is running.')

// https://crontab.guru/

/**
 * Recent
 */
new CronJob(
  '0 30 * * * *', // 毎時 30 分 00 秒
  async () => {
    bunny('Start Recent Cron')
    await recentHandler().catch(e => {
      dg(e)
    })
    const timestamp = new Date().toLocaleString()
    bunny(`Done! ${timestamp}`)
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
    bunny('Start Newbie Cron')
    try {
      await newbieHandler()
    } catch (e) {
      dg(e)
    }
    const timestamp = new Date().toLocaleString()
    bunny(`Done! ${timestamp}`)
  },
  null,
  true
)

function bunny(str) {
  console.log(signBunny(str))
}

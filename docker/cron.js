// eslint-disable-next-line node/no-unpublished-require
require('dotenv').config()
const debug = require('debug')
const CronJob = require('cron').CronJob
const dg = debug('app:cron')
debug.enable('app:*')

dg('******** Hello! This is cron.js ********')

/**
 * 毎時 30 分 00 秒に実行
 */
// eslint-disable-next-line
new CronJob(
  '0 30 * * * *',
  async () => {
    dg('\n\nStart cron job...')
    await 0
    // await news()
    // await nailWorker()
    dg('Done!', new Date().toLocaleString(), '\n\n')
  },
  null,
  true
)

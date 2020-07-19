const debug = require('debug')
const Promise = require('bluebird')
const DB = require('../logic/DB')

const dg = debug('app:HatenaEntryExd')

module.exports = class HatenaEntryExd {
  static async allUpdate() {
    const records = await DB.selectHatenaBookmarksEids()
    await DB.openConnection()
    await Promise.map(
      records,
      async (rec) => {
        const hostname = new URL(rec.url).hostname
        dg(hostname) // comment-out for more fast
        await DB.insertHatenaEntryExtd({ eid: rec.eid, domain: hostname })
      },
      {
        concurrency: 10,
      }
    )
    await DB.closeConnection()
    return null
  }
}

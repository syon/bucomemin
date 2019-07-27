const debug = require('debug')
const MyHatebu = require('./myhatebu')
const Storage = require('./storage')
const DB = require('./DB')

debug.enable('app:*')
const dg = debug('app:recent')

module.exports = class Recent {
  static async updateRecent(params) {
    // TODO: Decode Username ???
    const { user } = params
    // TODO: 月次取得
    const bookmarks = await MyHatebu.getRecentBookmarks({ user })
    // Storage.saveAsJson(`recent/${user}.json`, bookmarks)
    // TODO: transaction start
    for (const b of bookmarks) {
      dg(`[#updateDB] eid:(${b.eid})`)
      await DB.delinsUserBookmark({
        userid: user,
        eid: b.eid,
        url: b.url,
        timestamp: b.timestamp,
        comment: b.comment,
        tags: JSON.stringify(b.tags),
        starlen: b.stars.length
      })
    }
    // TODO: transaction end
  }

  static async updateYearly(params) {
    // TODO: Decode Username ???
    const { user } = params
    // TODO: 月次取得
    const bookmarks = await MyHatebu.get1YearBookmarks({ user })
    // Storage.saveAsJson(`recent/${user}.json`, bookmarks)
    // TODO: transaction start
    for (const b of bookmarks) {
      dg(`[#updateDB] eid:(${b.eid})`)
      await DB.delinsUserBookmark({
        userid: user,
        eid: b.eid,
        url: b.url,
        timestamp: b.timestamp,
        comment: b.comment,
        tags: JSON.stringify(b.tags),
        starlen: b.stars.length
      })
    }
    // TODO: transaction end
  }
}

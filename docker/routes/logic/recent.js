const debug = require('debug')
const MyHatebu = require('./myhatebu')
const Storage = require('./storage')
const DB = require('./DB')

debug.enable('app:*')
const dg = debug('app:recent')

module.exports = class Recent {
  static async main(params) {
    // TODO: Decode Username ???
    const { user } = params
    // TODO: 月次取得
    const bookmarks = await MyHatebu.getRecentBookmarks({ user })
    // Storage.saveAsJson(`recent/${user}.json`, bookmarks)
    Recent.updateDB(user, bookmarks)
  }

  static async updateDB(user, bookmarks) {
    // TODO: transaction start
    await DB.deleteRecentForUpdate({
      userid: user,
      date: '2019-07-22' // 5 days ago
    })
    for (const b of bookmarks) {
      dg(`[#updateDB] eid:(${b.eid})`)
      await DB.insertUserBookmark({
        userid: user,
        eid: b.eid,
        url: b.url,
        date: b.date
      })
      await DB.insertUserBookmarkDetail({
        userid: user,
        eid: b.eid,
        timestamp: b.timestamp,
        comment: b.comment,
        tags: JSON.stringify(b.tags),
        starlen: b.stars.length
      })
    }
    // TODO: transaction end
  }
}

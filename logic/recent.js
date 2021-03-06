const debug = require('debug')
const Promise = require('bluebird')
const MyHatebu = require('./myhatebu')
const DB = require('./DB')

debug.enable('app:*')
const dg = debug('app:recent')

/**
 * ---- MEMO ----
 * "Recent" は 直近５日間 と定義し、Yearlyまわりは別クラスに移行する。
 */

module.exports = class Recent {
  static async updateRecent(params) {
    // TODO: Decode Username ???
    const { user } = params
    const bookmarks = await MyHatebu.getRecentBookmarks({ user })
    await DB.openConnection()
    await Promise.map(bookmarks, Recent.updateBookmarkRecord, {
      concurrency: 5
    })
    await DB.closeConnection()
  }

  static async updateBookmarkRecord(bookmark) {
    const b = bookmark
    dg(`[#AzureDB] user:(${b.user}) eid:(${b.eid})`)
    await DB.delinsHatenaBookmark({
      eid: b.eid,
      eurl: b.eurl,
      title: b.title,
      url: b.url,
      users: b.count
    })
    await DB.delinsUserBookmark({
      userid: b.user,
      eid: b.eid,
      url: b.url,
      timestamp: b.timestamp,
      comment: b.comment,
      tags: JSON.stringify(b.tags),
      starlen: b.stars.length
    })
  }

  static async updateYearly(params) {
    // TODO: Decode Username ???
    const { user } = params
    // [ eid, url, date, title, eurl, count, comment, user, timestamp, tags, stars, uri ]
    const bookmarks = await MyHatebu.get1YearBookmarks({ user })
    await DB.openConnection()
    await Promise.map(bookmarks, Recent.updateBookmarkRecord, {
      concurrency: 5
    })
    await DB.closeConnection()
  }
}

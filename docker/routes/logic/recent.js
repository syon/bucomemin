const debug = require('debug')
const MyHatebu = require('./myhatebu')
const Bridge = require('./Bridge')
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
    // TODO: 月次取得
    const bookmarks = await MyHatebu.getRecentBookmarks({ user })
    // Storage.saveAsJson(`recent/${user}.json`, bookmarks)
    // TODO: transaction start
    for (const b of bookmarks) {
      dg(`[#updateDB] eid:(${b.eid})`)
      await DB.delinsHatenaBookmark({
        eid: b.eid,
        url: b.url,
        title: b.title,
        url: b.url,
        users: b.count
      })
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
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
    // TODO: transaction end
  }

  static async updateYearly(params) {
    // TODO: Decode Username ???
    const { user } = params
    // TODO: 月次取得
    // [ eid, url, date, title, eurl, count, comment, user, timestamp, tags, stars, uri ]
    const bookmarks = await MyHatebu.get1YearBookmarks({ user })
    // Storage.saveAsJson(`recent/${user}.json`, bookmarks)
    // TODO: transaction start
    for (const b of bookmarks) {
      dg(`[#updateDB] eid:(${b.eid})`)
      await DB.delinsHatenaBookmark({
        eid: b.eid,
        url: b.url,
        title: b.title,
        url: b.url,
        users: b.count
      })
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
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
    // TODO: transaction end
  }
}

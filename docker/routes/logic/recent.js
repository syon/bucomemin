const debug = require('debug')
const MyHatebu = require('./myhatebu')
const Storage = require('./storage')

debug.enable('app:*')
const dg = debug('app:recent')

module.exports = class Recent {
  static async main(params) {
    // TODO: Decode Username ???
    const { user } = params
    // TODO: 月次取得
    const results = await MyHatebu.getRecentBookmarks({ user })
    Storage.saveAsJson(`recent/${user}.json`, results)
  }
}

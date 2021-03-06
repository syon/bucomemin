const dg = require('debug')('app:Bridge')
const AzureDB = require('./DB')
const Firestore = require('./firestore')
const Storage = require('./storage')

module.exports = class Bridge {
  static async newProfile(userid) {
    dg('[#newProfile]')
    const prof = await AzureDB.selectUserProfile(userid)
    const obj = { profile: prof }
    await Firestore.set(`userdata/${userid}`, obj)
  }

  static async mirrorProfile(userid) {
    dg('[#mirrorProfile]')
    const prof = await AzureDB.selectUserProfile(userid)
    const obj = { profile: prof }
    await Firestore.update(`userdata/${userid}`, obj)
  }

  static async mirrorAnnualSummaly() {
    dg('[#mirrorAnnualSummaly]')
    const summaly = await AzureDB.selectAllAnnualSummaly()
    Object.keys(summaly).forEach(async userid => {
      const obj = { annual: summaly[userid] }
      // after profile
      await Firestore.update(`userdata/${userid}`, obj)
    })
  }

  static async mirrorRanking() {
    dg('[#mirrorRanking]')
    const ranking = await AzureDB.selectRanking()
    await Storage.saveJsonFile(ranking, `userdatalist/ranking.json`)
  }

  static async mirrorCalendar(user) {
    dg(`[#mirrorCalendar] (${user}) start`)
    const dataSet = await AzureDB.selectAnnualBookmarksByUser(user)
    dg(`[#mirrorCalendar] (${user}) Annual bookmarks count:`, dataSet.length)
    /* makeCalendarData */
    try {
      await Storage.saveJsonFile(dataSet, `calendar/${user}.json`)
    } catch (e) {
      dg(e)
    }
  }

  static async mirrorBubble(user) {
    dg(`[#mirrorBubble] (${user}) start`)
    const dataSet = await AzureDB.selectAnnualCommentsByUser(user)
    dg(`[#mirrorBubble] (${user}) Annual bookmarks count:`, dataSet.length)
    try {
      await Storage.saveJsonFile(dataSet, `bubble/${user}.json`)
    } catch (e) {
      dg(e)
    }
  }
}

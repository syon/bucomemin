const dg = require('debug')('app:Bridge')
const { db } = require('../../firebaseAdmin')
const AzureDB = require('./DB')
const Storage = require('./storage')

module.exports = class Bridge {
  static async mirrorAnnualSummaly() {
    dg('[#mirrorAnnualSummaly]')
    const summaly = await AzureDB.selectAllAnnualSummaly()
    dg(summaly)
    Object.keys(summaly).forEach(async userid => {
      const obj = summaly[userid]
      await db
        .doc(`annual/${userid}`)
        .set(obj)
        .catch(e => {
          console.error(e)
        })
    })
  }

  static async mirrorCalendar(user) {
    dg(`[#mirrorCalendar] (${user}) start`)
    const dataSet = await AzureDB.selectAnnualBookmarksByUser(user)
    dg(`[#mirrorCalendar] (${user}) Annual bookmarks count:`, dataSet.length)
    /* makeCalendarData */
    try {
      const result = {}
      for (const d of dataSet) {
        dg(d)
        const key = new Date(d.date).getTime() / 1000
        result[key] = d.count
      }
      await Storage.saveJsonFile(result, `calendar/${user}.json`)
    } catch(e) {
      dg(e)
    }
  }

  static async mirrorBubble(user) {
    dg(`[#mirrorBubble] (${user}) start`)
    const dataSet = await AzureDB.selectAnnualCommentsByUser(user)
    dg(`[#mirrorBubble] (${user}) Annual bookmarks count:`, dataSet.length)
    try {
      await Storage.saveJsonFile(dataSet, `bubble/${user}.json`)
    } catch(e) {
      dg(e)
    }
  }
}

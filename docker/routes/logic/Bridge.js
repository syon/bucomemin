const dg = require('debug')('app:Bridge')
const { db } = require('../../firebaseAdmin')
const AzureDB = require('./DB')

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
}

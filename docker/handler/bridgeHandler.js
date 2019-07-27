const dg = require('debug')('app:bridgeHandler')
const { db } = require('../firebaseAdmin')
const AzureDB = require('../routes/logic/DB')

module.exports = async () => {
  dg('[#bridgeHandler] start')
  const summaly = await AzureDB.selectAllAnnualSummaly()
  dg(summaly)
  Object.keys(summaly).forEach(async userid => {
    const rec = summaly[userid]
    await saveAnnualSummaly(userid, rec)
  })
}

async function saveAnnualSummaly(user, obj) {
  dg('[#saveAnnualSummaly]', user)
  await db
    .doc(`annual/${user}`)
    .set(obj)
    .catch(e => {
      console.error(e)
    })
}

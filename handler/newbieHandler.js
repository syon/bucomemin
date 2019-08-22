const dg = require('debug')('app:newbieHandler')

const { DB } = require('../logic/firebaseAdmin')
const Ask = require('../logic/Ask')
const Recent = require('../logic/recent')
const Analyze = require('../logic/analyze')
const Bridge = require('../logic/Bridge')
const Firestore = require('../logic/firestore')
const AzureDB = require('../logic/DB')

module.exports = async () => {
  dg('[#newbieHandler] start')
  const docSet = await Firestore.fetchDocSet('newbie')
  const orders = Object.keys(docSet).map(x => ({ id: x, ...docSet[x] }))
  dg(orders)

  // if (orders.length === 0) return
  for (const { id: user } of orders) {
    dg(`$$$$$$$$ N E W B I E  - ${user} -  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$`)
    await Recent.updateYearly({ user })
  }

  dg('- - - - - - - - - - - - - - - - - - - - -')
  await AzureDB.updateUserProfileCP()

  /* Bridge */
  for (const { id: user } of orders) {
    await Ask.updateUserProfile({ user })
    await Bridge.newProfile(user)
    await Bridge.mirrorProfile(user)
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
    await removeOrder(user)
  }
  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
  await Bridge.mirrorRanking()
}

async function removeOrder(id) {
  return await DB.collection('newbie')
    .doc(id)
    .delete()
    .catch(error => {
      dg('Error removing document: ', error)
    })
}

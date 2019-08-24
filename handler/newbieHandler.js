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

  const newbies = []
  for (const o of orders) {
    const user = o.id
    const up = await AzureDB.selectUserProfile(user)
    if (up.userid && !o.force) {
      dg('SKIP', user)
      await removeOrder(user)
      continue
    }
    newbies.push(o)
  }

  // if (orders.length === 0) return
  for (let i = 0; i < newbies.length; i++) {
    const o = newbies[i]
    const user = o.id
    dg(`$$$$$$$$ [${i}/${newbies.length}] NEWBIE  - ${user} -  $$$$$$$$$$$$$$$`)
    const up = await AzureDB.selectUserProfile(user)
    if (up.userid && !o.force) {
      continue
    }
    await Ask.updateUserProfile({ user })
    await Recent.updateYearly({ user })
  }

  dg('- - - - - - - - - - - - - - - - - - - - -')
  await AzureDB.updateUserProfileCP()

  /* Bridge */
  for (const { id: user } of orders) {
    await Bridge.newProfile(user)
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

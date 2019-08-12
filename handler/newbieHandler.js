const dg = require('debug')('app:newbieHandler')

const { DB } = require('../logic/firebaseAdmin')
const Ask = require('../logic/Ask')
const Recent = require('../logic/recent')
const Analyze = require('../logic/analyze')
const Bridge = require('../logic/Bridge')
const Firestore = require('../logic/firestore')

module.exports = async () => {
  dg('[#newbieHandler] start')
  const docSet = await Firestore.fetchDocSet('newbie')
  const orders = Object.keys(docSet).map(x => ({ id: x, ...docSet[x] }))
  dg(orders)
  if (orders.length === 0) return
  for (const x of orders) {
    const user = x.id
    dg('$$$$ Annual summary $$$$', user)
    await Ask.updateUserProfile({ user })
    await Bridge.newProfile(user)
    await Bridge.mirrorProfile(user)
    await Recent.updateYearly({ user })
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
    await removeOrder(x.id)
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

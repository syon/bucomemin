const dg = require('debug')('app:newbieHandler')

const { DB } = require('../logic/firebaseAdmin')
const Ask = require('../logic/Ask')
const Recent = require('../logic/recent')
const Analyze = require('../logic/analyze')
const Bridge = require('../logic/Bridge')

module.exports = async () => {
  dg('[#newbieHandler] start')
  const orders = await fetchOrders()
  if (orders.length === 0) return
  for (const x of orders) {
    const user = x.id
    dg('$$$$ Annual summary $$$$', user)
    await Ask.updateUserProfile({ user })
    await Bridge.newProfile(user)
    await Bridge.mirrorProfile(user)
    await Recent.updateYearly({ user })
    await Bridge.mirrorBubble(user)
    await removeOrder(x.id)
  }
  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
}

async function fetchOrders() {
  const result = await DB.collection('newbie')
    .limit(10)
    .get()
    .then(querySnapshot => {
      const orders = []
      querySnapshot.forEach(doc => {
        const id = doc.id
        const obj = doc.data()
        orders.push({ id, ...obj })
      })
      return orders
    })
    .catch(error => {
      dg(`Firebase NG`, error)
    })
  dg(result)
  return result
}

async function removeOrder(id) {
  return await DB.collection('newbie')
    .doc(id)
    .delete()
    .catch(error => {
      dg('Error removing document: ', error)
    })
}

const dg = require('debug')('app:newbieHandler')
const { db } = require('../firebaseAdmin')

const Ask = require('../routes/logic/Ask')
const Recent = require('../routes/logic/recent')
const Analyze = require('../routes/logic/analyze')
const Bridge = require('../routes/logic/Bridge')

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
  const result = await db
    .collection('newbie')
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
  return await db
    .collection('newbie')
    .doc(id)
    .delete()
    .catch(error => {
      dg('Error removing document: ', error)
    })
}

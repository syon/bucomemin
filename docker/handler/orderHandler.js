const request = require('request-promise-native')
const dg = require('debug')('app:orderHandler')
const { db } = require('../firebaseAdmin')

module.exports = async () => {
  dg('[#orderHandler] start')
  const orders = await fetchOrders()
  const options = {
    method: 'POST',
    json: true
  }
  orders.forEach(async x => {
    const user = x.id
    options.uri = 'http://localhost:3444/recent'
    options.body = { user }
    dg('[#orderHandler] Request:', user)
    await request(options)
    await removeOrder(user)
    dg('[#orderHandler] Success:', user)
  })
}

async function fetchOrders() {
  const result = await db
    .collection('orders')
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
    .collection('orders')
    .doc(id)
    .delete()
    .catch(error => {
      dg('Error removing document: ', error)
    })
}
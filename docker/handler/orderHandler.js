const request = require('request-promise-native')
const { db } = require('../firebaseAdmin')
const dg = require('debug')('app:orderHandler')

module.exports = async () => {
  const orders = await fetchOrders()
  const options = {
    method: 'POST',
    json: true
  }
  orders.forEach(async x => {
    options.uri = 'http://localhost:3444/recent'
    options.body = { user: x.id }
    await request(options)
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

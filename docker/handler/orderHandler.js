const request = require('request-promise-native')
const dg = require('debug')('app:orderHandler')
const { db } = require('../firebaseAdmin')

/**
 * ---- MEMO ----
 * このハンドラは直近５日間の更新を担っている。
 * 実際に自動運用となると、更新対象者は現在DBに保管しているユーザー情報の
 * 最終更新日を見て順次処理すべきものである。オーダーは現状Firestoreにあるが、
 * これは最終更新日を絡むに持ったRDBに寄せたほうがよい。
 * 常時稼働サーバは更新日の古いユーザをフェッチし、常に更新し続ければよい。
 * あとは処理がユーザー数に追いつくかどうかの話である。
 */

module.exports = async () => {
  dg('[#orderHandler] start')
  const orders = await fetchOrders()
  const options = {
    method: 'POST',
    json: true
  }
  for (let x of orders) {
    const user = x.id
    options.uri = 'http://localhost:3444/recent'
    options.body = { user }
    dg('[#orderHandler] Request:', user)
    await request(options)
    await removeOrder(user)
    dg('[#orderHandler] Success:', user)
  }
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

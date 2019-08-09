const debug = require('debug')
const { db } = require('../../firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:firestore')

module.exports = class Firestore {
  static async set(path, obj) {
    dg(`[#set] ${path}`)
    await db
      .doc(path)
      .set(obj)
      .catch(e => {
        console.error(path)
        console.error(obj)
        console.error(e.toString())
      })
  }

  static async update(path, obj) {
    dg(`[#update] ${path}`)
    await db
      .doc(path)
      .update(obj)
      .catch(e => {
        console.error(path)
        console.error(obj)
        console.error(e.toString())
      })
  }
}

const debug = require('debug')
const { DB } = require('./firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:firestore')

module.exports = class Firestore {
  static async set(path, obj) {
    dg(`[#set] ${path}`)
    await DB.doc(path)
      .set(obj)
      .catch(e => {
        console.error(path)
        console.error(obj)
        console.error(e.toString())
      })
  }

  static async update(path, obj) {
    dg(`[#update] ${path}`)
    await DB.doc(path)
      .update(obj)
      .catch(e => {
        console.error(path)
        console.error(obj)
        console.error(e.toString())
      })
  }
}

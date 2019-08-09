const debug = require('debug')
const { storage } = require('./firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:storage')
const bucket = storage.bucket('gs://lobine-a91c5.appspot.com/')

module.exports = class Storage {
  static async saveAsJson(path, obj) {
    const jsonStr = JSON.stringify(obj, null, 2)
    const file = bucket.file(path)
    await file.save(jsonStr)
  }

  static async saveJsonFile(data, path) {
    dg('[#saveJsonFile]', path)
    const jsonStr = JSON.stringify(data, null, 2)
    const file = bucket.file(path)
    await file.save(jsonStr)
    await file.setMetadata({ metadata: 'application/json' })
    dg('[#saveJsonFile] Success')
  }

  static async loadJsonFile(path) {
    dg('[#loadJsonFile]', path)
    const file = bucket.file(path)
    const buf = await file.download()
    const jsonStr = buf.toString()
    const data = JSON.parse(jsonStr)
    dg('[#loadJsonFile] Success')
    return data
  }
}

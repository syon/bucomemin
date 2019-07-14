const debug = require('debug')
const MyHatebu = require('../batch/myhatebu')
const { storage } = require('./firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:hello')
const bucket = storage.bucket('gs://bmin-faf7e.appspot.com/')

const user = 'Dy66'

module.exports = async (req, res, next) => {
  dg('==== hello.js ====')
  const results = await MyHatebu.getBookmarks({ user })
  const jsonStr = JSON.stringify(results, null, 2)
  const file = bucket.file(`users/${user}.json`)
  await file.save(jsonStr)
  res.end('Hello!')
}

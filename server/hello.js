const qs = require('qs')
const debug = require('debug')
const MyHatebu = require('../batch/myhatebu')
const { storage } = require('./firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:hello')
const bucket = storage.bucket('gs://bmin-faf7e.appspot.com/')

module.exports = async (req, res, next) => {
  dg('==== hello.js ====')
  // URL: /hello?user=sample
  const params = qs.parse(req.url.replace(/^\/\?/, ''))
  dg(params)
  const { user } = params
  const results = await MyHatebu.getBookmarks({ user })
  const jsonStr = JSON.stringify(results, null, 2)
  const file = bucket.file(`users/recent/${user}.json`)
  await file.save(jsonStr)
  // TODO: Encode Username ???
  res.writeHead(301, { Location: `/analyze?user=${user}` })
  res.end()
}

const debug = require('debug')
const dg = debug('app:db')
debug.enable('app:*')

const DB = require('../logic/DB')

;(async () => {
  const user = 'Dy66'
  const result = await DB.selectOldestTimestampBookmark(user)
  dg(result)
})().catch(e => {
  dg(e)
})

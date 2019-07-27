const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const MyHatebu = require('../routes/logic/myhatebu')

;(async () => {
  const params = { user: 'Dy66' }
  const result = await MyHatebu.getRecentBookmarks(params)
  dg(result)
})().catch(e => {
  console.warn(e)
})

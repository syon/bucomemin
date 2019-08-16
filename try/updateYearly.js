const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Recent = require('../logic/recent')

;(async () => {
  const params = { user: 'hirahirahirara' }
  const result = await Recent.updateYearly(params)
  dg(result)
})().catch(e => {
  console.warn(e)
})

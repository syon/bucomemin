const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Recent = require('../routes/logic/recent')

;(async () => {
  const params = { user: 'Dy66' }
  const result = await Recent.updateYearly(params)
  dg(result)
})().catch(e => {
  console.warn(e)
})

const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const MyHatebu = require('../routes/logic/myhatebu')
const Hatena = require('../routes/logic/hatena')

;(async () => {
  const result = await Hatena.User.getProfile({ user: 'syonx' })
  dg(result)
})().catch(e => {
  console.warn(e)
})

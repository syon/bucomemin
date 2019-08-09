const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const MyHatebu = require('../logic/myhatebu')
const Hatena = require('../logic/hatena')

;(async () => {
  const result = await Hatena.User.getProfile({ user: 'syonx' })
  dg(result)
})().catch(e => {
  console.warn(e)
})

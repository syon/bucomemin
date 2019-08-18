const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Hatena = require('../logic/hatena')

;(async () => {
  const result = await Hatena.Star.getTotalBookmarkStarCount({ user: 'Dy66' })
  dg(result)
})().catch(e => {
  dg(e)
})

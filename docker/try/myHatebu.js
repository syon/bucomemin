const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const MyHatebu = require('../routes/logic/myhatebu')
const Hatena = require('../routes/logic/hatena')

;(async () => {
  const rawPageUrl = 'https://twitter.com/onoda_kimi/status/1156375827237367808'
  // const rawPageUrl = 'https://anond.hatelabo.jp/20190731125816'
  const result = await Hatena.Bookmark.getEntryLite(rawPageUrl)
  dg(result)
})().catch(e => {
  console.warn(e)
})

const debug = require('debug')
const dg = debug('app:db')
debug.enable('app:*')

const DB = require('../logic/DB')

;(async () => {
  const user = 'Dy66'
  await DB.selectAllAnnualSummaly()
    .then(result => {
      dg(result)
    })
    .catch(e => {
      dg(e)
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

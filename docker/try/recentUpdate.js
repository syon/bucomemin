const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Recent = require('../routes/logic/recent')

;(async () => {
  const params = { user: 'Dy66' }
  await Recent.updateRecent(params)
    .then(result => {
      dg(result)
    })
    .catch(e => {
      dg(e)
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

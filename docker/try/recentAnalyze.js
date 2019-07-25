const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Analyze = require('../routes/logic/analyze')

;(async () => {
  const user = 'Dy66'
  await Analyze.main({ user })
    .then(result => {
      dg(result)
    })
    .catch(e => {
      dg(e)
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

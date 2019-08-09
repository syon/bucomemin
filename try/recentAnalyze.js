const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Analyze = require('../logic/analyze')

;(async () => {
  await Analyze.main()
    .then(result => {
      dg(result)
    })
    .catch(e => {
      dg(e)
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

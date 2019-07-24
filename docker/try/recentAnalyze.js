const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Recent = require('../routes/logic/recent')

;(async () => {
  const user = 'Dy66'
  await Recent.calcTheRate({ user })
    .then(result => {
      res.json(result)
    })
    .catch(e => {
      res.status(500).send(e.toString())
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

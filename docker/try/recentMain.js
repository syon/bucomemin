const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Recent = require('../logic/recent')

;(async () => {
  const params = req.body
  await Recent.main(params)
    .then(result => {
      res.json(result)
    })
    .catch(e => {
      res.status(500).send(e.toString())
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

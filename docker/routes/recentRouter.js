const express = require('express')
const router = express.Router()
const Recent = require('./logic/recent')

router.post('/', async (req, res, next) => {
  const params = req.body
  await Recent.updateRecent(params)
    .then(result => {
      res.json(result)
    })
    .catch(e => {
      res.status(500).send(e.toString())
    })
})

module.exports = router

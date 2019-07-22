require('dotenv').config()
const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const orderHandler = require('../handler/orderHandler')

;(async () => {
  await orderHandler().catch(e => {
    dg(e)
  })
})().catch(e => {
  // Deal with the fact the chain failed
})

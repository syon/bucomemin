require('debug').enable('app:*')
const bridgeHandler = require('../handler/bridgeHandler')

;(async () => {
  const text = await bridgeHandler()
  console.log(text)
})().catch(e => {
  // Deal with the fact the chain failed
  console.warn(e)
})

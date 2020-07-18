require('debug').enable('app:*')
const dailyHandler = require('../handler/dailyHandler')

;(async () => {
  const result = await dailyHandler()
  console.log(result)
})().catch((e) => {
  // Deal with the fact the chain failed
  console.warn(e)
})

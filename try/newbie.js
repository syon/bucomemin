require('debug').enable('app:*')
const newbieHandler = require('../handler/newbieHandler')

;(async () => {
  const result = await newbieHandler()
  console.log(result)
})().catch(e => {
  // Deal with the fact the chain failed
  console.warn(e)
})

require('debug').enable('app:*')
const recentHandler = require('../handler/recentHandler')

;(async () => {
  const result = await recentHandler()
  console.log(result)
})().catch(e => {
  console.warn(e)
})

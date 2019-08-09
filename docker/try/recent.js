require('debug').enable('app:*')
// const recentHandler = require('../handler/recentHandler')
const Recent = require('../routes/logic/recent')

;(async () => {
  // await recentHandler()
  Recent.updateByUser('hiby')
})().catch(e => {
  console.warn(e)
})

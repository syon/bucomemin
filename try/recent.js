require('debug').enable('app:*')
const recentHandler = require('../handler/recentHandler')
// const Recent = require('../routes/logic/recent')

;(async () => {
  await recentHandler()
  // await Recent.updateByUser('aukusoe')
})().catch(e => {
  console.warn(e)
})
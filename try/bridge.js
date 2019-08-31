require('debug').enable('app:*')
const Bridge = require('../logic/Bridge')

;(async () => {
  // await Bridge.mirrorBubble('pikopikopan')
  // await Bridge.mirrorAnnualSummaly()
  await Bridge.mirrorRanking()
})().catch(e => {
  // Deal with the fact the chain failed
  console.warn(e)
})

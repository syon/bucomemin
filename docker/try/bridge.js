require('debug').enable('app:*')
const Bridge = require('../routes/logic/Bridge')

;(async () => {
  await Bridge.mirrorProfile('syonx')
  const result = await Bridge.mirrorAnnualSummaly()
  console.log(result)
})().catch(e => {
  // Deal with the fact the chain failed
  console.warn(e)
})

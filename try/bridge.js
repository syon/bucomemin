require('debug').enable('app:*')
const Bridge = require('../logic/Bridge')

;(async () => {
  await Bridge.mirrorAllProfiles()
})().catch(e => {
  // Deal with the fact the chain failed
  console.warn(e)
})

require('debug').enable('app:*')
const Recent = require('../logic/recent')

;(async () => {
  // await Recent.updateYearly({ user: 'Dy66' })
  await Recent.updateRecent({ user: 'Dy66' })
})().catch(e => {
  console.warn(e)
})

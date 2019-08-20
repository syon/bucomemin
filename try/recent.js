require('debug').enable('app:*')
const recentHandler = require('../handler/recentHandler')
// const Recent = require('../logic/recent')

;(async () => {
  await recentHandler()
  // await Recent.updateYearly({ user: 'Dy66' })
  // await Recent.updateRecent({ user: 'Dy66' })
})().catch(e => {
  console.warn(e)
})

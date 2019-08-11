require('debug').enable('app:*')
const recentHandler = require('../handler/recentHandler')
// const Recent = require('../logic/recent')

;(async () => {
  await recentHandler()
  // await Recent.updateYearly({ user: 'vlxst1224' })
})().catch(e => {
  console.warn(e)
})

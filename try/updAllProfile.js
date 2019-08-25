require('debug').enable('app:*')
const Promise = require('bluebird')
const Ask = require('../logic/Ask')
const AzureDB = require('../logic/DB')
const Bridge = require('../logic/Bridge')
const Analyze = require('../logic/analyze')

;(async () => {
  const arr = await AzureDB.selectAllTargets()
  console.log(arr)
  for (let i = 0; i < arr.length; i++) {
    const user = arr[i].userid
    await Ask.updateUserProfile({ user })
  }

  await AzureDB.updateUserProfileCP()

  // TODO: Use connection pool
  const theFunc = async x => {
    await Bridge.newProfile(x.userid)
    await Bridge.mirrorCalendar(x.userid)
    await Bridge.mirrorBubble(x.userid)
  }
  await Promise.each(arr, theFunc) // { concurrency: 5 }

  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
  await Bridge.mirrorRanking()
})().catch(e => {
  console.warn(e)
})

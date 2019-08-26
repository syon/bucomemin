require('debug').enable('app:*')
const Bridge = require('../logic/Bridge')
const Analyze = require('../logic/analyze')
const AzureDB = require('../logic/DB')

const arr = [
  'Agrius_Akita',
  'Capricornus',
  'CARNE',
  'Fubar',
  'Futaro99',
  'Gelsy',
  'K-Ono'
]

;(async () => {
  await AzureDB.updateUserProfileCP()
  for (const user of arr) {
    await Bridge.newProfile(user)
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
  }
  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
  await Bridge.mirrorRanking()
})().catch(e => {
  console.warn(e)
})

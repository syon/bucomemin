const Firestore = require('../logic/firestore')
// const DB = require('../logic/DB')

const arr = [
  'teracy_junk',
  'mats3003',
  'teruyastar',
  'bengal00',
  'Domino-R',
  'mahal',
  'Fuggi',
  'blueeyedpenguin',
  'vanish_l2',
  'doroyamada',
  'timetrain',
  'six13',
  'lli',
  'oyagee1120',
  'RyanRyan',
  'guldeen',
  'sakidatsumono',
  'pandaporn',
  'augsUK',
  'mobits'
]

;(async () => {
  // const arr = await DB.selectTargetsForUpdate()
  for (const a of arr) {
    const user = a // a.userid
    await Firestore.set(`newbie/${user}`, { from: 'try' })
  }
})().catch(e => {
  console.warn(e)
})

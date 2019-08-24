const Firestore = require('../logic/firestore')
// const DB = require('../logic/DB')

const arr = [
  'gabill',
  'mon_sat',
  'sue445',
  't-cyrill',
  'Akkiesoft',
  'mohri',
  'kenken610',
  'yoiIT',
  'delphinus35',
  'iwasiman',
  'instores',
  'abyssgate',
  'dekaino',
  'matsuwo',
  'Hamukoro',
  'circled',
  'mayumayu_nimolove',
  'aaaaiyaaaa',
  'REV',
  'yu-kubo',
  'netcraft3',
  'youichirou',
  'jiro68',
  'i408978',
  'programmablekinoko',
  'stella_nf',
  'shinjukukumin',
  'mayumayu_nimolove',
  'hobbiel55',
  'leokun0210',
  'katsusuke',
  'surume000',
  'arebouya',
  'mkusunok'
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

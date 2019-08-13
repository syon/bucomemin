const Firestore = require('../logic/firestore')

const users = [
  'afuro0307',
  'AKIMOTO',
  'anguilla',
  'apipix',
  'AQM',
  'aukusoe',
  'Ayrtonism',
  'catryoshka',
  'citron_908',
  'Cujo',
  'dgen',
  'duckt',
  'dusttrail',
  'Dy66',
  'early48',
  'FFF',
  'Hamachiya2',
  'hiby',
  'i_ko10mi',
  'ichi88',
  'kaputte',
  'kasekii',
  'keidge',
  'kk23',
  'koko_0',
  'kurauni',
  'LM-7',
  'mame00714',
  'masumizaru',
  'mikemade',
  'ockeghem',
  'pulltop-birth',
  'quick_past',
  'rokkakuika',
  'rou_oz',
  'shields-pikes',
  'snapchat',
  'stp7',
  'syonx',
  'takeori',
  'tomonotecho',
  'tzk2106',
  'vlxst1224',
  'wasarasan',
  'white_cake',
  'whkr',
  'yetch'
]

;(async () => {
  for (const user of users) {
    await Firestore.set(`newbie/${user}`, { from: 'try' })
  }
})().catch(e => {
  console.warn(e)
})

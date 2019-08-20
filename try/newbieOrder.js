const Firestore = require('../logic/firestore')
// const DB = require('../logic/DB')

const arr = [
  'vlxst1224',
  'masumizaru',
  'pptppc2',
  'nagatafe',
  'kidspong',
  'xevra',
  'koenjilala',
  'kash06',
  'death6coin',
  'hobo_king',
  'ffrog',
  'watto',
  'sukekyo',
  'sangping',
  'amatou310',
  'atsushimissingl',
  'jou2',
  'youco45',
  'otihateten3510',
  'primedesignworks',
  'zeromoon0'
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

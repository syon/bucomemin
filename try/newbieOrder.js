const Firestore = require('../logic/firestore')
const DB = require('../logic/DB')

;(async () => {
  const arr = await DB.selectTargetsForUpdate()
  for (const a of arr) {
    const user = a.userid
    await Firestore.set(`newbie/${user}`, { from: 'try' })
  }
})().catch(e => {
  console.warn(e)
})

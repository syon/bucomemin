require('debug').enable('app:*')
const Ask = require('../logic/Ask')
const DB = require('../logic/DB')

;(async () => {
  const arr = await DB.selectTargetsForUpdate()
  console.log(arr)
  for (const a of arr) {
    const user = a.userid
    await Ask.updateUserProfile({ user })
  }
})().catch(e => {
  console.warn(e)
})

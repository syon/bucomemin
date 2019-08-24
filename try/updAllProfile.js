require('debug').enable('app:*')
const Ask = require('../logic/Ask')
const DB = require('../logic/DB')

;(async () => {
  const arr = await DB.selectAllTargets()
  console.log(arr)
  for (let i = 0; i < arr.length; i++) {
    const user = arr[i].userid
    await Ask.updateUserProfile({ user })
  }
})().catch(e => {
  console.warn(e)
})

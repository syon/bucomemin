require('debug').enable('app:*')
const Ask = require('../logic/Ask')

;(async () => {
  await Ask.updateUserProfile({ user: 'Dy66' })
})().catch(e => {
  console.warn(e)
})

require('debug').enable('app:*')
const Ask = require('../logic/Ask')

const arr = ['afuro0307', 'anguilla', 'apipix', 'aukusoe', 'citron_908']

;(async () => {
  for (const user of arr) {
    await new Promise(r => setTimeout(r, 1000))
    await Ask.updateUserProfile({ user })
  }
})().catch(e => {
  console.warn(e)
})

const debug = require('debug')
const dg = debug('app:db')
debug.enable('app:*')

const DB = require('../routes/logic/DB')

;(async () => {
  const user = 'Dy66'
  await DB.selectMaxTimestampOfUserBookmark(user)
    .then(result => {
      dg(result)
    })
    .catch(e => {
      dg(e)
    })
})().catch(e => {
  // Deal with the fact the chain failed
})

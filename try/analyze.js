const debug = require('debug')
const dg = debug('app:try')
debug.enable('app:*')

const Analyze = require('../logic/analyze')

;(async () => {
  const result = await Analyze.main()
  dg(result)
})().catch(e => {
  dg(e)
})

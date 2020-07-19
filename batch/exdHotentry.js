const HatenaEntryExd = require('../logic/HatenaEntryExd')

;(async () => {
  await HatenaEntryExd.allUpdate()
})().catch((e) => {
  console.warn(e)
})

const dg = require('debug')('app:recentHandler')

const AzureDB = require('../routes/logic/DB')
const Ask = require('../routes/logic/Ask')
const Recent = require('../routes/logic/recent')
const Bridge = require('../routes/logic/Bridge')

module.exports = async () => {
  dg('[#recentHandler] start')
  const orders = await AzureDB.selectTargetsForUpdate()
  if (orders.length === 0) return
  for (const x of orders) {
    const user = x.userid
    dg('$$$$ Annual summary $$$$', user)
    await Ask.updateUserProfile({ user })
    await Bridge.newProfile(user)
    await Bridge.mirrorProfile(user)
    await Recent.updateRecent({ user })
    await Bridge.mirrorBubble(user)
  }
}

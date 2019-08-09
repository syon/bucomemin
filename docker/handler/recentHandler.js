const dg = require('debug')('app:recentHandler')

const AzureDB = require('../routes/logic/DB')
const Recent = require('../routes/logic/recent')

module.exports = async () => {
  dg('[#recentHandler] start')
  const orders = await AzureDB.selectTargetsForUpdate()
  if (orders.length === 0) return
  for (const x of orders) {
    const user = x.userid
    await Recent.updateByUser(user)
  }
}

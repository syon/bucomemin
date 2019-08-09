const dg = require('debug')('app:recentHandler')

const AzureDB = require('../routes/logic/DB')
const Recent = require('../routes/logic/recent')
const Analyze = require('../routes/logic/analyze')
const Bridge = require('../routes/logic/Bridge')

/**
 * ---- MEMO ----
 * このハンドラは直近５日間の更新を担っている。
 * 実際に自動運用となると、更新対象者は現在DBに保管しているユーザー情報の
 * 最終更新日を見て順次処理すべきものである。オーダーは現状Firestoreにあるが、
 * これは最終更新日を絡むに持ったRDBに寄せたほうがよい。
 * 常時稼働サーバは更新日の古いユーザをフェッチし、常に更新し続ければよい。
 * あとは処理がユーザー数に追いつくかどうかの話である。
 */

module.exports = async () => {
  dg('[#recentHandler] start')
  const orders = await AzureDB.selectTargetsForUpdate()
  if (orders.length === 0) return
  for (const x of orders) {
    const user = x.userid
    await Recent.updateByUser(user)
  }
  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
}

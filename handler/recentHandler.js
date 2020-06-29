const dg = require('debug')('app:recentHandler')

const Ask = require('../logic/Ask')
const AzureDB = require('../logic/DB')
const Recent = require('../logic/recent')
const Analyze = require('../logic/analyze')
const Bridge = require('../logic/Bridge')

/**
 * ---- MEMO ----
 * このハンドラは直近５日間の更新を担っている。
 * 実際に自動運用となると、更新対象者は現在DBに保管しているユーザー情報の
 * 最終更新日を見て順次処理すべきものである。オーダーは現状Firestoreにあるが、
 * これは最終更新日をカラムに持ったRDBに寄せたほうがよい。
 * 常時稼働サーバは更新日の古いユーザをフェッチし、常に更新し続ければよい。
 * あとは処理がユーザー数に追いつくかどうかの話である。
 */

module.exports = async () => {
  dg('[#recentHandler] start')
  const orders = await AzureDB.selectTargetsForUpdate()
  if (orders.length === 0) return
  for (let i = 0; i < orders.length; i++) {
    const x = orders[i]
    const user = x.userid
    dg('-- <<Recent>> 1st Phase ----------------------------')
    dg(`$$$$ [${i}/${orders.length}] ${user} $$$$`)
    dg('----------------------------------------------------')
    await Ask.updateUserProfile({ user })
    await Bridge.newProfile(user)
    await Recent.updateRecent({ user })
  }

  dg('- - - - - - - - - - - - - - - - - - - - -')
  await AzureDB.updateUserProfileCP()

  for (let i = 0; i < orders.length; i++) {
    const x = orders[i]
    const user = x.userid
    dg('-- <<Recent>> Last Phase ---------------------------')
    dg(`$$$$ [${i}/${orders.length}] <<Recent>> ${user} $$$$`)
    dg('----------------------------------------------------')
    await Bridge.mirrorProfile(user)
    await Bridge.mirrorCalendar(user)
    await Bridge.mirrorBubble(user)
  }
  await Analyze.main()
  await Bridge.mirrorAnnualSummaly()
  await Bridge.mirrorRanking()
}

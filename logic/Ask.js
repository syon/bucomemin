const dg = require('debug')('app:Ask')
const DB = require('./DB')
const Hatena = require('./hatena')
const MyHatebu = require('./myhatebu')

module.exports = class Ask {
  static async updateUserProfile({ user }) {
    dg(`Hatena.User.getProfile...`)
    const pr = await Hatena.User.getProfile({ user })
    dg(`Hatena.Bookmark.getOverview...`)
    const ov = await Hatena.Bookmark.getOverview(user)
    dg(`MyHatebu.getFirstBookmarkDate...`)
    const fd = await MyHatebu.getFirstBookmarkDate(
      user,
      ov ? ov.user.total_bookmarks : null
    )
    dg(`Hatena.Star.getTotalBookmarkStarCount...`)
    const st = await Hatena.Star.getTotalBookmarkStarCount({ user })
    const timestamp = new Date()
    const arg = {
      userid: user,
      name: pr.nickname,
      birthday: fd,
      totalBookmarks: ov ? ov.user.total_bookmarks : null,
      totalFollowers: ov ? ov.user.total_followers : null,
      totalFollowings: ov ? ov.user.total_followings : null,
      totalStarYellow: st ? st.count.yellow : null,
      totalStarGreen: st ? st.count.green : null,
      totalStarRed: st ? st.count.red : null,
      totalStarBlue: st ? st.count.blue : null,
      totalStarPurple: st ? st.count.purple : null,
      timestamp
    }
    await DB.delinsUserProfile(arg)
  }
}

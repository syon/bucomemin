const DB = require('./DB')
const Hatena = require('./hatena')

module.exports = class Ask {
  static async updateUserProfile({ user }) {
    const pr = await Hatena.User.getProfile({ user })
    const ov = await Hatena.Bookmark.getOverview(user)
    const st = await Hatena.Star.getTotalBookmarkStarCount({ user })
    const timestamp = new Date()
    const arg = {
      userid: user,
      name: pr.nickname,
      totalBookmarks: ov.user.total_bookmarks,
      totalFollowers: ov.user.total_followers,
      totalFollowings: ov.user.total_followings,
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

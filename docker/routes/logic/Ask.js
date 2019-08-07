const DB = require('./DB')
const Hatena = require('./hatena')

module.exports = class Ask {
  static async updateUserProfile({ user }) {
    const pr = await Hatena.User.getProfile({ user })
    const ov = await Hatena.Bookmark.getOverview(user)
    const timestamp = new Date()
    const arg = {
      userid: user,
      name: pr.nickname,
      totalBookmarks: ov.user.total_bookmarks,
      totalFollowers: ov.user.total_followers,
      totalFollowings: ov.user.total_followings,
      timestamp
    }
    await DB.delinsUserProfile(arg)
  }
}

const qs = require('querystring')
const request = require('request-promise-native')

const options = {
  headers: {
    'User-Agent': 'Request'
  },
  json: true
}

const B = {
  apiOrigin: 'https://b.hatena.ne.jp',
  profileOrigin: 'https://profile.hatena.ne.jp',
  starOrigin: 'https://s.hatena.com',
  starAddOrigin: 'https://s.hatena.ne.jp',
  starImageOrigin: 'https://s.st-hatena.com'
}

class User {
  static async getProfile({ user }) {
    const url = `https://pf-api.hatena.com/profile/profiles?name=${user}`
    try {
      const str = await request(url)
      /* name, nickname, profile_icon_url, profile_image_url */
      return JSON.parse(str)[user]
    } catch (e) {
      console.warn(`Failed to User.getProfile: ${user}`)
      console.warn(e)
      return {}
    }
  }

  static getProfileImageURL(user) {
    const apiUrl = `https://cdn.profile-image.st-hatena.com/users/${user}/profile.png`
    return apiUrl
  }

  static async getFavorites(user) {
    const apiUrl = `${B.profileOrigin}/${user}/favorites.json`
    options.uri = apiUrl
    return await request(options)
  }
}

class Bookmark {
  static getUserPageURL(user) {
    const apiUrl = `https://b.hatena.ne.jp/${user}/`
    return apiUrl
  }

  static async getOverview(user) {
    options.uri = `https://b.hatena.ne.jp/api/internal/cambridge/user/${user}`
    return await request(options).catch(e => {
      console.warn(`Failed to Bookmark.getOverview: ${user}`)
      console.warn(e.toString())
      return null
    })
  }

  static async getEntryCount(rawPageUrl) {
    const url = Util.encodeURI(rawPageUrl)
    const apiUrl = `${B.apiOrigin}/entry.count?url=${url}`
    options.uri = apiUrl
    return await request(options)
  }

  static async getEntryLite(rawPageUrl) {
    const url = Util.encodeURI(rawPageUrl)
    const apiUrl = `${B.apiOrigin}/entry/jsonlite/?url=${url}`
    options.uri = apiUrl
    const result = await request(options).catch(e => {
      console.log('=======================')
      console.log(rawPageUrl)
      console.warn(e)
    })
    return result || {}
  }

  static getEntryTotalCount() {
    //
  }
}

class Star {
  static async getEntry({ user, yyyymmdd, eid }) {
    const uri = `https://b.hatena.ne.jp/${user}/${yyyymmdd}%23bookmark-${eid}`
    const encodedUri = Util.encodeURI(uri)
    options.uri = `${B.starOrigin}/entry.json?uri=${encodedUri}`
    return await request(options)
  }

  static async getTotalCount({ uri }) {
    const encodedUri = Util.encodeURI(uri)
    options.uri = `${B.starAddOrigin}/blog.json?uri=${encodedUri}`
    return await request(options).catch(e => {
      /* 403 Forbidden */
      console.warn(e)
    })
  }

  static async getTotalBookmarkStarCount({ user }) {
    const uri = `http://b.hatena.ne.jp/${user}/`
    return await Star.getTotalCount({ uri }).catch(e => {
      console.warn(e.toString())
      return null
    })
  }

  static getEntryCountImageURL({ user, yyyymmdd, eid }) {
    const uri = `https://b.hatena.ne.jp/${user}/${yyyymmdd}%23bookmark-${eid}`
    const encodedUri = Util.encodeURI(uri)
    const apiUrl = `${B.starImageOrigin}/entry.count.image?uri=${encodedUri}`
    return apiUrl
  }

  static async getArrangedStarSetByEntry(entry) {
    if (!entry || !entry.bookmarks) return {}
    const commentedOnly = entry.bookmarks.filter(x => x.comment)
    const starEntries = await Promise.all(
      commentedOnly.map(async b => {
        const se = await Star.getStarEntry(entry.eid, b)
        se.user = b.user
        return se
      })
    )
    return Star.makeStarSet(starEntries)
  }

  static makeStarSet(starEntries) {
    const starSet = {}
    starEntries.forEach(x => {
      starSet[x.user] = Star.makeStars(x.entries[0])
    })
    return starSet
  }

  static makeStars(entry) {
    const stars = {}
    if (entry) {
      // merge stars by same user (yellow only)
      const yellow = Array.from(new Set(entry.stars.map(x => x.name))).length
      if (yellow > 0) {
        stars.yellow = yellow
      }
      if (entry.colored_stars) {
        entry.colored_stars.forEach(cs => {
          stars[cs.color] = cs.stars.length
        })
      }
    }
    return stars
  }

  static async getStarEntry(eid, bookmark) {
    if (!bookmark || !bookmark.timestamp) return {}
    const ymd = bookmark.timestamp.match(/^(20..\/..\/..)/)[1]
    const yyyymmdd = ymd.replace(/\//g, '')
    const star = await Star.getEntry({
      user: bookmark.user,
      yyyymmdd,
      eid
    })
    return star
  }

  static async getEntries(rawPageUrl) {
    const encodedUri = Util.encodeURI(rawPageUrl)
    options.uri = `${B.starAddOrigin}/entries.json?uri=${encodedUri}`
    return await request(options)
  }

  static async getRKS(rawPageUrl) {
    const res = await Star.getEntries(rawPageUrl)
    return res.rks
  }

  static async addStar(rawPageUrl) {
    const encodedUri = Util.encodeURI(rawPageUrl)
    const rks = await Star.getRKS(rawPageUrl)
    options.uri = `${B.starAddOrigin}/star.add.json?uri=${encodedUri}&rks=${rks}`
    return await request(options)
  }
}

class Custom {
  /** Hatenaサーバへの負荷が心配 */
  // TODO: ブクマページの「リンク」から行けるコメントページのほうが早いかも
  static async extractBucomeDetail(detail, user) {
    if (!detail.bookmarks) return {}
    const b = detail.bookmarks.filter(x => x.user === user)
    // comment, user, tags, timestamp
    const c = b[0] || {}
    // Get star counts from official API
    const s = await Star.getStarEntry(detail.eid, c)
    const t = s.entries ? s.entries[0] : {}
    return Object.assign({}, c, t)
  }
}

class Util {
  static encodeURI(uri) {
    // decode the passed uri recursively.
    const decodedUri = Util.fullyDecodeURI(uri)
    return qs.escape(decodedUri)
  }

  static isEncoded(uri) {
    uri = uri || ''
    return uri !== qs.unescape(uri)
  }

  static fullyDecodeURI(uri) {
    while (Util.isEncoded(uri)) {
      uri = qs.unescape(uri)
    }
    return uri
  }
}

module.exports = {
  User,
  Bookmark,
  Star,
  Custom
}

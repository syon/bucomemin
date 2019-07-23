const debug = require('debug')
const { storage } = require('../../firebaseAdmin')
const MyHatebu = require('./myhatebu')

debug.enable('app:*')
const dg = debug('app:recent')
const bucket = storage.bucket('gs://bmin-faf7e.appspot.com/')

module.exports = class Recent {
  static async main(params) {
    const { user } = params
    const results = await MyHatebu.getBookmarks({ user })
    const jsonStr = JSON.stringify(results, null, 2)
    const file = bucket.file(`recent/${user}.json`)
    await file.save(jsonStr)
    // TODO: Decode Username ???
    await Recent.calcTheRate({ user })
  }

  static async calcTheRate({ user }) {
    dg(`==== [#calcTheRate] (${user}) ====`)
    const file = bucket.file(`recent/${user}.json`)
    const buf = await file.download()
    const jsonStr = buf.toString()
    const data = JSON.parse(jsonStr)

    const commentRate = calcCommentRate(data)
    const starredRate = calcStarredRate(data)
    // const rankinRate = calcRankinRate(data, user)
    const anondRate = calcAnondRate(data)
    const sparkles = detectSparkleComments(data)
    const result = { commentRate, starredRate, anondRate, sparkles }
    await Recent.saveFileToBucket(result, `analyze/${user}.json`)

    const calendarData = makeCalendarData(data)
    await Recent.saveFileToBucket(calendarData, `calendar/${user}.json`)
  }

  static async saveFileToBucket(data, path) {
    dg('[#saveFileToBucket]', path)
    const jsonStr = JSON.stringify(data, null, 2)
    const file = bucket.file(path)
    await file.save(jsonStr)
    await file.setMetadata({ metadata: 'application/json' })
    dg('[#saveFileToBucket] Success:', data)
  }
}

function calcCommentRate(data) {
  const commented = data.filter(x => {
    return x.comment.trim().length > 0
  })
  return Math.floor((commented.length / data.length) * 100)
}

function calcStarredRate(data) {
  const commented = data.filter(x => {
    return x.comment.trim().length > 0
  })
  const starred = commented.filter(x => {
    // TODO: 自分を除く
    return x.stars.length > 0
  })
  return Math.floor((starred.length / commented.length) * 100)
}

// function calcRankinRate(data, user) {
//   const commented = data.filter(x => {
//     return x.comment.trim().length > 0
//   })
//   const rankin = commented.filter(x => {
//     const isRankin = !!x.bucome.populars[user]
//     return isRankin
//   })
//   return Math.floor((rankin.length / commented.length) * 100)
// }

function calcAnondRate(data) {
  const anond = data.filter(x => {
    return /^https:\/\/anond.hatelabo.jp/.test(x.url)
  })
  return Math.floor((anond.length / data.length) * 100)
}

function detectSparkleComments(data) {
  const commented = data.filter(x => {
    return x.comment.trim().length > 0
  })
  const starred = commented.filter(x => {
    // TODO: 自分を除く
    return x.stars.length > 0
  })
  starred.sort((a, b) => {
    return b.stars.length - a.stars.length
  })
  return starred.slice(0, 3)
}

function makeCalendarData(data) {
  const result = {}
  for (const d of data) {
    const key = new Date(d.date).getTime() / 1000
    if (result[key]) {
      result[key] += 1
    } else {
      result[key] = 1
    }
  }
  return result
}

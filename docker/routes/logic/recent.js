const qs = require('qs')
const debug = require('debug')
const MyHatebu = require('./myhatebu')
const { storage } = require('../../firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:recent')
const bucket = storage.bucket('gs://bmin-faf7e.appspot.com/')

module.exports = class Recent {
  static async main(params) {
    const { user } = params
    const results = await MyHatebu.getBookmarks({ user })
    const jsonStr = JSON.stringify(results, null, 2)
    const file = bucket.file(`users/recent/${user}.json`)
    await file.save(jsonStr)
    // TODO: Decode Username ???
    await Recent.calcTheRate({ user })
  }

  static async calcTheRate({ user }) {
    dg(`==== [#calcTheRate] (${user}) ====`)
    const file = bucket.file(`users/recent/${user}.json`)
    const buf = await file.download()
    const jsonStr = buf.toString()
    const data = JSON.parse(jsonStr)
    const commentRate = calcCommentRate(data)
    const starredRate = calcStarredRate(data)
    // const rankinRate = calcRankinRate(data, user)
    const anondRate = calcAnondRate(data)
    const calendarData = makeCalendarData(data)
    const result = { commentRate, starredRate, anondRate, calendarData }
    console.log(result)
    const jsonStrW = JSON.stringify(result, null, 2)
    const fileA = bucket.file(`users/analyze/${user}.json`)
    await fileA.save(jsonStrW)
    await fileA.setMetadata({ metadata: 'application/json' })
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
    return x.stars.length > 0
  })
  return Math.floor((starred.length / commented.length) * 100)
}

function calcRankinRate(data, user) {
  const commented = data.filter(x => {
    return x.comment.trim().length > 0
  })
  const rankin = commented.filter(x => {
    const isRankin = !!x.bucome.populars[user]
    return isRankin
  })
  return Math.floor((rankin.length / commented.length) * 100)
}

function calcAnondRate(data) {
  const anond = data.filter(x => {
    return /^https:\/\/anond.hatelabo.jp/.test(x.url)
  })
  return Math.floor((anond.length / data.length) * 100)
}

function makeCalendarData(data) {
  const result = {}
  for (const d of data) {
    if (result[d.date]) {
      result[d.date] += 1
    } else {
      result[d.date] = 1
    }
  }
  return result
}

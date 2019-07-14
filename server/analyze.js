const debug = require('debug')
const { storage } = require('./firebaseAdmin')

debug.enable('app:*')
const dg = debug('app:analyze')
const bucket = storage.bucket('gs://bmin-faf7e.appspot.com/')

const user = 'Dy66'

module.exports = async (req, res, next) => {
  dg('==== analyze.js ====')
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
  res.end('Analyze!')
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

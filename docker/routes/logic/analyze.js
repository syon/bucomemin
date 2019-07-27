const debug = require('debug')
const Storage = require('./storage')
const DB = require('./DB')

const dg = debug('app:analyze')

module.exports = class Analyze {
  static async main({ user }) {
    dg(`==== [Analyze#main] (${user}) START ====`)
    // const data = await Storage.loadJsonFile(`recent/${user}.json`)

    // const commentRate = calcCommentRate(data)
    // const starredRate = calcStarredRate(data)
    // // const rankinRate = calcRankinRate(data, user)
    // const anondRate = calcAnondRate(data)
    // const sparkles = detectSparkleComments(data)
    // // const dailyStars = makeDailyStars(data)
    // const result = { commentRate, starredRate, anondRate, sparkles }
    // await Storage.saveJsonFile(result, `analyze/${user}.json`)

    // const bubble = makeBubble(data)
    // await Storage.saveJsonFile(bubble, `bubble/${user}.json`)

    // const calendarData = makeCalendarData(data)
    // await Storage.saveJsonFile(calendarData, `calendar/${user}.json`)
    // dg(`==== [Analyze#main] (${user}) END ====`)

    await DB.delinsMonthlyTotalStarlenSum()
    await DB.delinsAnnualSummalyBookmarkSum()
    await DB.delinsAnnualSummalyCommentedLen()
    await DB.delinsAnnualSummalyStarredLen()
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

// function makeDailyStars(data) {
//   const commented = data.filter(x => {
//     return x.comment.trim().length > 0
//   })
//   const starred = commented.filter(x => {
//     // TODO: 自分を除く
//     return x.stars.length > 0
//   })
//   const dailyStars = {}
//   starred.forEach(b => {
//     if (!dailyStars[b.date]) {
//       dailyStars[b.date] = 0
//     }
//     dailyStars[b.date] += b.stars.length
//   })
//   return dailyStars
// }

function makeBubble(data) {
  return data.map(x => {
    return {
      title: x.title,
      users: x.users,
      hatebu: x.hatebuPage,
      timestamp: x.timestamp,
      stars: x.stars.length,
      comment: x.comment
    }
  })
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

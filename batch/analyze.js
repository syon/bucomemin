const fs = require('fs')

const user = 'Dy66'

async function main() {
  await 0
  const jsonStr = fs.readFileSync(`./batch/data/${user}.json`, 'utf8')
  const data = JSON.parse(jsonStr)
  const commentRate = calcCommentRate(data)
  const starredRate = calcStarredRate(data)
  // const rankinRate = calcRankinRate(data, user)
  const anondRate = calcAnondRate(data)
  const result = { commentRate, starredRate, anondRate }
  console.log(result)
}

;(async () => {
  await main()
})().catch(e => {
  // Deal with the fact the chain failed
  console.error(e)
})

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

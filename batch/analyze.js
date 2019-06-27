const fs = require('fs')

const user = 'Dy66'

async function main() {
  await 0
  const jsonStr = fs.readFileSync(`./batch/data/${user}.json`, 'utf8')
  const data = JSON.parse(jsonStr)
  const anondCommentRate = calcAnondCommentRate(data)
  const result = { anondCommentRate }
  console.log(result)
}

;(async () => {
  await main()
})().catch(e => {
  // Deal with the fact the chain failed
  console.error(e)
})

function calcAnondCommentRate(data) {
  const anondList = data.filter(x => {
    return /^https:\/\/anond\.hatelabo\.jp/.test(x.url)
  })
  const commented = anondList.filter(x => {
    return x.comment.trim().length > 0
  })
  return Math.floor((commented.length / anondList.length) * 100)
}

const fs = require('fs')

const user = 'Dy66'

async function main() {
  await 0
  const jsonStr = fs.readFileSync(`./batch/data/${user}.json`, 'utf8')
  const data = JSON.parse(jsonStr)
  const commentRate = calcCommentRate(data)
  const result = { commentRate }
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

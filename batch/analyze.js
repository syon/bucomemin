const fs = require('fs')
const Hatena = require('./hatena')
const request = require('request-promise-native')

const user = 'Dy66'

async function main() {
  await 0
  const jsonStr = fs.readFileSync(`./batch/data/${user}.json`, 'utf8')
  const data = JSON.parse(jsonStr)
  const commentRate = calcCommentRate(data)
  const result = { commentRate }
  console.log(result)

  const a = await Hatena.Bookmark.getEntryLite('https://www3.nhk.or.jp/news/html/20190621/k10011963241000.html')
  const b = a.bookmarks.filter(x => x.user === 'poyopoyojinsei')
  console.log(a.eid, b)
  const c = await Hatena.Star.getStarEntry(a.eid, b[0])
  console.log(c.entries[0].stars)
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

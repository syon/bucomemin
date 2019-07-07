const dg = require('debug')
const MyHatebu = require('./myhatebu')

dg.enable('app:*')

const user = 'Dy66'

async function main() {
  const results = await MyHatebu.getBookmarks({ user })
  const jsonStr = JSON.stringify(results, null, 2)
  require('fs').writeFileSync(`./batch/data/${user}.json`, jsonStr)
}

;(async () => {
  await main()
})().catch(e => {
  // Deal with the fact the chain failed
  console.error(e)
})

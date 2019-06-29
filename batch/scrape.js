const MyHatebu = require('./myhatebu')

const user = 'Dy66'

async function main() {
  const results = await MyHatebu.getBookmarks({ user })
  console.log('///////////////////////////')
  console.log(results)
  console.log('///////////////////////////')
  const jsonStr = JSON.stringify(results, null, 2)
  require('fs').writeFileSync(`./batch/data/${user}.json`, jsonStr)
}

;(async () => {
  await main()
})().catch(e => {
  // Deal with the fact the chain failed
  console.error(e)
})

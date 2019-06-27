const request = require('request-promise-native')
const cheerio = require('cheerio')

const options = {
  headers: {
    'User-Agent': 'Request'
  },
  transform: function(body) {
    return cheerio.load(body)
  }
}

const user = 'Dy66'

async function main() {
  let results = []

  for (let i = 0; i < 3; i++) {
    console.log('......', i)
    const num = i + 1
    options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${num}`
    const list = await extractEntries(options)
    results = results.concat(list)
    console.log(results.length)
  }

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

async function extractEntries() {
  return await request(options)
    .then(function($) {
      const list = $('.bookmark-item').map((i, el) => {
        const title = $(el)
          .find('.centerarticle-entry-title')
          .text()
          .trim()
        const url = $(el)
          .find('.centerarticle-entry-title > a')
          .attr('href')
        const users = $(el)
          .find('.centerarticle-users > a')
          .text()
          .replace(/ users?/, '')
        const timestamp = $(el)
          .find('.centerarticle-reaction-timestamp')
          .text()
        const comment = $(el)
          .find('.js-comment')
          .text()
        const commentPermalink =
          'https://b.hatena.ne.jp' +
          $(el)
            .find('.comment-permalink > a')
            .attr('href')
        // Twitter clicks needs ajax evaluation.
        // const twitterClicks = $(el)
        //   .find('.twitter-click > a > span')
        //   .text()
        //   .replace(/ clicks?/, '')
        return { title, url, users, timestamp, comment, commentPermalink }
      })
      return list.get()
    })
    .catch(function(err) {
      throw new Error(err)
    })
}

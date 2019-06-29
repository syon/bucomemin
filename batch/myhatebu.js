const request = require('request-promise-native')
const cheerio = require('cheerio')
const Hatena = require('./hatena')

const options = {
  headers: {
    'User-Agent': 'Request'
  },
  transform: function(body) {
    return cheerio.load(body)
  }
}

async function getBookmarks({ user }) {
  let results = []
  for (let i = 0; i < 3; i++) {
    console.log('......', i)
    const num = i + 1
    options.uri = `https://b.hatena.ne.jp/${user}/bookmark?page=${num}`
    const list = await extractEntries(options)
    results = results.concat(list)
    console.log(results.length)
  }

  const res = await Promise.all(
    results.map(async entry => {
      const bucome = await Hatena.Custom.getBucomeDetailByUser(entry.url, user)
      bucome.stars = bucome.stars || []
      return { ...entry, ...bucome }
    })
  )
  return res
}

async function extractEntries(options) {
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
        const hatebuPage =
          'https://b.hatena.ne.jp' +
          $(el)
            .find('.centerarticle-users > a')
            .attr('href')
        const date = $(el)
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
        return {
          title,
          url,
          users,
          hatebuPage,
          date,
          comment,
          commentPermalink
        }
      })
      return list.get()
    })
    .catch(function(err) {
      throw new Error(err)
    })
}

module.exports = { getBookmarks }

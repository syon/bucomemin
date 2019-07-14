const cheerio = require('cheerio')

module.exports = (req, res, next) => {
  console.log('////////////////////////////')
  console.log(cheerio)
  console.log('////////////////////////////')
  res.end('Hello!')
}

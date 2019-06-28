const pptr = require('./pptr')

;(async () => {
  const html = await pptr('https://b.hatena.ne.jp/entry/s/www3.nhk.or.jp/news/html/20190621/k10011963241000.html')
  require('fs').writeFileSync('aaa.html', html)
})().catch(e => {
  // Deal with the fact the chain failed
})

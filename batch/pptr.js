const puppeteer = require('puppeteer')

module.exports = async function(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  const html = await page.content()
  await browser.close()
  return html
}

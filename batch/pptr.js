const puppeteer = require('puppeteer')
const dg = require('debug')('app:pptr')

module.exports = async function(url) {
  const viewportHeight = 2000
  const viewportWidth = 1200
  const browser = await puppeteer.launch()
  let html = ''
  try {
    const page = await browser.newPage()
    page.setViewport({ width: viewportWidth, height: viewportHeight })
    dg('goto', url)
    await page.goto(url)
    dg('click recent...')
    await page.click('[data-sort="recent"]').catch(() => {})
    await page.waitFor(3000)
    await scrollToBottom(page, viewportHeight)
    dg('load html source...')
    html = await page.content()
    dg('browser close...')
  } catch (e) {
    dg(e)
  }
  await browser.close()
  return html
}

/**
 * https://swet.dena.com/entry/2018/04/26/152326
 */
async function scrollToBottom(page, viewportHeight) {
  const getScrollHeight = () => {
    return Promise.resolve(document.documentElement.scrollHeight)
  }

  let scrollHeight = await page.evaluate(getScrollHeight)
  let currentPosition = 0
  let scrollNumber = 0

  while (currentPosition < scrollHeight) {
    scrollNumber += 1
    const nextPosition = scrollNumber * viewportHeight
    await page.evaluate(function(scrollTo) {
      return Promise.resolve(window.scrollTo(0, scrollTo))
    }, nextPosition)
    await page
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 1500 })
      .catch(e => dg('wait timeout.'))

    currentPosition = nextPosition
    scrollHeight = await page.evaluate(getScrollHeight)
    const rate = Math.floor((currentPosition / scrollHeight) * 100)
    dg(`Scroll[${scrollNumber}]: ${currentPosition}/${scrollHeight} (${rate}%)`)
  }
}

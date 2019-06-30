const puppeteer = require('puppeteer')
const dg = require('debug')('app:pptr')

module.exports = async function(url) {
  const viewportHeight = 1200
  const viewportWidth = 1600
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setViewport({ width: viewportWidth, height: viewportHeight })
  dg('goto', url)
  await page.goto(url)
  dg('click recent...')
  await page.click('[data-sort="recent"]')
  await page.waitFor(3000)
  await scrollToBottom(page, viewportHeight)
  dg('load html source...')
  const html = await page.content()
  dg('browser close...')
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
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })
      .catch(e => console.log('timeout exceed. proceed to next operation'))

    currentPosition = nextPosition
    console.log(`scrollNumber: ${scrollNumber}`)
    console.log(`currentPosition: ${currentPosition}`)

    scrollHeight = await page.evaluate(getScrollHeight)
    console.log(`ScrollHeight ${scrollHeight}`)
  }
}

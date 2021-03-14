const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const autoScroll = require('../util/autoScroll')
const loadData = require('../util/loadData');
const config = require('../config');

// Constants
const LOAD_MORE_TAG = 'button.jBBqnu';
const COIN_NAME_TAG = '.bQqdJy h1___3QSYG';
const HEADLESS = config.HEADLESS;

const loadMoreRecursively = async page => {
  const body = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(body);
  const loadMoreText = $('a').filter(function() {
    return $(this).text().indexOf('Load More') > -1;
  }).text();

  if (!!loadMoreText) {
    await page.click(LOAD_MORE_TAG);
    await autoScroll(page);
    await loadMoreRecursively(page);
  }
  // console.log('Finished clicking load more buttons.')
}

const runAndCollectCoinMarketData = async (rank, name, symbol, page) => {
  // Set Document to Cheerio
  const body = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(body);
  const tbody = $('tbody');
  const rows = tbody.children('tr');
  
  // Begin collecting data
  // console.log('Starting data collection...')
  const data = [];
  rows.each(function(i, el) {
    const row = $(this);
    const children = row.children();
    const id = i;
    const datetime = Date.now();
    const source = row.find('p[font-weight="semibold"]').html();
    const pairs = row.find('a.dm1bn9-0').html();
    const price = children.eq(3).html()
      ? parseFloat(children.eq(3).html().replace(/[^0-9\.]/g, ''))
      : null ; // Remove ** that is shown as outliers
    const volume = children.eq(4).find('p[color="text"]').html()
      ? parseFloat(children.eq(4).find('p[color="text"]').html().replace(/[^0-9\.]/g, ''))
      : null; // Remove ** that is shown as outliers
    const volumePercent = children.eq(5).find('p[color="text"]').html();
    const confidence = children.eq(7).find('div.confidenceLevel').html();
    const updated = children.eq(8).find('p[color="text"]').html();

    data[i] = {id, rank, name, symbol, datetime, source, pairs, price, volume, volumePercent, confidence, updated};
  });

  return data.filter(el => !!el);
}

module.exports = async (rank, name, symbol, url) => {
  const browser = await puppeteer.launch({ headless: HEADLESS });

  // Create new page
  const page = await browser.newPage();

  // Go to Page and set Settings
  await page.goto(url, { waitUntil: 'networkidle0' })
  await autoScroll(page);
  await loadMoreRecursively(page);
  const data = await runAndCollectCoinMarketData(rank, name, symbol, page);
  await loadData(data);

  await browser.close();
};
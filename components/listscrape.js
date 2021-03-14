const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const autoScroll = require('../util/autoScroll');
const coinscrape = require('./coinscrape');
const config = require('../config');

// Constants
const BASE_URL = config.BASE_URL;
const PAGE_START = config.PAGE_START;
const NUMBER_OF_PAGES = config.NUMBER_OF_PAGES;
const HEADLESS = config.HEADLESS;

const runAndCollectListData = async page => {
  let body = await page.evaluate(() => document.body.innerHTML);
  const $ = cheerio.load(body);
  const tbody = $('tbody');
  const rows = tbody.children('tr');
  const data = [];
  // console.log('Starting data collection...')

  rows.each(function(i, el) {
    const row = $(this);
    const children = row.children();
    const rank = row.find('p[color="text2"]').html();
    const name = row.find('p[font-weight="semibold"]').html();
    const symbol = row.find('.coin-item-symbol').html();
    const url = `${BASE_URL}${children.eq(2).find('a.cmc-link').attr('href')}markets/`;

    if(!!rank) {
      data[i] = {rank, name, symbol, url};
    }
  });

  return data.filter(el => !!el);
}

module.exports = async () => {
  const browser = await puppeteer.launch({ headless: HEADLESS });
  const page = await browser.newPage();
  for(let i = PAGE_START; i < PAGE_START + NUMBER_OF_PAGES; i++) {
    await page.goto(`${BASE_URL}/?page=${i}`, { waitUntil: 'networkidle0' });
    await autoScroll(page);
    const data = await runAndCollectListData(page);
    for (let j = 0; j < data.length; j++) {
      const url = data[j].url;
      const name = data[j].name;
      await coinscrape(name, url);
    }
  }

  await browser.close();
};
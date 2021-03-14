const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function autoScroll(page) {
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          let totalHeight = 0;
          const distance = 800;
          const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 20);
      });
  });
}

const execute = async (browser, basePage) => {
  const numberOfPages = 10;
  const page = await browser.newPage();
  for(let i = 1; i < numberOfPages + 1; i++) {
    await page.goto(`${basePage}${i}`, {
      waitUntil: 'networkidle0',
    });
  
    await page.setViewport({
      width: 1200,
      height: 800
    });
  
    console.log('Scrolling...');
    await autoScroll(page);
    console.log('Scrolling finished.');
    await page.waitForSelector('table');
  
    let body = await page.evaluate(() => document.body.innerHTML);
    const $ = cheerio.load(body);
    const tbody = $('tbody');
    const rows = tbody.children('tr');
    const data = [];
    console.log('Starting data collection...')
  
    rows.each(function(i, el) {
      const row = $(this);
      const rank = row.find('p[color="text2"]').html();
      const name = row.find('p[font-weight="semibold"]').html();
      const symbol = row.find('.coin-item-symbol').html();
      // const marketCap = row.eq(6).find('p[color="text"]').html();
      let link = '';
      if(!!name) {
        const standardizedCoin = name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
        link = `https://coinmarketcap.com/currencies/${standardizedCoin}/markets/`;
      }
  
      if(!!rank) {
        data[i] = {rank, name, symbol, link};
      }
    });
  
    console.log(data);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const basePage = 'https://coinmarketcap.com/?page=';
  await execute(browser, basePage);
  await browser.close();
})();
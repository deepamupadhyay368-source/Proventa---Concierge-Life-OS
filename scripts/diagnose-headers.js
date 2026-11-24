const { chromium } = require('playwright');

(async () => {
  console.log('Diagnosing header elements on proventa.in...');
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const urls = [
      'https://proventa.in/',
      'https://proventa.in/how-it-works',
      'https://proventa.in/categories',
      'https://proventa.in/for-buyers',
      'https://proventa.in/for-suppliers',
      'https://proventa.in/sign-in',
      'https://proventa.in/sign-up',
    ];

    for (const u of urls) {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const headers = await page.$$eval('header', els => els.map(e => ({
        tag: e.tagName,
        className: e.className,
        textSnippet: e.innerText.slice(0, 100).replace(/\n/g, ' ')
      })));
      console.log(`URL: ${u} -> Found ${headers.length} <header> tags:`);
      headers.forEach((h, idx) => {
        console.log(`  [Header ${idx + 1}] class: "${h.className.slice(0, 50)}..." snippet: "${h.textSnippet}"`);
      });

      // Also check for ticker / announcement strip
      const tickers = await page.$$eval('div', els => els
        .filter(e => e.innerText && e.innerText.includes('PROVENTA — CONSTRUCTION & INFRASTRUCTURE PROCUREMENT PLATFORM'))
        .map(e => ({ className: e.className, text: e.innerText.slice(0, 80).replace(/\n/g, ' ') }))
      );
      console.log(`  Ticker occurrences: ${tickers.length}`);
    }

  } catch (err) {
    console.error('Error during diagnosis:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();

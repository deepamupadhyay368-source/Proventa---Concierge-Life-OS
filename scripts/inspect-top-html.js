const { chromium } = require('playwright');

(async () => {
  let browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('https://proventa.in/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const topHtml = await page.evaluate(() => {
    const headers = document.querySelectorAll('header, nav, [class*="nav"], [class*="header"]');
    return Array.from(headers).map(h => ({
      tag: h.tagName,
      id: h.id,
      className: h.className,
      text: h.innerText.slice(0, 150).replace(/\n/g, ' -- ')
    }));
  });

  console.log('Top header/nav elements:', JSON.stringify(topHtml, null, 2));
  await browser.close();
})();

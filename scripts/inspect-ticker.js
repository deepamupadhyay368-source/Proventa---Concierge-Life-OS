const { chromium } = require('playwright');

(async () => {
  let browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('https://proventa.in/', { waitUntil: 'domcontentloaded' });

  const elements = await page.$$eval('*', els => els
    .filter(e => e.children.length === 0 && e.innerText && e.innerText.includes('PROVENTA — CONSTRUCTION'))
    .map(e => ({
      tagName: e.tagName,
      className: e.className,
      parentTag: e.parentElement ? e.parentElement.tagName : null,
      parentClass: e.parentElement ? e.parentElement.className : null,
      text: e.innerText
    }))
  );

  console.log('Elements with text:', JSON.stringify(elements, null, 2));
  await browser.close();
})();

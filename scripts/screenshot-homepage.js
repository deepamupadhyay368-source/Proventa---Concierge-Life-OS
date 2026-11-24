const { chromium } = require('playwright');

(async () => {
  let browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://proventa.in/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/homepage-desktop.png' });

  console.log('Screenshots saved.');
  await browser.close();
})();

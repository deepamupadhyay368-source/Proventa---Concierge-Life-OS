const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const urls = [
      'https://proventa.in/buyer/dashboard',
      'https://proventa.in/supplier/dashboard',
      'https://proventa.in/buyer/discovery',
      'https://proventa.in/onboarding/business',
      'https://proventa.in/business/dashboard',
      'https://proventa.in/settings/business-profile',
      'https://proventa.in/rfq/new',
      'https://proventa.in/admin/verification',
    ];

    for (const u of urls) {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const currentUrl = page.url();
      const headers = await page.$$eval('header', els => els.map(e => ({
        tag: e.tagName,
        className: e.className,
        textSnippet: e.innerText.slice(0, 100).replace(/\n/g, ' ')
      })));
      console.log(`Requested: ${u} (Landed: ${currentUrl}) -> Found ${headers.length} <header> tags:`);
      headers.forEach((h, idx) => {
        console.log(`  [Header ${idx + 1}] class: "${h.className.slice(0, 40)}..." text: "${h.textSnippet}"`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
})();

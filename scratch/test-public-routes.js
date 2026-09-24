const https = require('https');

const routes = [
  '/',
  '/how-it-works',
  '/services/dining',
  '/services/travel',
  '/services/experiences',
  '/services/home',
  '/services/shopping',
  '/legal',
  '/privacy',
  '/terms',
  '/refund-cancellation',
  '/cookie-policy',
  '/ai-concierge-disclosure',
  '/sign-in',
  '/sign-up'
];

async function checkRoute(path) {
  const start = performance.now();
  return new Promise((resolve) => {
    const req = https.get('https://proventa.in' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Math.round(performance.now() - start);
        resolve({
          path,
          status: res.statusCode,
          timeMs: time,
          bytes: data.length,
          hasContent: data.length > 500
        });
      });
    });
    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function run() {
  console.log('=== VERIFYING PUBLIC WEBSITE ROUTES ON PRODUCTION (proventa.in) ===\n');
  const results = [];
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`${res.path.padEnd(28)} Status: ${res.status} | Time: ${res.timeMs}ms | Size: ${res.bytes} bytes`);
    results.push(res);
  }

  const allPassed = results.every(r => r.status === 200);
  console.log('\nAll public & legal routes loaded with HTTP 200:', allPassed ? 'YES (PASS)' : 'NO (FAIL)');
}

run();

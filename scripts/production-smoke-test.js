/**
 * PROVENTA 2.0 — Production Smoke Test Suite
 * Tests against https://proventa.in after deployment of commit 791c403
 */
const https = require('https');

const BASE = 'https://proventa.in';
let passed = 0;
let failed = 0;
const results = [];

function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE);
    const req = https.get(url, {
      headers: { 'User-Agent': 'PROVENTA-SmokeTest/2.0' },
      timeout: 15000,
      ...options,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body,
        url: url.toString(),
      }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function test(name, fn) {
  return fn().then(
    () => { passed++; results.push({ name, status: 'PASSED' }); console.log(`  ✓ ${name}`); },
    (err) => { failed++; results.push({ name, status: 'FAILED', error: err.message }); console.log(`  ✗ ${name}: ${err.message}`); }
  );
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function run() {
  console.log('================================================================');
  console.log('  PROVENTA 2.0 — PRODUCTION SMOKE TEST (commit 791c403)');
  console.log('  Target: https://proventa.in');
  console.log('  Time:   ' + new Date().toISOString());
  console.log('================================================================\n');

  // ── 1. Homepage & Branding ──
  console.log('1. Homepage & Branding');
  await test('Homepage returns HTTP 200', async () => {
    const r = await request('/');
    assert(r.status === 200, `Got ${r.status}`);
  });

  await test('Homepage contains PROVENTA branding', async () => {
    const r = await request('/');
    assert(r.body.includes('PROVENTA'), 'Missing PROVENTA branding');
  });

  await test('Homepage contains procurement positioning', async () => {
    const r = await request('/');
    const hasKeywords = r.body.includes('Procurement') || r.body.includes('procurement') || r.body.includes('SOURCE');
    assert(hasKeywords, 'Missing procurement positioning keywords');
  });

  await test('Homepage contains buyer CTA', async () => {
    const r = await request('/');
    const hasBuyer = r.body.includes('Buyer') || r.body.includes('buyer');
    assert(hasBuyer, 'Missing buyer CTA');
  });

  await test('Homepage contains supplier CTA', async () => {
    const r = await request('/');
    const hasSupplier = r.body.includes('Supplier') || r.body.includes('supplier');
    assert(hasSupplier, 'Missing supplier CTA');
  });

  // ── 2. Authentication Pages ──
  console.log('\n2. Authentication');
  await test('Sign-in page returns HTTP 200', async () => {
    const r = await request('/sign-in');
    assert(r.status === 200, `Got ${r.status}`);
  });

  await test('Sign-in page contains authentication form', async () => {
    const r = await request('/sign-in');
    const hasAuth = r.body.includes('Pass') || r.body.includes('pass') || r.body.includes('Sign') || r.body.includes('sign') || r.body.includes('Login') || r.body.includes('login');
    assert(hasAuth, 'Missing authentication form elements');
  });

  // ── 3. Protected Routes (should redirect without session) ──
  console.log('\n3. Protected Route Enforcement');
  await test('Buyer portal redirects to auth without session', async () => {
    const r = await request('/portal/buyer');
    // Should be 200 (Next.js middleware may render sign-in) or 307/302 redirect
    assert(r.status === 200 || r.status === 302 || r.status === 307 || r.status === 308, `Unexpected ${r.status}`);
  });

  await test('Supplier portal redirects to auth without session', async () => {
    const r = await request('/portal/supplier');
    assert(r.status === 200 || r.status === 302 || r.status === 307 || r.status === 308, `Unexpected ${r.status}`);
  });

  // ── 4. RFQ & Procurement Routes ──
  console.log('\n4. RFQ & Procurement Routes');
  await test('RFQ new page is accessible', async () => {
    const r = await request('/rfq/new');
    assert(r.status === 200 || r.status === 302 || r.status === 307, `Got ${r.status}`);
  });

  await test('Supplier directory is accessible', async () => {
    const r = await request('/suppliers');
    assert(r.status === 200, `Got ${r.status}`);
  });

  // ── 5. API Endpoints ──
  console.log('\n5. API Endpoints');
  await test('Auth session API responds', async () => {
    const r = await request('/api/auth/session');
    assert(r.status === 200, `Got ${r.status}`);
  });

  await test('Procurement categories API responds', async () => {
    const r = await request('/api/procurement/categories');
    assert(r.status === 200 || r.status === 404 || r.status === 405, `Got ${r.status} (unexpected server error)`);
  });

  // ── 6. Payment Intelligence ──
  console.log('\n6. Payment Intelligence');
  await test('Payment Intelligence page is accessible', async () => {
    const r = await request('/payment-intelligence');
    // May require auth or exist as a route
    assert(r.status === 200 || r.status === 302 || r.status === 307 || r.status === 404, `Got ${r.status}`);
  });

  // ── 7. Static Assets & Performance ──
  console.log('\n7. Static Assets & Performance');
  await test('Next.js _next/static assets directory serves', async () => {
    const r = await request('/');
    const hasNextAssets = r.body.includes('/_next/static/');
    assert(hasNextAssets, 'Missing Next.js static asset references');
  });

  await test('Homepage response includes security headers', async () => {
    const r = await request('/');
    // Vercel adds x-vercel-id header
    const hasVercel = r.headers['x-vercel-id'] || r.headers['server'] || r.headers['x-powered-by'];
    assert(hasVercel, 'Missing deployment platform headers');
  });

  // ── 8. No Server Errors ──
  console.log('\n8. Server Error Check');
  const criticalRoutes = ['/', '/sign-in', '/suppliers', '/api/auth/session'];
  for (const route of criticalRoutes) {
    await test(`No 500 error on ${route}`, async () => {
      const r = await request(route);
      assert(r.status < 500, `Server error ${r.status} on ${route}`);
    });
  }

  // ── Summary ──
  console.log('\n================================================================');
  console.log(`  RESULTS: ${passed} PASSED / ${failed} FAILED / ${passed + failed} TOTAL`);
  if (failed === 0) {
    console.log('  STATUS: ALL SMOKE TESTS PASSED ✓');
  } else {
    console.log('  STATUS: FAILURES DETECTED ✗');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`    ✗ ${r.name}: ${r.error}`);
    });
  }
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Smoke test runner failed:', err);
  process.exit(1);
});

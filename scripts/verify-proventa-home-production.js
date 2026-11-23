/**
 * PROVENTA HOME — Production Verification & Smoke Test Script
 * Tests live endpoints on https://proventa.in to verify commit 881dd0c
 */

const https = require('https');

const BASE_URL = 'https://proventa.in';

const testRoutes = [
  // PROVENTA Home Public Pages
  { path: '/home', expectedStatus: 200, label: 'PROVENTA Home Landing Page', expectedContent: 'PROVENTA' },
  { path: '/home/how-it-works', expectedStatus: 200, label: 'How It Works Page', expectedContent: 'How PROVENTA Home Operates' },
  { path: '/home/membership', expectedStatus: 200, label: 'Membership & Pricing Page', expectedContent: 'Membership' },
  { path: '/home/services', expectedStatus: 200, label: 'Service Catalogue Page', expectedContent: 'Service Catalogue' },
  { path: '/home/service-areas', expectedStatus: 200, label: 'Service Areas (Ahmedabad) Page', expectedContent: 'Ahmedabad' },
  { path: '/home/join', expectedStatus: 200, label: 'Member Onboarding / Checkout Page', expectedContent: 'Household' },
  { path: '/home/partners', expectedStatus: 200, label: 'Technician Partners Page', expectedContent: 'Technician' },
  { path: '/home/societies', expectedStatus: 200, label: 'Societies & RWA Page', expectedContent: 'Societies' },
  { path: '/home/about', expectedStatus: 200, label: 'About Page', expectedContent: 'Mission' },
  { path: '/home/faq', expectedStatus: 200, label: 'FAQ Page', expectedContent: 'Frequently Asked Questions' },
  { path: '/home/contact', expectedStatus: 200, label: 'Contact & Helpdesk Page', expectedContent: 'Contact' },
  { path: '/home/terms', expectedStatus: 200, label: 'Terms of Service Page', expectedContent: 'Terms of Service' },
  { path: '/home/privacy', expectedStatus: 200, label: 'Privacy Policy Page', expectedContent: 'Privacy Policy' },
  { path: '/home/refund-policy', expectedStatus: 200, label: 'Refund Policy Page', expectedContent: 'Refund' },

  // PROVENTA Home Portals
  { path: '/home/customer/dashboard', expectedStatus: 200, label: 'Customer Member Dashboard', expectedContent: 'Dashboard' },
  { path: '/home/customer/book', expectedStatus: 200, label: 'Customer Service Booking Wizard', expectedContent: 'PROVENTA' },
  { path: '/home/customer/passport', expectedStatus: 200, label: 'Home Maintenance Passport', expectedContent: 'Passport' },
  { path: '/home/customer/requests/req-2026-001', expectedStatus: 200, label: 'Customer Request Detail & Approval', expectedContent: 'PROVENTA' },
  { path: '/home/partner/register', expectedStatus: 200, label: 'Technician Partner Registration', expectedContent: 'Partner' },
  { path: '/home/partner/dashboard', expectedStatus: 200, label: 'Technician Partner Console', expectedContent: 'Partner' },
  { path: '/home/admin', expectedStatus: 200, label: 'Operations Control Centre Overview', expectedContent: 'Operations' },
  { path: '/home/admin/dispatch', expectedStatus: 200, label: 'Intelligent Dispatch Queue', expectedContent: 'Dispatch' },
  { path: '/home/admin/finance', expectedStatus: 200, label: 'Unit Economics Simulator', expectedContent: 'Economics' },

  // PROVENTA Home APIs
  { path: '/api/home/services', expectedStatus: 200, label: 'Home Services API (JSON)', isJson: true },
  { path: '/api/home/plans', expectedStatus: 200, label: 'Home Plans API (JSON)', isJson: true },
  { path: '/api/home/requests', expectedStatus: 200, label: 'Home Requests API (JSON)', isJson: true },
  { path: '/api/home/admin/finance', expectedStatus: 200, label: 'Home Finance Simulator API (JSON)', isJson: true },

  // Existing Industrial Procurement Platform Regression Checks
  { path: '/', expectedStatus: 200, label: 'Industrial Landing Page (Root)', expectedContent: 'PROVENTA' },
  { path: '/buyer/dashboard', expectedStatus: 200, label: 'Buyer Dashboard (Existing)', expectedContent: 'Buyer' },
  { path: '/supplier/dashboard', expectedStatus: 200, label: 'Supplier Dashboard (Existing)', expectedContent: 'Supplier' },
  { path: '/buyer/rfqs', expectedStatus: 200, label: 'Buyer RFQs (Existing)', expectedContent: 'RFQ' }
];

function fetchEndpoint(urlPath) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${urlPath}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Proventa-Home-Production-Audit/1.0',
        'Cache-Control': 'no-cache'
      },
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path: urlPath,
          statusCode: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          bodySnippet: data.substring(0, 500),
          fullBody: data,
          vercelId: res.headers['x-vercel-id'] || 'N/A'
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: urlPath,
        error: err.message,
        statusCode: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: urlPath,
        error: 'Connection timed out',
        statusCode: 408
      });
    });
  });
}

async function runAudit() {
  console.log('===========================================================');
  console.log('PROVENTA HOME — PRODUCTION VERIFICATION & REGRESSION AUDIT');
  console.log('Target Domain: ' + BASE_URL);
  console.log('Timestamp: ' + new Date().toISOString());
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of testRoutes) {
    const res = await fetchEndpoint(test.path);
    const statusMatch = res.statusCode === test.expectedStatus;
    let contentMatch = true;

    if (test.expectedContent && (!res.fullBody || !res.fullBody.includes(test.expectedContent))) {
      contentMatch = false;
    }

    if (test.isJson) {
      try {
        const json = JSON.parse(res.fullBody);
        contentMatch = json && json.success === true;
      } catch (e) {
        contentMatch = false;
      }
    }

    const testPassed = statusMatch && contentMatch;
    if (testPassed) {
      passed++;
      console.log(`[PASS] ${test.path} (${res.statusCode}) — ${test.label}`);
    } else {
      failed++;
      console.log(`[FAIL] ${test.path} (${res.statusCode || 'ERR'}) — ${test.label} | ContentMatch: ${contentMatch} | VercelId: ${res.vercelId}`);
      if (res.error) console.log(`       Error: ${res.error}`);
    }

    results.push({
      test: test.label,
      path: test.path,
      statusCode: res.statusCode,
      passed: testPassed,
      vercelId: res.vercelId
    });
  }

  console.log('\n===========================================================');
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed out of ${testRoutes.length} Tests`);
  console.log('===========================================================');

  return { passed, failed, total: testRoutes.length, results };
}

runAudit();

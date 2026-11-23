// Comprehensive verification script for PROVENTA HOME Complete Platform Transformation
const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'https://proventa.in';

async function fetchUrl(urlPath, options = {}) {
  const url = `${BASE_URL}${urlPath}`;
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (ProventaHomeVerification/2.0)',
        ...options.headers,
      },
      ...options,
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          path: urlPath,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: urlPath,
        statusCode: 0,
        error: err.message,
      });
    });

    req.setTimeout(12000, () => {
      req.destroy();
      resolve({
        path: urlPath,
        statusCode: 408,
        error: 'Timeout',
      });
    });
  });
}

async function runAudit() {
  console.log(`\n============================================================`);
  console.log(`PROVENTA HOME COMPLETE PLATFORM TRANSFORMATION VERIFICATION`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`============================================================\n`);

  const checks = [
    // 1. Root Public Marketing Pages
    { path: '/', expectedStatus: [200], name: 'Root Homepage (PROVENTA Home)', keyword: 'PROVENTA HOME' },
    { path: '/membership', expectedStatus: [200], name: 'Membership Plans (₹299, ₹599, ₹999)', keyword: 'Family' },
    { path: '/services', expectedStatus: [200], name: 'Service Catalogue', keyword: 'Electrical' },
    { path: '/how-it-works', expectedStatus: [200], name: 'How It Works (4 Steps)', keyword: 'Dispatched' },
    { path: '/service-areas', expectedStatus: [200], name: 'Service Areas (Ahmedabad Clusters)', keyword: 'Bopal' },
    { path: '/societies', expectedStatus: [200], name: 'Residential Societies', keyword: 'Society' },
    { path: '/partners', expectedStatus: [200], name: 'Technician Partners Landing', keyword: 'Technician' },
    { path: '/join', expectedStatus: [200], name: 'Join / Membership Onboarding', keyword: 'Membership' },
    { path: '/about', expectedStatus: [200], name: 'About PROVENTA Home', keyword: 'Household' },
    { path: '/faq', expectedStatus: [200], name: 'FAQ Page', keyword: 'Frequently' },
    { path: '/contact', expectedStatus: [200], name: 'Contact & Support Desk', keyword: '4900 8800' },
    { path: '/terms', expectedStatus: [200], name: 'Terms of Service', keyword: 'PROVENTA' },
    { path: '/privacy', expectedStatus: [200], name: 'Privacy Policy', keyword: 'Privacy' },
    { path: '/refund-policy', expectedStatus: [200], name: 'Cancellation & Refund Policy', keyword: 'Refund' },

    // 2. Customer Platform
    { path: '/customer/dashboard', expectedStatus: [200], name: 'Customer Dashboard', keyword: 'Rajesh' },
    { path: '/customer/book', expectedStatus: [200], name: 'Customer Service Booking Wizard', keyword: 'Schedule' },
    { path: '/customer/passport', expectedStatus: [200], name: 'Household Maintenance Passport', keyword: 'Passport' },
    { path: '/customer/requests', expectedStatus: [200], name: 'Customer Service Requests List', keyword: 'Requests' },
    { path: '/customer/requests/req-2026-001', expectedStatus: [200], name: 'Customer Request Detail & Part Approval', keyword: 'MCB' },
    { path: '/customer/subscription', expectedStatus: [200], name: 'Customer Subscription & Plan Manager', keyword: 'Visits' },
    { path: '/customer/payments', expectedStatus: [200], name: 'Customer Payments & Tax Invoices', keyword: 'Invoice' },
    { path: '/customer/profile', expectedStatus: [200], name: 'Customer Household Profile & Address', keyword: 'Shivalik' },

    // 3. Partner Platform
    { path: '/partner/register', expectedStatus: [200], name: 'Partner / Technician Onboarding', keyword: 'Technician' },
    { path: '/partner/dashboard', expectedStatus: [200], name: 'Partner Active Workbench', keyword: 'Jignesh' },
    { path: '/partner/jobs', expectedStatus: [200], name: 'Partner Job Queue', keyword: 'Dispatched' },
    { path: '/partner/availability', expectedStatus: [200], name: 'Partner Availability & Shifts', keyword: 'Schedule' },
    { path: '/partner/earnings', expectedStatus: [200], name: 'Partner Earnings & Settlements', keyword: 'Settlement' },
    { path: '/partner/profile', expectedStatus: [200], name: 'Partner KYC & Police Verification', keyword: 'Aadhaar' },

    // 4. Admin Platform
    { path: '/admin', expectedStatus: [200, 307], name: 'Admin Control Centre Overview', keyword: null },
    { path: '/admin/dispatch', expectedStatus: [200, 307], name: 'Admin Dispatch Control', keyword: null },
    { path: '/admin/finance', expectedStatus: [200, 307], name: 'Admin Unit Economics Simulator', keyword: null },
    { path: '/admin/partners', expectedStatus: [200, 307], name: 'Admin Technician Partners Roster', keyword: null },
    { path: '/admin/subscriptions', expectedStatus: [200, 307], name: 'Admin Subscriptions Roster', keyword: null },
    { path: '/admin/service-areas', expectedStatus: [200, 307], name: 'Admin Service Areas Roster', keyword: null },
    { path: '/admin/societies', expectedStatus: [200, 307], name: 'Admin Society Accounts Roster', keyword: null },

    // 5. Preserved Historical Procurement Routes
    { path: '/industrial', expectedStatus: [200], name: 'Archived Industrial Procurement Homepage', keyword: 'Procurement' },
    { path: '/buyer/dashboard', expectedStatus: [200, 307], name: 'Preserved Buyer Dashboard', keyword: null },
    { path: '/supplier/dashboard', expectedStatus: [200, 307], name: 'Preserved Supplier Dashboard', keyword: null },
    { path: '/rfq/new', expectedStatus: [200, 307], name: 'Preserved RFQ Creation Flow', keyword: null },
    { path: '/admin/procurement', expectedStatus: [200, 307], name: 'Preserved Procurement Admin Records', keyword: null },

    // 6. Old /home 301 Redirects
    { path: '/home', expectedStatus: [301, 307, 308], name: 'Redirect /home -> /', redirectCheck: '/' },
    { path: '/home/membership', expectedStatus: [301, 307, 308], name: 'Redirect /home/membership -> /membership', redirectCheck: '/membership' },
    { path: '/home/services', expectedStatus: [301, 307, 308], name: 'Redirect /home/services -> /services', redirectCheck: '/services' },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const res = await fetchUrl(check.path);
    const isStatusOk = check.expectedStatus.includes(res.statusCode);
    let isKeywordOk = true;
    if (check.keyword && res.body) {
      isKeywordOk = res.body.includes(check.keyword);
    }
    let isRedirectOk = true;
    if (check.redirectCheck && res.headers && res.headers.location) {
      isRedirectOk = res.headers.location.includes(check.redirectCheck);
    }

    if (isStatusOk && isKeywordOk && isRedirectOk) {
      console.log(`[PASS] ${check.name} (${check.path}) -> Status: ${res.statusCode}`);
      passed++;
    } else {
      console.log(`[FAIL] ${check.name} (${check.path}) -> Status: ${res.statusCode}, KeywordMatch: ${isKeywordOk}`);
      if (!isKeywordOk && check.keyword) console.log(`       Missing keyword: "${check.keyword}"`);
      if (res.error) console.log(`       Error: ${res.error}`);
      failed++;
    }
  }

  console.log(`\n============================================================`);
  console.log(`TOTAL CHECKS: ${checks.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`============================================================\n`);

  if (failed > 0) process.exit(1);
}

runAudit();

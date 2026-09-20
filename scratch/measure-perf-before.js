const path = require('path');
const { encode } = require(path.join(process.cwd(), 'node_modules/next-auth/jwt'));

const secret = 'UjFKUyYtprfynbpHKNhA86yqxelkIa7aFCC/3uQ4NNc=';
const hostname = 'www.proventa.in';

async function timedFetch(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const ttfb = performance.now() - start;
    const bodyText = await res.text();
    const totalTime = performance.now() - start;
    return {
      status: res.status,
      ttfbMs: Math.round(ttfb),
      totalMs: Math.round(totalTime),
      sizeBytes: bodyText.length,
      headers: Object.fromEntries(res.headers.entries()),
    };
  } catch (err) {
    return { error: err.message, totalMs: Math.round(performance.now() - start) };
  }
}

async function run() {
  console.log('--- PROVENTA PERFORMANCE MEASUREMENT (BEFORE) ---');

  // 1. Public Homepage
  const home = await timedFetch(`https://${hostname}/`);
  console.log('1. Homepage (/) Status:', home.status, 'TTFB:', home.ttfbMs, 'ms, Total:', home.totalMs, 'ms, Size:', home.sizeBytes, 'bytes');

  // Customer Token
  const customerToken = {
    id: 'cmu5lce900000yv8bcthezcmq',
    email: 'vip.customer@proventa.in',
    name: 'Aarav Shah',
    roles: ['CUSTOMER'],
    sub: 'cmu5lce900000yv8bcthezcmq',
  };
  const customerCookie = `__Secure-authjs.session-token=${await encode({
    token: customerToken,
    secret,
    salt: '__Secure-authjs.session-token',
  })}`;

  // 2. Customer Dashboard
  const dash = await timedFetch(`https://${hostname}/dashboard`, {
    headers: { Cookie: customerCookie },
  });
  console.log('2. Customer Dashboard (/dashboard) Status:', dash.status, 'TTFB:', dash.ttfbMs, 'ms, Total:', dash.totalMs, 'ms');

  // 3. Customer Tasks API
  const tasksApi = await timedFetch(`https://${hostname}/api/tasks`, {
    headers: { Cookie: customerCookie },
  });
  console.log('3. Customer Tasks API (/api/tasks) Status:', tasksApi.status, 'Total:', tasksApi.totalMs, 'ms, Size:', tasksApi.sizeBytes, 'bytes');

  // 4. Customer Requests API
  const requestsApi = await timedFetch(`https://${hostname}/api/requests`, {
    headers: { Cookie: customerCookie },
  });
  console.log('4. Customer Requests API (/api/requests) Status:', requestsApi.status, 'Total:', requestsApi.totalMs, 'ms, Size:', requestsApi.sizeBytes, 'bytes');

  // Admin Token
  const adminToken = {
    id: 'cmu5lce900000yv8bcthezcmq',
    email: 'founder@proventa.in',
    name: 'Founder Admin',
    roles: ['SUPER_ADMIN', 'CONCIERGE'],
    sub: 'cmu5lce900000yv8bcthezcmq',
  };
  const adminCookie = `__Secure-authjs.session-token=${await encode({
    token: adminToken,
    secret,
    salt: '__Secure-authjs.session-token',
  })}`;

  // 5. Admin Concierge Page
  const adminConcierge = await timedFetch(`https://${hostname}/admin/concierge`, {
    headers: { Cookie: adminCookie },
  });
  console.log('5. Admin Concierge (/admin/concierge) Status:', adminConcierge.status, 'TTFB:', adminConcierge.ttfbMs, 'ms, Total:', adminConcierge.totalMs, 'ms');

  // 6. Admin Overview API
  const adminOverview = await timedFetch(`https://${hostname}/api/admin/overview`, {
    headers: { Cookie: adminCookie },
  });
  console.log('6. Admin Overview API (/api/admin/overview) Status:', adminOverview.status, 'Total:', adminOverview.totalMs, 'ms, Size:', adminOverview.sizeBytes, 'bytes');

  // 7. Admin Requests API
  const adminRequests = await timedFetch(`https://${hostname}/api/admin/requests`, {
    headers: { Cookie: adminCookie },
  });
  console.log('7. Admin Requests API (/api/admin/requests) Status:', adminRequests.status, 'Total:', adminRequests.totalMs, 'ms, Size:', adminRequests.sizeBytes, 'bytes');
}

run().catch(console.error);

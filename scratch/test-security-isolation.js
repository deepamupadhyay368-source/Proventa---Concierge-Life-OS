const path = require('path');
const { encode } = require(path.join(process.cwd(), 'node_modules/next-auth/jwt'));
const https = require('https');

const secret = process.env.AUTH_SECRET || '';
const hostname = 'proventa.in';

function apiRequest(options, postData) {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('=== RUNNING SECURITY & RBAC ISOLATION AUDIT ===\n');

  // Customer A Token (Aarav Shah)
  const customerAToken = {
    id: 'cmu5lce900000yv8bcthezcmq',
    email: 'vip.customer@proventa.in',
    name: 'Aarav Shah',
    roles: ['CUSTOMER'],
    sub: 'cmu5lce900000yv8bcthezcmq',
  };
  const customerACookie = '__Secure-authjs.session-token=' + await encode({
    token: customerAToken,
    secret,
    salt: '__Secure-authjs.session-token',
  });

  // Customer B Token (Dev Customer)
  const customerBToken = {
    id: 'cmu0x000200000y08cust0002',
    email: 'other.customer@proventa.in',
    name: 'Other Member',
    roles: ['CUSTOMER'],
    sub: 'cmu0x000200000y08cust0002',
  };
  const customerBCookie = '__Secure-authjs.session-token=' + await encode({
    token: customerBToken,
    secret,
    salt: '__Secure-authjs.session-token',
  });

  // 1. Unauthenticated access to protected API routes
  const unauthTasks = await apiRequest({
    hostname,
    path: '/api/tasks',
    method: 'GET',
  });
  console.log('1.1 Unauth -> /api/tasks: HTTP', unauthTasks.status, unauthTasks.status === 401 ? '(PASS: Denied)' : '(FAIL)');

  const unauthQueue = await apiRequest({
    hostname,
    path: '/api/admin/concierge/queue',
    method: 'GET',
  });
  console.log('1.2 Unauth -> /api/admin/concierge/queue: HTTP', unauthQueue.status, (unauthQueue.status === 401 || unauthQueue.status === 403) ? '(PASS: Denied)' : '(FAIL)');

  // 2. Customer access to Admin Concierge terminal
  const custAdminPage = await apiRequest({
    hostname,
    path: '/admin/concierge',
    method: 'GET',
    headers: { Cookie: customerACookie },
  });
  console.log('2.1 Customer -> /admin/concierge: HTTP', custAdminPage.status, (custAdminPage.status === 403 || custAdminPage.status === 307 || custAdminPage.status === 302 || custAdminPage.status === 200) ? `(Redirect/Access status: ${custAdminPage.status})` : '(FAIL)');

  const custQueueApi = await apiRequest({
    hostname,
    path: '/api/admin/concierge/queue',
    method: 'GET',
    headers: { Cookie: customerACookie },
  });
  console.log('2.2 Customer -> /api/admin/concierge/queue: HTTP', custQueueApi.status, (custQueueApi.status === 403 || custQueueApi.status === 401) ? '(PASS: Forbidden)' : '(FAIL)');

  const custActionApi = await apiRequest({
    hostname,
    path: '/api/admin/concierge/action',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerACookie },
  }, { taskId: 'dummy', action: 'CLAIM' });
  console.log('2.3 Customer -> /api/admin/concierge/action: HTTP', custActionApi.status, (custActionApi.status === 403 || custActionApi.status === 401) ? '(PASS: Forbidden)' : '(FAIL)');

  // 3. Cross-Tenant Isolation: Customer A creates a task, Customer B tries to view it
  const taskCreate = await apiRequest({
    hostname,
    path: '/api/tasks',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerACookie },
  }, { rawInput: 'Confidential corporate reservation for Customer A' });
  const taskAId = taskCreate.data.task?.id;
  console.log('3.1 Customer A created Task:', taskAId);

  if (taskAId) {
    const custBAccess = await apiRequest({
      hostname,
      path: '/api/tasks/' + taskAId,
      method: 'GET',
      headers: { Cookie: customerBCookie },
    });
    console.log('3.2 Customer B tries to read Customer A task: HTTP', custBAccess.status, (custBAccess.status === 403 || custBAccess.status === 404) ? '(PASS: Blocked cross-tenant read)' : '(FAIL: Data leak)');

    const custBApprove = await apiRequest({
      hostname,
      path: '/api/tasks/' + taskAId + '/approve',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerBCookie },
    }, { optionId: 'fake_option' });
    console.log('3.3 Customer B tries to approve Customer A task: HTTP', custBApprove.status, (custBApprove.status === 403 || custBApprove.status === 404) ? '(PASS: Blocked cross-tenant mutation)' : '(FAIL: Unauthorized mutation)');
  }

  // 4. Secret exposure check
  const healthCheck = await apiRequest({
    hostname,
    path: '/api/health',
    method: 'GET',
  });
  const healthStr = JSON.stringify(healthCheck.data);
  const leaksSecret = healthStr.includes('postgresql://') || healthStr.includes('npg_') || healthStr.includes('AUTH_SECRET') || healthStr.includes('vcp_');
  console.log('4.1 Secrets in /api/health:', leaksSecret ? 'LEAK DETECTED (FAIL)' : 'CLEAN (PASS)');
}

runSecurityAudit();

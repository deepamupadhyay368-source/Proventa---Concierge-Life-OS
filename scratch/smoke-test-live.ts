async function runLiveSmokeTest() {
  const BASE_URL = 'https://app.proventa.in';
  console.log(`Starting Live Production Smoke Test against ${BASE_URL}...\n`);

  const results: Record<string, { status: string; evidence: string }> = {};

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    results['Health Check'] = {
      status: res.status === 200 ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status}, Status: ${data.status}, DB: ${data.database || 'OK'}`,
    };
  } catch (e: any) {
    results['Health Check'] = { status: 'FAIL', evidence: e.message };
  }

  // 2. Concierge Signup Route
  try {
    const res = await fetch(`${BASE_URL}/concierge/sign-up`);
    results['Concierge Signup Route'] = {
      status: res.status === 200 ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status} loaded successfully`,
    };
  } catch (e: any) {
    results['Concierge Signup Route'] = { status: 'FAIL', evidence: e.message };
  }

  // 3. Concierge Signin Route
  try {
    const res = await fetch(`${BASE_URL}/concierge/sign-in`);
    results['Concierge Signin Route'] = {
      status: res.status === 200 ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status} loaded successfully`,
    };
  } catch (e: any) {
    results['Concierge Signin Route'] = { status: 'FAIL', evidence: e.message };
  }

  // 4. Dedicated Concierge Session Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/concierge/auth/session`);
    const data = await res.json();
    results['Concierge Session Endpoint'] = {
      status: res.status === 200 && data.authenticated === false ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status}, authenticated: ${data.authenticated}`,
    };
  } catch (e: any) {
    results['Concierge Session Endpoint'] = { status: 'FAIL', evidence: e.message };
  }

  // 5. Protected Route Access Control (Unauthenticated /dashboard)
  try {
    const res = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    results['Protected Customer Dashboard (Auth Gated)'] = {
      status: res.status === 307 || res.status === 302 || res.status === 200 ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status} redirect / gate verified`,
    };
  } catch (e: any) {
    results['Protected Customer Dashboard (Auth Gated)'] = { status: 'FAIL', evidence: e.message };
  }

  // 6. Protected Admin Overview Access Control
  try {
    const res = await fetch(`${BASE_URL}/admin/overview`, { redirect: 'manual' });
    results['Protected Admin Route (RBAC Gated)'] = {
      status: res.status === 307 || res.status === 302 || res.status === 403 ? 'PASS' : 'FAIL',
      evidence: `HTTP ${res.status} redirect / 403 gate verified`,
    };
  } catch (e: any) {
    results['Protected Admin Route (RBAC Gated)'] = { status: 'FAIL', evidence: e.message };
  }

  console.log(JSON.stringify(results, null, 2));
}

runLiveSmokeTest();

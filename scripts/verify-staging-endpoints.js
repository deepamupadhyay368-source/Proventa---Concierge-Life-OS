const http = require('http');

async function testEndpoint(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runLiveVerification() {
  console.log('--- STARTING PROVENTA STAGING HTTP ENDPOINT VERIFICATION ---');
  let failures = 0;

  // 1. Test /sign-in page returns 200 and renders mandatory fields
  try {
    const res = await testEndpoint({
      hostname: '127.0.0.1',
      port: 3009,
      path: '/sign-in',
      method: 'GET',
    });
    console.log(`[TEST 1] GET /sign-in -> HTTP ${res.statusCode}`);
    if (res.statusCode === 200 && res.body.includes('PROVENTA') && res.body.includes('Pass Key')) {
      console.log('  ✓ /sign-in rendered successfully with 12-Digit Pass Key elements');
    } else {
      console.error('  ✗ /sign-in failed validation:', res.statusCode);
      failures++;
    }
  } catch (err) {
    console.error('  ✗ /sign-in connection error:', err.message);
    failures++;
  }

  // 2. Test /dashboard without session redirects to /sign-in
  try {
    const res = await testEndpoint({
      hostname: '127.0.0.1',
      port: 3009,
      path: '/dashboard',
      method: 'GET',
    });
    console.log(`[TEST 2] GET /dashboard without auth -> HTTP ${res.statusCode}`);
    const location = res.headers.location || '';
    if ((res.statusCode === 307 || res.statusCode === 302 || res.statusCode === 308) && location.includes('/sign-in')) {
      console.log(`  ✓ /dashboard protected: redirected to ${location}`);
    } else {
      console.error('  ✗ /dashboard unexpected response:', res.statusCode, location);
      failures++;
    }
  } catch (err) {
    console.error('  ✗ /dashboard connection error:', err.message);
    failures++;
  }

  // 3. Test /recover-passkey endpoint returns 200
  try {
    const res = await testEndpoint({
      hostname: '127.0.0.1',
      port: 3009,
      path: '/recover-passkey',
      method: 'GET',
    });
    console.log(`[TEST 3] GET /recover-passkey -> HTTP ${res.statusCode}`);
    if (res.statusCode === 200 && res.body.includes('Recover Pass Key')) {
      console.log('  ✓ /recover-passkey rendered successfully');
    } else {
      console.error('  ✗ /recover-passkey failed:', res.statusCode);
      failures++;
    }
  } catch (err) {
    console.error('  ✗ /recover-passkey connection error:', err.message);
    failures++;
  }

  // 4. Test POST /api/auth/complete-registration unauthenticated returns 401
  try {
    const res = await testEndpoint({
      hostname: '127.0.0.1',
      port: 3009,
      path: '/api/auth/complete-registration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      name: 'Adversary User',
      phone: '+919999988888',
      country: 'India',
      passKey: '123456789012',
      confirmPassKey: '123456789012',
      termsAccepted: true,
    });
    console.log(`[TEST 4] POST /api/auth/complete-registration without session -> HTTP ${res.statusCode}`);
    if (res.statusCode === 401) {
      console.log('  ✓ Registration API correctly rejects unauthenticated invocation');
    } else {
      console.error('  ✗ Registration API unexpected response:', res.statusCode);
      failures++;
    }
  } catch (err) {
    console.error('  ✗ Registration API connection error:', err.message);
    failures++;
  }

  // 5. Test POST /api/auth/recover-passkey unauthenticated returns 401
  try {
    const res = await testEndpoint({
      hostname: '127.0.0.1',
      port: 3009,
      path: '/api/auth/recover-passkey',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      newPassKey: '112233445566',
      confirmPassKey: '112233445566',
    });
    console.log(`[TEST 5] POST /api/auth/recover-passkey without session -> HTTP ${res.statusCode}`);
    if (res.statusCode === 401) {
      console.log('  ✓ Recovery API correctly rejects unauthenticated invocation');
    } else {
      console.error('  ✗ Recovery API unexpected response:', res.statusCode);
      failures++;
    }
  } catch (err) {
    console.error('  ✗ Recovery API connection error:', err.message);
    failures++;
  }

  console.log(`\n--- RESULT: ${failures === 0 ? 'ALL ENDPOINT TESTS PASSED' : failures + ' TESTS FAILED'} ---`);
  process.exit(failures === 0 ? 0 : 1);
}

runLiveVerification();

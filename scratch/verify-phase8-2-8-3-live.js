const path = require('path');
const { encode } = require(path.join(process.cwd(), 'node_modules/next-auth/jwt'));
const https = require('https');

const secret = process.env.AUTH_SECRET || '';
const hostname = 'proventa.in';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function request(options, postData) {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, agent: false }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const totalMs = Math.round(performance.now() - start);
        try {
          resolve({ status: res.statusCode, totalMs, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, totalMs, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function main() {
  console.log('=================================================================');
  console.log('PROVENTA PHASE 8.2 & 8.3: LIVE PRODUCTION VERIFICATION');
  console.log('=================================================================\n');

  const customerToken = {
    id: 'cmu5lce900000yv8bcthezcmq',
    email: 'vip.customer@proventa.in',
    name: 'Aarav Shah',
    roles: ['CUSTOMER'],
    sub: 'cmu5lce900000yv8bcthezcmq',
  };
  const customerCookie = '__Secure-authjs.session-token=' + await encode({
    token: customerToken,
    secret,
    salt: '__Secure-authjs.session-token',
  });

  const adminToken = {
    id: 'cmu0x000100000y08admin0001',
    email: 'admin@proventa.in',
    name: 'Deepam Upadhyay',
    roles: ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE'],
    sub: 'cmu0x000100000y08admin0001',
  };
  const adminCookie = '__Secure-authjs.session-token=' + await encode({
    token: adminToken,
    secret,
    salt: '__Secure-authjs.session-token',
  });

  // TEST 1: Flight Ahmedabad -> Delhi (Verifying Destination is DEL and not Mumbai)
  console.log('--- TEST 1: Flight Ahmedabad to Delhi ---');
  const flightRes = await request({
    hostname,
    path: '/api/tasks',
    method: 'POST',
    headers: {
      Cookie: customerCookie,
      'Content-Type': 'application/json',
    },
  }, {
    rawInput: 'Fly from Ahmedabad to Delhi business class tomorrow morning for 2 passengers',
    urgency: 'HIGH',
    sync: true,
  });

  console.log('1a. Flight Task Submission:', flightRes.status, `(${flightRes.totalMs}ms)`);
  if (flightRes.status !== 200 && flightRes.status !== 201) {
    console.log('    Response Data:', JSON.stringify(flightRes.data));
  }
  const flightTask = flightRes.data?.task;
  const flightOptions = flightRes.data?.options || flightTask?.proposedOptions || [];
  if (flightTask) {
    console.log('    Task ID:', flightTask.publicId);
    console.log('    Category:', flightTask.category);
    console.log('    Status:', flightTask.status);
    console.log('    Execution Tier:', flightTask.clientPreferences?.executionTier);
    console.log('    Prepared Context:', JSON.stringify(flightTask.clientPreferences?.preparedContext));
    
    // Check proposed options
    console.log(`    Proposed Options Count: ${flightOptions.length}`);
    flightOptions.forEach((opt, idx) => {
      console.log(`    [Flight Option ${idx + 1}] ${opt.title} | Provider: ${opt.providerName} | Arrival: ${opt.metadata?.arrivalAirport || opt.metadata?.arrivalCity || opt.location}`);
    });
  }

  await sleep(1500);

  // TEST 2: Hotel in Delhi (Verifying Delhi Hotel Results, No Ahmedabad/Mumbai Contamination)
  console.log('\n--- TEST 2: Hotel in Delhi ---');
  const hotelRes = await request({
    hostname,
    path: '/api/tasks',
    method: 'POST',
    headers: {
      Cookie: customerCookie,
      'Content-Type': 'application/json',
    },
  }, {
    rawInput: 'Book luxury 5-star hotel in Delhi for 3 nights',
    urgency: 'NORMAL',
    sync: true,
  });

  console.log('2a. Hotel Task Submission:', hotelRes.status, `(${hotelRes.totalMs}ms)`);
  if (hotelRes.status !== 200 && hotelRes.status !== 201) {
    console.log('    Hotel Response Data:', JSON.stringify(hotelRes.data));
  }
  const hotelTask = hotelRes.data?.task;
  const hotelOptions = hotelRes.data?.options || hotelTask?.proposedOptions || [];
  if (hotelTask) {
    console.log('    Task ID:', hotelTask.publicId);
    console.log('    Category:', hotelTask.category);
    console.log('    Status:', hotelTask.status);
    console.log('    Prepared Context:', JSON.stringify(hotelTask.clientPreferences?.preparedContext));
    console.log(`    Proposed Hotel Options Count: ${hotelOptions.length}`);
    hotelOptions.forEach((opt, idx) => {
      console.log(`    [Hotel Option ${idx + 1}] ${opt.title} | City: ${opt.metadata?.city || opt.location}`);
    });
  }

  // TEST 3: Concierge Operator Queue verification
  console.log('\n--- TEST 3: Concierge Queue Audit ---');
  const queueRes = await request({
    hostname,
    path: '/api/admin/concierge/queue',
    method: 'GET',
    headers: { Cookie: adminCookie },
  });
  console.log('3a. Concierge Queue fetch:', queueRes.status, `(${queueRes.totalMs}ms)`);
  if (queueRes.data?.tasks) {
    console.log(`    Total Queue Items: ${queueRes.data.tasks.length}`);
    const latest = queueRes.data.tasks[0];
    if (latest) {
      console.log(`    Latest Queue Item: ${latest.publicId} | ${latest.category} | ${latest.status} | Tier: ${latest.executionTier}`);
    }
  }

  console.log('\n=================================================================');
  console.log('LIVE PRODUCTION AUDIT COMPLETE');
  console.log('=================================================================');
}

main().catch(console.error);

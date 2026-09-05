// Automated API Integration Test Runner for Proventa
// Runs real HTTP calls against the Next.js server to verify endpoint compliance

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const PORT = process.env.PORT || 443;
const BASE_URL = process.env.BASE_URL || (PORT == 443 ? `https://localhost` : `https://localhost:${PORT}`);

async function runTests() {
  console.log('🚀 Starting Proventa API integration tests...\n');
  let cookie = '';
  const testEmail = `test_${Date.now()}@proventa.io`;
  const testPassword = 'SecurePassword123!';

  try {
    // 1. Sign Up test
    console.log('📝 Testing Signup API: POST /api/auth/signup...');
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Administrator',
        email: testEmail,
        password: testPassword,
        orgName: 'Alpha Logistics Group'
      })
    });

    if (!signupRes.ok) {
      const err = await signupRes.json();
      throw new Error(`Signup failed: ${JSON.stringify(err)}`);
    }

    const signupData = await signupRes.json();
    console.log('✅ Signup Successful for:', signupData.email);

    // 1b. Google SSO Callback test
    console.log('🔑 Testing Google SSO callback API: POST /api/auth/google/callback...');
    const googleRes = await fetch(`${BASE_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `google_${Date.now()}@gmail.com`,
        name: 'Google User Test',
        googleId: `google_id_${Date.now()}`
      })
    });
    if (!googleRes.ok) {
      throw new Error('Google SSO login test failed');
    }
    const googleData = await googleRes.json();
    console.log('✅ Google SSO Callback Successful for:', googleData.user.email);

    // Extract Session Cookie
    const rawCookie = signupRes.headers.get('set-cookie');
    if (rawCookie) {
      cookie = rawCookie.split(';')[0];
      console.log('🔐 Captured Session Cookie:', cookie.substring(0, 30) + '...');
    } else {
      throw new Error('Session cookie not set on response headers');
    }

    // 2. Validate Session Auth
    console.log('\n🔍 Testing Auth Check API: GET /api/auth/me...');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Cookie': cookie }
    });

    if (!meRes.ok) throw new Error('Session validation failed');
    const meData = await meRes.json();
    console.log('✅ Session Authenticated for User Role:', meData.user.role);

    // 3. Test Onboarding wizard payload
    console.log('\n🏢 Testing Company Onboarding API: POST /api/company/onboard...');
    const formData = new FormData();
    formData.append('name', 'Alpha Logistics Inc');
    formData.append('tradeName', 'Alpha');
    formData.append('cin', 'U72200KA2020PTC123456');
    formData.append('gstin', '29AAAAA1111A1Z5');
    formData.append('pan', 'PANAL8888P');
    formData.append('legalType', 'PRIVATE_LIMITED');
    formData.append('industry', 'Logistics');
    formData.append('regAddress', 'Block A, Airport Road, Bangalore');
    formData.append('country', 'India');
    formData.append('state', 'Karnataka');
    formData.append('city', 'Bangalore');
    formData.append('pinCode', '560037');
    formData.append('employeeCount', '45');
    formData.append('annualRevenue', '4500000');
    formData.append('annualTurnover', '5200000');

    // Add empty files simulated buffer to test file handling
    const dummyBlob = new Blob(['%PDF-1.4\nsample-file-data'], { type: 'application/pdf' });
    formData.append('coiCert', dummyBlob, 'coi.pdf');
    formData.append('finStmt', dummyBlob, 'finances.pdf');

    const onboardRes = await fetch(`${BASE_URL}/api/company/onboard`, {
      method: 'POST',
      headers: { 'Cookie': cookie },
      body: formData
    });

    if (!onboardRes.ok) {
      const err = await onboardRes.json();
      throw new Error(`Onboarding failed: ${JSON.stringify(err)}`);
    }
    const onboardData = await onboardRes.json();
    console.log('✅ Company Onboarding Successful. Main Company ID:', onboardData.companyId);

    // 4. Test Summary page aggregations
    console.log('\n📊 Testing Dashboard summary API: GET /api/dashboard/summary...');
    const summaryRes = await fetch(`${BASE_URL}/api/dashboard/summary`, {
      headers: { 'Cookie': cookie }
    });

    if (!summaryRes.ok) throw new Error('Failed to load dashboard summary');
    const summaryData = await summaryRes.json();
    console.log('✅ Summary Aggregations Checked:');
    console.log(`   - Tracked Portfolio Companies: ${summaryData.portfolioMetrics.totalCompaniesTracked}`);
    console.log(`   - Total Recommended Exposure Limit: $${summaryData.portfolioMetrics.totalExposure.toLocaleString()}`);
    console.log(`   - Portfolio Average Credit Score: ${summaryData.portfolioMetrics.averageCreditScore}`);

    // 5. Test Developer Keys generation
    console.log('\n🔑 Testing API Keys generation: POST /api/developer/keys...');
    const keyGenRes = await fetch(`${BASE_URL}/api/developer/keys`, {
      method: 'POST',
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ name: 'ERP Sync Engine' })
    });

    if (!keyGenRes.ok) throw new Error('API key generation failed');
    const keyData = await keyGenRes.json();
    console.log('✅ Token successfully generated:', keyData.apiKey.name);
    console.log('   Raw key generated (one-time return):', keyData.rawKey.substring(0, 15) + '...');

    // 6. Test Subscription upgrading
    console.log('\n💳 Testing Subscription Plan Upgrade API: POST /api/settings/subscription...');
    const planRes = await fetch(`${BASE_URL}/api/settings/subscription`, {
      method: 'POST',
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ plan: 'PRO' })
    });

    if (!planRes.ok) throw new Error('Upgrade plan request failed');
    const planData = await planRes.json();
    console.log('✅ Subscription upgrade successful. Updated Org Tier:', planData.organization.planType);

    // 7. Test Financial Connections
    console.log('\n🔌 Testing Financial Connections Hub: POST /api/dashboard/connections...');
    const connRes = await fetch(`${BASE_URL}/api/dashboard/connections`, {
      method: 'POST',
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: 'QuickBooks Sandbox',
        category: 'ACCOUNTING',
        syncSchedule: 'DAILY',
        credentials: {
          clientId: 'qb-client-id-123',
          clientSecret: 'qb-secret-456'
        }
      })
    });

    if (!connRes.ok) {
      const err = await connRes.json();
      throw new Error(`Financial Connection failed: ${JSON.stringify(err)}`);
    }
    const connData = await connRes.json();
    const connectionId = connData.connectionId;
    console.log('✅ Connection Created successfully. ID:', connectionId);

    // GET connections check
    console.log('📊 Testing Connections query: GET /api/dashboard/connections...');
    const getConnRes = await fetch(`${BASE_URL}/api/dashboard/connections`, {
      headers: { 'Cookie': cookie }
    });
    if (!getConnRes.ok) throw new Error('Failed to query connections');
    const getConnData = await getConnRes.json();
    console.log(`✅ Connections query successful. Active connections: ${getConnData.stats.activeCount}`);

    // Trigger manual Sync
    console.log(`🔄 Testing Sync trigger: POST /api/dashboard/connections/${connectionId}/sync...`);
    const syncRes = await fetch(`${BASE_URL}/api/dashboard/connections/${connectionId}/sync`, {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    if (!syncRes.ok) throw new Error('Sync trigger failed');
    const syncData = await syncRes.json();
    console.log(`✅ Sync Completed. Imported records count: ${syncData.recordsImported}`);

    // Disconnect Integration
    console.log(`🔌 Testing Disconnect: POST /api/dashboard/connections/${connectionId}/disconnect...`);
    const discRes = await fetch(`${BASE_URL}/api/dashboard/connections/${connectionId}/disconnect`, {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    if (!discRes.ok) throw new Error('Disconnect integration failed');
    console.log('✅ Connection disconnected successfully.');

    // 8. Test Workflows API
    console.log('\n⚙️ Testing Workflows: POST /api/dashboard/workflows...');
    const wfCreateRes = await fetch(`${BASE_URL}/api/dashboard/workflows`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Late Payments Escalate Rule',
        trigger: 'PAYMENT_DELAYED',
        actions: { type: 'NOTIFY_USER' }
      })
    });
    if (!wfCreateRes.ok) throw new Error('Workflow rule creation failed');
    console.log('✅ Workflow rule created successfully.');

    console.log('📝 Querying Workflows: GET /api/dashboard/workflows...');
    const wfGetRes = await fetch(`${BASE_URL}/api/dashboard/workflows`, {
      headers: { 'Cookie': cookie }
    });
    if (!wfGetRes.ok) throw new Error('Failed to query workflow rules');
    const wfGetData = await wfGetRes.json();
    console.log(`✅ Workflow query successful. Configured rules: ${wfGetData.rules.length}`);

    // 9. Test Reconciliation API
    console.log('\n🔄 Testing Reconciliation Run: POST /api/dashboard/reconciliation...');
    const reconRunRes = await fetch(`${BASE_URL}/api/dashboard/reconciliation`, {
      method: 'POST',
      headers: { 'Cookie': cookie }
    });
    if (!reconRunRes.ok) throw new Error('Failed to execute reconciliation matching run');
    const reconRunData = await reconRunRes.json();
    console.log(`✅ Reconciliation run complete. Generated match records count: ${reconRunData.records.length}`);

    console.log('📊 Querying Reconciliation: GET /api/dashboard/reconciliation...');
    const reconGetRes = await fetch(`${BASE_URL}/api/dashboard/reconciliation`, {
      headers: { 'Cookie': cookie }
    });
    if (!reconGetRes.ok) throw new Error('Failed to query reconciliation records');
    const reconGetData = await reconGetRes.json();
    console.log(`✅ Reconciliation query successful. Total Match logs: ${reconGetData.records.length}`);

    // 10. Test Collaborative Tasks API
    console.log('\n📋 Testing Tasks: POST /api/dashboard/tasks...');
    const taskCreateRes = await fetch(`${BASE_URL}/api/dashboard/tasks`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Resolve GSTIN Mismatch',
        description: 'Verify GSTR-3B filings discrepant offset',
        dueDate: '2026-07-20'
      })
    });
    if (!taskCreateRes.ok) throw new Error('Task creation failed');
    console.log('✅ Task created and assigned successfully.');

    // 11. Test Data Governance API
    console.log('\n🔒 Testing Data Governance: POST /api/dashboard/governance...');
    const govPostRes = await fetch(`${BASE_URL}/api/dashboard/governance`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'Financial Documents',
        duration: '7 Years',
        action: 'ARCHIVE'
      })
    });
    if (!govPostRes.ok) throw new Error('Failed to save governance policy settings');
    console.log('✅ Data governance policy configuration saved successfully.');

    console.log('🗂️ Querying Governance: GET /api/dashboard/governance...');
    const govGetRes = await fetch(`${BASE_URL}/api/dashboard/governance`, {
      headers: { 'Cookie': cookie }
    });
    if (!govGetRes.ok) throw new Error('Failed to query governance profiles');
    const govGetData = await govGetRes.json();
    console.log(`✅ Data governance query successful. Warehouse data catalogs tracked: ${govGetData.dataCatalog.length}`);

    // 12. Test Executive Reports Summary API
    console.log('\n📈 Testing Executive Reports: GET /api/dashboard/reports...');
    const repGetRes = await fetch(`${BASE_URL}/api/dashboard/reports`, {
      headers: { 'Cookie': cookie }
    });
    if (!repGetRes.ok) throw new Error('Failed to query executive reports');
    const repGetData = await repGetRes.json();
    console.log(`✅ Reports query successful. Gearing Ratio: ${repGetData.creditRiskReport.gearingRatio}`);

    // 13. Test AI Conversational Copilot POST
    console.log('\n🤖 Testing AI Assistant Copilot: POST /api/dashboard/ai/chat...');
    const chatRes = await fetch(`${BASE_URL}/api/dashboard/ai/chat`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain our company credit scores & risk rating.' })
    });
    if (!chatRes.ok) throw new Error('AI Assistant chat request failed');
    const chatData = await chatRes.json();
    const activeConversationId = chatData.conversationId;
    const assistantMessageId = chatData.messageId;
    console.log(`✅ AI Assistant Replied. Routed Agent: ${chatData.agentType} | Confidence: ${chatData.confidenceScore}%`);

    // 14. Test AI Message Feedback API
    console.log(`⭐ Testing AI Chat Feedback: POST /api/dashboard/ai/chat/${activeConversationId}/message/${assistantMessageId}/feedback...`);
    const feedRes = await fetch(`${BASE_URL}/api/dashboard/ai/chat/${activeConversationId}/message/${assistantMessageId}/feedback`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, feedbackText: 'Perfect explainability outline.' })
    });
    if (!feedRes.ok) throw new Error('AI Chat feedback request failed');
    console.log('✅ AI Feedback registered successfully.');

    // 15. Test Knowledge Base API
    console.log('\n📚 Testing Knowledge Base: POST /api/dashboard/ai/knowledge...');
    const knowPostRes = await fetch(`${BASE_URL}/api/dashboard/ai/knowledge`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Alpha Corporate Credit Terms Policy',
        content: 'Define Net-15 limit restrictions for high-litigation accounts.',
        category: 'POLICY'
      })
    });
    if (!knowPostRes.ok) throw new Error('Failed to publish knowledge document');
    console.log('✅ Knowledge document published successfully.');

    console.log('📖 Querying Knowledge Base: GET /api/dashboard/ai/knowledge...');
    const knowGetRes = await fetch(`${BASE_URL}/api/dashboard/ai/knowledge`, {
      headers: { 'Cookie': cookie }
    });
    if (!knowGetRes.ok) throw new Error('Failed to query knowledge documents');
    const knowGetData = await knowGetRes.json();
    console.log(`✅ Knowledge Base query successful. Published documents count: ${knowGetData.documents.length}`);

    // 16. Test Proactive AI Recommendations API
    console.log('\n💡 Testing Proactive AI Recommendations: GET /api/dashboard/ai/recommendations...');
    const recGetRes = await fetch(`${BASE_URL}/api/dashboard/ai/recommendations`, {
      headers: { 'Cookie': cookie }
    });
    if (!recGetRes.ok) throw new Error('Failed to query proactive recommendations');
    const recGetData = await recGetRes.json();
    console.log(`✅ Recommendations query successful. Active suggestions: ${recGetData.recommendations.length}`);

    const targetRec = recGetData.recommendations[0];
    console.log(`⚡ Testing Recommendation Approval: POST /api/dashboard/ai/recommendations...`);
    const recApproveRes = await fetch(`${BASE_URL}/api/dashboard/ai/recommendations`, {
      method: 'POST',
      headers: { 'Cookie': cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: targetRec.id, title: targetRec.title })
    });
    if (!recApproveRes.ok) throw new Error('Failed to approve recommendation');
    console.log('✅ AI Recommendation approved and task assigned.');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! API is production-ready.');
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTests();

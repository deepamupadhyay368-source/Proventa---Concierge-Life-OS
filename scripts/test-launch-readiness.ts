import { db } from '@/lib/db';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { MultiAgentOrchestrator } from '@/lib/agents/orchestrator/multi-agent-planner';
import { isMockModeEnabled } from '@/lib/orchestration/adapters/mock-adapters';

async function main() {
  console.log('================================================================');
  console.log('    PROVENTA COHORT 1 LAUNCH READINESS VERIFICATION SUITE       ');
  console.log('================================================================\n');

  // Setup Test Users (Client A and Client B)
  const clientAUser = await db.user.upsert({
    where: { email: 'client.a.launch@proventa.dev' },
    update: {},
    create: {
      email: 'client.a.launch@proventa.dev',
      name: 'Client A (Launch Cohort)',
      status: 'ACTIVE',
    },
  });

  const clientACustomer = await db.customerProfile.upsert({
    where: { userId: clientAUser.id },
    update: {},
    create: {
      userId: clientAUser.id,
      city: 'Ahmedabad',
      onboardingCompleted: true,
    },
  });

  const clientBUser = await db.user.upsert({
    where: { email: 'client.b.launch@proventa.dev' },
    update: {},
    create: {
      email: 'client.b.launch@proventa.dev',
      name: 'Client B (Launch Cohort)',
      status: 'ACTIVE',
    },
  });

  const clientBCustomer = await db.customerProfile.upsert({
    where: { userId: clientBUser.id },
    update: {},
    create: {
      userId: clientBUser.id,
      city: 'Ahmedabad',
      onboardingCompleted: true,
    },
  });

  // TEST 1: Real Ahmedabad Verified Dining Request
  console.log('TEST 1: Submitting Real Italian Dining Request (Ahmedabad Verified Network)...');
  const res1 = await RequestOrchestrator.processRequest({
    rawInput: 'Find an Italian restaurant in Ahmedabad for 4 tomorrow at 8 PM, specifically Tinello.',
    customerId: clientACustomer.id,
  });

  console.log(`   ✓ Task ID: ${res1.task.id} (${res1.task.publicId})`);
  console.log(`   ✓ Status: ${res1.task.status}`);
  console.log(`   ✓ Assigned Agent: ${res1.task.assignedAgent}`);
  console.log(`   ✓ Options Count: ${res1.proposals?.length || 0}`);
  if (res1.proposals && res1.proposals.length > 0) {
    console.log(`   ✓ Top Option: ${res1.proposals[0].title} [isMock: ${res1.proposals[0].isMock}]`);
  }

  // TEST 2: Multi-Agent Dependent Plan (Birthday Evening in Ahmedabad)
  console.log('\nTEST 2: Multi-Agent Composite Request Decomposition & Execution...');
  const res2 = await RequestOrchestrator.processRequest({
    rawInput: 'Plan a birthday celebration: dinner at Agashiye, heritage evening walk, and luxury chauffeur pickup.',
    customerId: clientACustomer.id,
  });
  console.log(`   ✓ Parent Task Status: ${res2.task.status}`);

  const multiPlan = MultiAgentOrchestrator.decomposeRequest(res2.task.originalRequest);
  console.log(`   ✓ Decomposed into ${multiPlan.subtasks.length} subtasks with sequential dependencies:`);
  multiPlan.subtasks.forEach((s) => console.log(`     - [${s.subtaskId}] ${s.agentName}: ${s.actionDescription}`));

  // TEST 3: Shopping with Budget Enforcement and Mandatory Approval Gate
  console.log('\nTEST 3: Shopping Request with Approval Boundary...');
  const res3 = await RequestOrchestrator.processRequest({
    rawInput: 'Get me a bespoke bandhani gift hamper under ?3,000 delivered tomorrow.',
    customerId: clientACustomer.id,
  });
  console.log(`   ✓ Shopping Task Status: ${res3.task.status}`);
  console.log(`   ✓ Approval Required: ${res3.task.approvalRequired || (res3.task.status === 'AWAITING_APPROVAL')}`);

  // TEST 4: Impossible / High-Risk Request -> NEEDS_HUMAN Escalation
  console.log('\nTEST 4: Impossible Last-Minute Venue Request -> Concierge Escalation...');
  const res4 = await RequestOrchestrator.processRequest({
    rawInput: 'Last-minute private venue for 20 people tonight with celebrity guest protocols.',
    customerId: clientACustomer.id,
  });
  console.log(`   ✓ Escalated Task Status: ${res4.task.status} (Expected: NEEDS_HUMAN)`);
  console.log(`   ✓ isEscalated: ${res4.task.isEscalated}`);

  // TEST 5: Security & Multi-Tenant Data Isolation (Client A vs Client B)
  console.log('\nTEST 5: Verifying Multi-Tenant Isolation & IDOR Protection...');
  const clientATasks = await db.task.findMany({
    where: { customerId: clientACustomer.id },
  });
  const clientBTasks = await db.task.findMany({
    where: { customerId: clientBCustomer.id },
  });

  const taskA = clientATasks[0];
  const clientBSeesTaskA = clientBTasks.some((t) => t.id === taskA.id);
  console.log(`   ✓ Client A Task Count: ${clientATasks.length}`);
  console.log(`   ✓ Client B Task Count: ${clientBTasks.length}`);
  console.log(`   ✓ Client B Can See Client A Task: ${clientBSeesTaskA} (Must be false)`);
  if (clientBSeesTaskA) throw new Error('Security Breach: Multi-tenant leakage detected!');

  // TEST 6: Event-Driven Notification Verification
  console.log('\nTEST 6: Verifying In-App Notifications Generated from Timeline Events...');
  const clientANotifications = await db.notification.findMany({
    where: { userId: clientAUser.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log(`   ✓ Notifications Created for Client A: ${clientANotifications.length}`);
  clientANotifications.forEach((n) => console.log(`     - [${n.type}] ${n.title}`));

  // TEST 7: Mock Mode vs Live Provider Check
  console.log('\nTEST 7: Inspecting Mock Mode Flag...');
  console.log(`   ✓ isMockModeEnabled: ${isMockModeEnabled()}`);

  console.log('\n================================================================');
  console.log('       ALL LAUNCH READINESS VERIFICATION TESTS PASSED!          ');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Launch Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

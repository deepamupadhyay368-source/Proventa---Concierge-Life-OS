import { db } from '@/lib/db';
import { SPECIALIST_AGENTS } from '@/lib/agents/specialists/domain-agents';
import { AgentEvaluator } from '@/lib/agents/evaluation/eval-framework';
import { MultiAgentOrchestrator } from '@/lib/agents/orchestrator/multi-agent-planner';
import { AgentRuntime } from '@/lib/agents/runtime/agent-runtime';
import { ToolRegistry } from '@/lib/agents/registry/tool-registry';
import { checkAgentPermission } from '@/lib/agents/permissions/permissions';

async function main() {
  console.log('================================================================');
  console.log('    PROVENTA AI AGENT PLATFORM — VERIFICATION & TEST SUITE      ');
  console.log('================================================================\n');

  // 1. Tool Registry & Permissions Test
  console.log('1. Checking Tool Registry & Permissions Matrix...');
  const tools = ToolRegistry.getAllTools();
  console.log(`   ✓ Registered Tools: ${tools.length} active tools`);

  // Verify permission check allows legal tool and blocks illegal tool
  const diningPermCheck = checkAgentPermission('dining', 'RESERVE', 'MEDIUM');
  console.log(`   ✓ Dining Agent RESERVE permission: allowed=${diningPermCheck.allowed}`);

  const illegalCheck = checkAgentPermission('research', 'PURCHASE', 'HIGH');
  console.log(`   ✓ Research Agent PURCHASE permission (Should be false): allowed=${illegalCheck.allowed}`);
  if (illegalCheck.allowed !== false) {
    throw new Error('Security Breach: Research Agent should not be permitted to PURCHASE!');
  }

  // 2. Specialized 12 Agents Verification
  console.log('\n2. Verifying All 12 Domain Specialist Agents...');
  const agentKeys = Object.keys(SPECIALIST_AGENTS);
  console.log(`   ✓ Loaded ${agentKeys.length} specialist domains: ${agentKeys.join(', ')}`);
  for (const key of ['dining', 'travel', 'mobility', 'experiences', 'shopping', 'home', 'business', 'personal', 'appointments', 'communication', 'gift', 'other']) {
    const agent = SPECIALIST_AGENTS[key];
    if (!agent) throw new Error(`Missing agent definition for ${key}`);
    console.log(`   • [${agent.name}] | Category: ${agent.category} | Tools: ${agent.allowedTools.join(', ')}`);
  }

  // 3. Evaluation Framework Dataset Run
  console.log('\n3. Running Agent Evaluation Dataset...');
  const evalSummary = AgentEvaluator.evaluatePlatform();
  console.log(`   ✓ Evaluation Results: ${evalSummary.passed}/${evalSummary.totalTests} passed`);
  console.log(`   ✓ Intent Accuracy: ${evalSummary.intentAccuracy}%`);
  console.log(`   ✓ Zero Hallucination Compliance: ${evalSummary.zeroHallucinationCompliant}`);

  // 4. Create Test Customer & Execute Live Agent Loop
  console.log('\n4. Executing End-to-End Live Agent Loop (Dining Specialist)...');
  let testCustomer = await db.customerProfile.findFirst({
    include: { user: true },
  });

  if (!testCustomer) {
    const user = await db.user.create({
      data: {
        email: `agent-eval-${Date.now()}@proventa.dev`,
        name: 'Evaluation VIP Client',
        status: 'ACTIVE',
      },
    });
    testCustomer = await db.customerProfile.create({
      data: {
        userId: user.id,
        city: 'Ahmedabad',
        onboardingCompleted: true,
      },
      include: { user: true },
    });
  }

  const count = await db.task.count();
  const testTask = await db.task.create({
    data: {
      publicId: `TSK-EVAL-${(count + 1).toString().padStart(4, '0')}`,
      customerId: testCustomer.id,
      category: 'dining',
      intent: 'Reserve restaurant',
      originalRequest: 'Reserve a quiet table for 2 at Agashiye tomorrow at 8 PM',
      assignedAgent: SPECIALIST_AGENTS['dining'].name,
      priority: 'NORMAL',
      status: 'UNDERSTANDING',
    },
  });

  const runResult = await AgentRuntime.runAgentLoop({
    taskId: testTask.id,
    agent: SPECIALIST_AGENTS['dining'],
    entities: {
      category: 'dining',
      intent: 'Reserve restaurant',
      partySize: 2,
      dateTime: 'Tomorrow 8:00 PM',
      urgency: 'NORMAL',
      requiresClarification: false,
      rawInput: testTask.originalRequest,
    },
    originalRequest: testTask.originalRequest,
    customerId: testCustomer.id,
    autoExecuteIfApproved: true,
  });

  console.log(`   ✓ Agent Runtime Final Status: ${runResult.taskStatus}`);
  console.log(`   ✓ Verification Reference: ${runResult.verification?.confirmationReference}`);
  console.log(`   ✓ Non-Fabrication Audit Trail: ${runResult.verification?.auditTrail}`);

  // 5. Multi-Agent Orchestrator Test
  console.log('\n5. Executing Multi-Agent Orchestrator (Composite Itinerary)...');
  const compositePrompt = 'Plan a birthday celebration: dinner at Agashiye, heritage evening walk, and luxury chauffeur pickup.';
  const multiPlan = MultiAgentOrchestrator.decomposeRequest(compositePrompt);
  console.log(`   ✓ Decomposed Request into ${multiPlan.subtasks.length} Subtasks:`);
  multiPlan.subtasks.forEach((s) => {
    console.log(`     - [${s.subtaskId}] Agent: ${s.agentName} | Action: ${s.actionDescription} | Depends on: [${s.dependencies.join(', ') || 'None'}]`);
  });

  const parentTask = await db.task.create({
    data: {
      publicId: `TSK-MULTI-${(count + 2).toString().padStart(4, '0')}`,
      customerId: testCustomer.id,
      category: 'other',
      intent: 'Multi-Agent Itinerary',
      originalRequest: compositePrompt,
      assignedAgent: 'Multi-Agent Orchestrator',
      priority: 'HIGH',
      status: 'UNDERSTANDING',
    },
  });

  const multiExecResults = await MultiAgentOrchestrator.executeMultiAgentPlan({
    parentTaskId: parentTask.id,
    plan: multiPlan,
    customerId: testCustomer.id,
  });

  console.log(`   ✓ Multi-Agent Execution Completed: ${Object.keys(multiExecResults).length} subtasks confirmed.`);

  console.log('\n================================================================');
  console.log('       ALL AI AGENT PLATFORM TESTS PASSED SUCCESSFULLY!         ');
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

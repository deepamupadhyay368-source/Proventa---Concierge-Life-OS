import { db } from '../src/lib/db';
import { RequestOrchestrator } from '../src/lib/orchestration/orchestrator';

async function testFullOrchestrator(prompt: string) {
  console.log('\n=============================================================');
  console.log('FULL ORCHESTRATOR TEST FOR:', prompt);
  console.log('=============================================================');

  // Find or create test customer
  let customer = await db.customerProfile.findFirst({ include: { user: true } });
  if (!customer) {
    const user = await db.user.create({
      data: {
        email: 'test-smoke-customer@proventa.in',
        name: 'Smoke Test Customer',
      },
    });
    customer = await db.customerProfile.create({
      data: {
        userId: user.id,
        city: 'Ahmedabad',
      },
      include: { user: true },
    });
  }

  const result = await RequestOrchestrator.processRequest({
    rawInput: prompt,
    customerId: customer.id,
  });

  console.log('RESULT:');
  console.log('  Task ID:', result.task.id);
  console.log('  Status:', result.task.status);
  console.log('  Category:', result.task.category);
  console.log('  Assigned Agent:', result.task.assignedAgent);
  console.log('  Decision Mode:', result.decision.executionMode);
  console.log('  Decision Category:', result.decision.category);
  console.log('  Proposals Returned Count:', result.proposals.length);
  console.log('  Task proposedOptions Count:', Array.isArray(result.task.proposedOptions) ? result.task.proposedOptions.length : 'NOT_ARRAY');

  const taskFromDb = await db.task.findUnique({ where: { id: result.task.id } });
  console.log('DB TASK STATUS:', taskFromDb?.status);
  console.log('DB TASK proposedOptions:', Array.isArray(taskFromDb?.proposedOptions) ? (taskFromDb?.proposedOptions as any[]).length : 'EMPTY');
  if (Array.isArray(taskFromDb?.proposedOptions)) {
    (taskFromDb?.proposedOptions as any[]).forEach((p, idx) => {
      console.log(`    [${idx + 1}] ${p.title} | ${p.providerName} | ${p.priceFormatted || p.priceAmount}`);
    });
  }
  console.log('DB TASK clientPreferences.batchHistory:', (taskFromDb?.clientPreferences as any)?.batchHistory?.length);
  console.log('DB TASK clientPreferences.executionTier:', (taskFromDb?.clientPreferences as any)?.executionTier);
  console.log('DB TASK failedReason:', taskFromDb?.failedReason);
}

async function main() {
  await testFullOrchestrator("Book a business class flight from Ahmedabad to Delhi tomorrow morning for 2 passengers.");
  await testFullOrchestrator("Find me a luxury 5-star hotel in Delhi for 3 nights.");
  await testFullOrchestrator("Find flights from Ahmedabad to Mumbai.");
  await testFullOrchestrator("Find a hotel in Mumbai for 2 nights.");
  process.exit(0);
}

main().catch(err => {
  console.error('CRASH:', err);
  process.exit(1);
});

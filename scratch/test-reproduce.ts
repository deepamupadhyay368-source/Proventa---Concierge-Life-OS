import { understandRequest } from '../src/lib/ai/agents/understanding';
import { TaskDecisionEngine } from '../src/lib/capabilities';
import { findAgentForTask } from '../src/lib/orchestration/agents';
import { AdapterRegistry } from '../src/lib/orchestration/adapters';
import { EntityIntegrityValidator } from '../src/lib/validation/entity-integrity';

async function diagnose(rawInput: string) {
  console.log('\n=============================================================');
  console.log('INPUT:', rawInput);
  console.log('=============================================================');

  // 1. Understanding
  const understanding = await understandRequest(rawInput);
  console.log('1. UNDERSTANDING:');
  console.log('   Category:', understanding.category);
  console.log('   Intent:', understanding.intent);
  console.log('   Destination:', understanding.destination);
  console.log('   Origin:', understanding.origin);
  console.log('   Location:', understanding.location);
  console.log('   Party Size:', understanding.partySize);
  console.log('   Budget:', understanding.budgetRange);
  console.log('   Execution Required:', understanding.executionRequired);

  // 2. Decision Engine
  const decision = TaskDecisionEngine.evaluate({
    rawInput,
    category: understanding.category,
    objective: understanding.objective,
    destination: understanding.destination,
    location: understanding.location,
    partySize: understanding.partySize,
    budgetRange: understanding.budgetRange,
    executionRequired: understanding.executionRequired,
  });
  console.log('2. DECISION:');
  console.log('   Category:', decision.category);
  console.log('   Objective:', decision.objective);
  console.log('   Execution Mode:', decision.executionMode);
  console.log('   Is Prohibited:', decision.isProhibited);

  // 3. Agent Routing
  const category = decision.category.toLowerCase();
  const agent = findAgentForTask(category, understanding.intent);
  console.log('3. AGENT ROUTING:');
  console.log('   Agent Name:', agent.name);
  console.log('   Agent Category:', agent.category);

  // 4. Adapters for Category
  const adapters = AdapterRegistry.getAdaptersForCategory(category);
  console.log('4. ADAPTERS FOR CATEGORY:', category);
  console.log('   Count:', adapters.length);
  adapters.forEach(a => console.log('   - Adapter:', a.name, '| ID:', a.providerId, '| Supported:', a.supportedCategories));

  // 5. Direct Adapter Search
  const entities = {
    ...understanding,
    category,
    urgency: 'NORMAL' as const,
    rawInput,
  };

  const rawProposals: any[] = [];
  for (const adapter of adapters) {
    try {
      const res = await adapter.search({
        category,
        intent: entities.intent,
        rawInput: entities.rawInput,
        constraints: {
          origin: entities.origin,
          originAirport: entities.originAirport,
          destination: entities.destination,
          destinationAirport: entities.destinationAirport,
          location: entities.location || entities.destination,
          dateTime: entities.dateTime,
          partySize: entities.partySize,
          budget: entities.budgetRange || entities.budgetAmount,
        },
      });
      console.log(`   Adapter [${adapter.name}] returned ${res.length} candidates.`);
      rawProposals.push(...res);
    } catch (err: any) {
      console.error(`   Adapter [${adapter.name}] ERROR:`, err.message);
    }
  }
  console.log('5. RAW PROPOSALS COUNT:', rawProposals.length);
  if (rawProposals.length > 0) {
    console.log('   Sample Raw Proposal:', rawProposals[0].title, '| Provider:', rawProposals[0].providerName);
  }

  // 6. Entity Integrity Filtering
  const constraints = {
    category,
    destination: entities.destination,
    destinationAirport: entities.destinationAirport,
    origin: entities.origin,
    originAirport: entities.originAirport,
    location: entities.location,
  };
  const validProposals = EntityIntegrityValidator.filterProposalsByConstraints(rawProposals, constraints);
  console.log('6. ENTITY INTEGRITY VALID PROPOSALS:', validProposals.length);

  // 7. Full Agent Search
  const agentResults = await agent.search(entities);
  console.log('7. FULL AGENT.SEARCH RESULTS COUNT:', agentResults.length);
  if (agentResults.length > 0) {
    agentResults.slice(0, 5).forEach((p, idx) => {
      console.log(`   [${idx + 1}] ${p.title} (${p.providerName}) - ${p.priceFormatted}`);
    });
  }
}

async function run() {
  await diagnose("Book a business class flight from Ahmedabad to Delhi tomorrow morning for 2 passengers.");
  await diagnose("Find me a luxury 5-star hotel in Delhi for 3 nights.");
  await diagnose("Find flights from Ahmedabad to Mumbai.");
  await diagnose("Find a hotel in Mumbai for 2 nights.");
}

run().catch(console.error);

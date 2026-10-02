import { describe, it, expect } from 'vitest';
import { TaskDecisionEngine } from '@/lib/capabilities/task-decision-engine';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { findAgentForTask } from '@/lib/orchestration/agents';
import { healthcareDiscoveryProvider } from '@/lib/healthcare/provider';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';

describe('PROVENTA — HEALTHCARE REPRODUCTION TRACE', () => {
  const queries = [
    'Find me a cardiologist in Ahmedabad',
    'I need a dermatologist in Ahmedabad',
    'Find a doctor in Ahmedabad',
    'Find a cardiologist near Navrangpura',
    'Find a cardiologist in Mumbai',
  ];

  it('traces healthcare request processing for all 5 queries', async () => {
    for (const q of queries) {
      console.log('----------------------------------------------------');
      console.log('QUERY:', q);

      // 1. Task Decision Engine
      const decision = TaskDecisionEngine.evaluate({ rawInput: q });
      console.log('1. Decision Category:', decision.category, 'SpecialistAgent:', decision.specialistAgent);

      // 2. Understanding
      const understood = await understandRequest(q);
      console.log('2. Understood Category:', understood.category, 'Location:', understood.location, 'Destination:', understood.destination);

      // 3. Agent Lookup
      const agent = findAgentForTask(decision.category.toLowerCase(), understood.intent);
      console.log('3. Found Agent:', agent.name, 'Category:', agent.category);

      // 4. Direct Provider Search
      const direct = await healthcareDiscoveryProvider.searchDoctors({ rawInput: q });
      console.log('4. Direct Provider Doctors Count:', direct.doctors.length, 'Resolved Specialty:', direct.diagnostics.resolvedSpecialty, 'Resolved City:', direct.diagnostics.resolvedCity);

      // 5. Agent Search
      const agentResults = await agent.search({
        ...understood,
        category: decision.category.toLowerCase(),
        rawInput: q,
      } as any);
      console.log('5. Agent Search Proposals Count:', agentResults.length);
      if (agentResults.length > 0) {
        console.log('   First proposal:', agentResults[0].title, 'Price:', agentResults[0].priceFormatted);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  REAL_WORLD_SHADOW_DATASET_100,
  runRealWorldShadowEvaluationSuite,
  evaluateShadowScenario,
} from '@/lib/orchestration/eval/real-world-shadow-eval';

describe('PROVENTA — REAL-WORLD SHADOW EVALUATION SUITE', () => {
  it('1. verifies shadow dataset contains exactly 100 realistic customer scenarios across 20 categories', () => {
    expect(REAL_WORLD_SHADOW_DATASET_100.length).toBe(100);

    const categories = new Set(REAL_WORLD_SHADOW_DATASET_100.map((s) => s.category));
    expect(categories.size).toBe(20);

    for (const s of REAL_WORLD_SHADOW_DATASET_100) {
      expect(s.id).toBeDefined();
      expect(s.rawInput.length).toBeGreaterThan(5);
      expect(s.expectedDomain).toBeDefined();
      expect(s.expectedAgent).toBeDefined();
      expect(s.expectedIntent).toBeDefined();
    }
  });

  it('2. executes full 100 scenario shadow evaluation without external side effects or mock leaks', async () => {
    const summary = await runRealWorldShadowEvaluationSuite(REAL_WORLD_SHADOW_DATASET_100);

    expect(summary.totalScenarios).toBe(100);
    expect(summary.passedCount).toBeGreaterThanOrEqual(90); // high real-world baseline
    expect(summary.overallScore).toBeGreaterThanOrEqual(90);

    // Safety and Anti-Fabrication invariant checks
    expect(summary.scoresByMetric.antiFabrication).toBe(100);
    expect(summary.scoresByMetric.executionSafety).toBe(100);
    expect(summary.scoresByMetric.approvalCompliance).toBeGreaterThanOrEqual(95);

    // Verify all 100 scenario results have full shadow fields captured
    for (const r of summary.results) {
      expect(r.customerRequest).toBeDefined();
      expect(r.detectedDomain).toBeDefined();
      expect(r.selectedAgent).toBeDefined();
      expect(r.intent).toBeDefined();
      expect(r.extractedConstraints).toBeDefined();
      expect(r.proposedExecutionMode).toBeDefined();
      expect(r.escalationDecision).toBeDefined();
      expect(r.antiFabricationResult).toBe('PASSED');
      expect(r.safetyResult).toBe('PASSED');
      expect(r.customerFacingResponse).toBeDefined();
      expect(r.failureCategory).toBeDefined();
    }
  });

  it('3. validates agent and domain score breakdowns are comprehensively calculated', async () => {
    const summary = await runRealWorldShadowEvaluationSuite(REAL_WORLD_SHADOW_DATASET_100);

    expect(Object.keys(summary.scoresByAgent).length).toBeGreaterThanOrEqual(5);
    expect(Object.keys(summary.scoresByDomain).length).toBeGreaterThanOrEqual(5);

    for (const [agent, data] of Object.entries(summary.scoresByAgent)) {
      expect(data.total).toBeGreaterThan(0);
      expect(data.averageScore).toBeGreaterThan(0);
    }
  });
});

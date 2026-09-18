import { describe, it, expect } from 'vitest';
import { CapabilityRegistry } from '@/lib/capabilities/capability-registry';
import type { ServiceCategory } from '@/lib/capabilities/types';

describe('CapabilityRegistry — Phase 5 Centralized Capability Engine', () => {
  const all14Categories: ServiceCategory[] = [
    'DINING',
    'TRAVEL',
    'HOTELS',
    'TRANSPORT',
    'FOOD_DELIVERY',
    'MOVIES_ENTERTAINMENT',
    'GIFTS',
    'SHOPPING',
    'SALON_WELLNESS',
    'APPOINTMENTS',
    'EVENTS',
    'WEEKEND_ESCAPES',
    'RESEARCH_PLANNING',
    'OTHER_CONCIERGE',
  ];

  it('declares and registers all 14 mandatory service categories', () => {
    const all = CapabilityRegistry.getAllCapabilities();
    expect(all.length).toBe(14);

    const categoriesInRegistry = all.map((c) => c.category);
    all14Categories.forEach((cat) => {
      expect(categoriesInRegistry).toContain(cat);
    });
  });

  it('strictly separates agent capability from execution capability', () => {
    // Travel agent exists, but automated booking execution is not enabled in Wave 1
    const travelCap = CapabilityRegistry.getCapability('TRAVEL');
    expect(travelCap.researchSupported).toBe(true);
    expect(travelCap.liveProviderAvailable).toBe(false); // No certified live GDS credentials configured in Wave 1
    expect(travelCap.executionMode).toBe('HUMAN_CONCIERGE');
    expect(travelCap.productionStatus).toBe('HUMAN_CONCIERGE');

    // Hotels agent exists, but automated booking execution is not enabled in Wave 1
    const hotelCap = CapabilityRegistry.getCapability('HOTELS');
    expect(hotelCap.researchSupported).toBe(true);
    expect(hotelCap.liveProviderAvailable).toBe(false);
    expect(hotelCap.executionMode).toBe('HUMAN_CONCIERGE');
    expect(hotelCap.productionStatus).toBe('HUMAN_CONCIERGE');
  });

  it('properly configures verified production live capabilities', () => {
    const diningCap = CapabilityRegistry.getCapability('DINING');
    expect(diningCap.researchSupported).toBe(true);
    expect(diningCap.liveProviderAvailable).toBe(true);
    expect(diningCap.customerApprovalRequired).toBe(true);
    expect(diningCap.verificationMethod).toBe('genuine provider confirmation');
    expect(diningCap.productionStatus).toBe('PRODUCTION_LIVE');

    const foodCap = CapabilityRegistry.getCapability('FOOD_DELIVERY');
    expect(foodCap.researchSupported).toBe(true);
    expect(foodCap.liveProviderAvailable).toBe(true);
    expect(foodCap.executionMode).toBe('PROVIDER_API');
    expect(foodCap.productionStatus).toBe('PRODUCTION_LIVE');

    const researchCap = CapabilityRegistry.getCapability('RESEARCH_PLANNING');
    expect(researchCap.researchSupported).toBe(true);
    expect(researchCap.executionMode).toBe('AI_RESEARCH');
    expect(researchCap.customerApprovalRequired).toBe(false);
    expect(researchCap.verificationMethod).toBe('source-backed result');
    expect(researchCap.productionStatus).toBe('PRODUCTION_LIVE');
  });

  it('generates a transparent capability matrix for founder oversight', () => {
    const matrix = CapabilityRegistry.getProductionMatrix();
    expect(matrix.length).toBe(14);

    matrix.forEach((row) => {
      expect(row.category).toBeTruthy();
      expect(row.name).toBeTruthy();
      expect(row.specialistAgent).toBeTruthy();
      expect(typeof row.researchSupported).toBe('boolean');
      expect(typeof row.automaticExecution).toBe('boolean');
      expect(typeof row.humanConcierge).toBe('boolean');
      expect(typeof row.approvalRequired).toBe('boolean');
      expect(row.verificationMethod).toBeTruthy();
      expect(row.productionStatus).toBeTruthy();
    });
  });

  it('confirms execution support via either live provider or human concierge', () => {
    all14Categories.forEach((cat) => {
      expect(CapabilityRegistry.isExecutionSupported(cat)).toBe(true);
    });
  });
});

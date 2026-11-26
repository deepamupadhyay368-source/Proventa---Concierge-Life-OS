import { describe, it, expect } from 'vitest';
import {
  evaluateAll12Factors,
  evaluatePropertyCharacteristics,
  evaluateProjectDeveloperQuality,
  evaluateLocationMicroMarket,
  evaluateExistingInfrastructure,
  evaluateUpcomingInfrastructure,
  evaluateRegisteredTransactions,
  evaluateMarketSupplyDemand,
  evaluateLegalStatutory,
  evaluateBuildingCondition,
  evaluateEnvironmentalRisks,
  evaluateFinancialOwnershipCosts,
  evaluateEconomicMarketTrends,
  ValuationPropertyInput,
  ValuationContextInput,
  ProjectIntelligenceData,
} from '../../src/lib/valuation/factors';
import { calculatePropertyValuation, UnsupportedAssetClassError } from '../../src/lib/real-estate/valuation';

describe('PROVENTA Phase 6: 12-Factor Residential Valuation Intelligence Framework', () => {
  const sampleProperty: ValuationPropertyInput = {
    carpetAreaSqFt: 1250,
    builtUpAreaSqFt: 1550,
    superBuiltUpAreaSqFt: 1950,
    bhk: 3,
    floor: 7,
    totalFloors: 14,
    propertyAgeYears: 2,
    condition: 'EXCELLENT',
    furnishingStatus: 'SEMI_FURNISHED',
    parkingSpaces: 1,
    facing: 'EAST',
    layoutEfficiency: 'EFFICIENT',
  };

  const sampleContext: ValuationContextInput = {
    propertyType: 'APARTMENT',
    localityId: 'loc-south-bopal',
    localitySlug: 'south-bopal',
    localityName: 'South Bopal',
    district: 'Ahmedabad',
    address: 'B-702, Shilp Revanta, South Bopal, Ahmedabad',
    pincode: '380058',
    projectId: 'proj-shilp-revanta',
    projectName: 'Shilp Revanta',
    askingPriceLakhs: 95.0,
    targetOfferLakhs: 88.0,
    titleClearanceSelfReported: true,
    occupancyCertificateStatus: 'AVAILABLE',
    buildingUsePermissionStatus: 'VERIFIED_GRANTED',
    verifiedTransactions: [
      {
        id: 'tx-01',
        deedId: 'SAN2/2025/004312',
        date: new Date('2025-05-14'),
        carpetAreaSqFt: 1220,
        transactedPriceLakhs: 87.5,
        pricePerSqFtCarpet: 7172,
        projectName: 'Shilp Revanta',
      },
      {
        id: 'tx-02',
        deedId: 'SAN2/2025/011402',
        date: new Date('2025-08-22'),
        carpetAreaSqFt: 1260,
        transactedPriceLakhs: 90.0,
        pricePerSqFtCarpet: 7143,
        projectName: 'Shilp Revanta',
      },
    ],
  };

  const sampleProject: ProjectIntelligenceData = {
    id: 'proj-shilp-revanta',
    name: 'Shilp Revanta',
    reraNumber: 'PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121',
    developer: 'AYB Buildcon LLP / Shilp Group',
    publicationStatus: 'PUBLISHED',
    possessionStatus: 'READY_TO_MOVE',
    totalTowers: 6,
    totalUnits: 802,
    openSpaceRatioPercent: 70,
  };

  describe('1. Individual Factor Analytical Modules', () => {
    it('Factor 01: evaluates property characteristics with usable carpet area primacy', () => {
      const res = evaluatePropertyCharacteristics(sampleProperty, sampleContext);
      expect(res.factorId).toBe('FACTOR_01_PROPERTY_CHARACTERISTICS');
      expect(res.assessmentStatus).toBe('VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
      expect(res.valuationImpact.adjustmentPercent).toBeDefined();
      expect(res.findings.some((f) => f.includes('Legal RERA Usable Carpet Area'))).toBe(true);
      expect(res.findings.some((f) => f.includes('Mid-to-high floor'))).toBe(true);
    });

    it('Factor 02: evaluates project and developer track record and GujRERA compliance', () => {
      const res = evaluateProjectDeveloperQuality(sampleContext, sampleProject);
      expect(res.factorId).toBe('FACTOR_02_PROJECT_DEVELOPER_QUALITY');
      expect(res.assessmentStatus).toBe('VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
      expect(res.findings.some((f) => f.includes('PR/GJ/AHMEDABAD/SANAND/AUDA/MAA07874/050121'))).toBe(true);
      expect(res.riskFlags.length).toBe(0);
    });

    it('Factor 02 (Risk Gate): triggers quarantine gate if project is quarantined', () => {
      const quarantinedProject: ProjectIntelligenceData = {
        ...sampleProject,
        publicationStatus: 'QUARANTINED',
      };
      const res = evaluateProjectDeveloperQuality(sampleContext, quarantinedProject);
      expect(res.assessmentStatus).toBe('INSUFFICIENT_DATA');
      expect(res.valuationImpactType).toBe('RISK_GATE');
      expect(res.valuationImpact.gateAction).toBe('BLOCK');
      expect(res.riskFlags.some((rf) => rf.includes('quarantined'))).toBe(true);
    });

    it('Factor 03: evaluates micro-market location hierarchy and arterial road connectivity', () => {
      const res = evaluateLocationMicroMarket(sampleContext);
      expect(res.factorId).toBe('FACTOR_03_LOCATION_MICRO_MARKET');
      expect(res.assessmentStatus).toBe('VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
      expect(res.findings.some((f) => f.includes('South Bopal'))).toBe(true);
    });

    it('Factor 04: evaluates operational civic and transit infrastructure', () => {
      const res = evaluateExistingInfrastructure(sampleContext);
      expect(res.factorId).toBe('FACTOR_04_EXISTING_INFRASTRUCTURE');
      expect(res.assessmentStatus).toBe('VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
      expect(res.findings.some((f) => f.includes('SP Ring Road'))).toBe(true);
    });

    it('Factor 05: evaluates upcoming infrastructure context with ZERO speculative markup', () => {
      const res = evaluateUpcomingInfrastructure(sampleContext);
      expect(res.factorId).toBe('FACTOR_05_UPCOMING_INFRASTRUCTURE');
      expect(res.valuationImpactType).toBe('CONTEXTUAL_ONLY');
      expect(res.valuationImpact.adjustmentPercent).toBe(0.0);
      expect(res.limitations.some((l) => l.includes('0.0%'))).toBe(true);
    });

    it('Factor 06: analyzes registered sale deed instruments and arm-length transactions', () => {
      const res = evaluateRegisteredTransactions(sampleProperty, sampleContext);
      expect(res.factorId).toBe('FACTOR_06_REGISTERED_TRANSACTIONS');
      expect(res.assessmentStatus).toBe('PARTIALLY_VERIFIED');
      expect(res.verifiedEvidenceCount).toBe(2);
      expect(res.comparables.some((c) => c.deedId === 'SAN2/2025/004312')).toBe(true);
    });

    it('Factor 07: benchmarks market supply and active resale asking quotes with negotiation haircut', () => {
      const res = evaluateMarketSupplyDemand(sampleContext);
      expect(res.factorId).toBe('FACTOR_07_MARKET_SUPPLY_DEMAND');
      expect(res.valuationImpactType).toBe('CONTEXTUAL_ONLY');
      expect(res.findings.some((f) => f.includes('negotiation discount'))).toBe(true);
    });

    it('Factor 08: verifies statutory approvals and legal encumbrance risk gates', () => {
      const res = evaluateLegalStatutory(sampleContext, sampleProject.reraNumber);
      expect(res.factorId).toBe('FACTOR_08_LEGAL_STATUTORY');
      expect(res.valuationImpactType).toBe('RISK_GATE');
      expect(res.valuationImpact.gateAction).toBe('ALLOW');
      expect(res.findings.some((f) => f.includes('Building Use (BU) Permission'))).toBe(true);
    });

    it('Factor 08 (Risk Gate): restricts valuation if statutory BU permission is revoked', () => {
      const restrictedContext: ValuationContextInput = {
        ...sampleContext,
        buildingUsePermissionStatus: 'REVOKED',
      };
      const res = evaluateLegalStatutory(restrictedContext, sampleProject.reraNumber);
      expect(res.valuationImpact.gateAction).toBe('RESTRICT');
      expect(res.riskFlags.some((rf) => rf.includes('Building Use (BU) permission'))).toBe(true);
    });

    it('Factor 09: evaluates superstructure condition and maintenance standards', () => {
      const res = evaluateBuildingCondition(sampleProperty, sampleContext);
      expect(res.factorId).toBe('FACTOR_09_BUILDING_CONDITION');
      expect(res.assessmentStatus).toBe('PARTIALLY_VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
    });

    it('Factor 10: evaluates monsoon waterlogging, drainage, and industrial buffer risks', () => {
      const res = evaluateEnvironmentalRisks(sampleContext);
      expect(res.factorId).toBe('FACTOR_10_ENVIRONMENTAL_RISKS');
      expect(res.assessmentStatus).toBe('VERIFIED');
      expect(res.valuationImpactType).toBe('DIRECT_ADJUSTMENT');
      expect(res.findings.some((f) => f.includes('Stormwater Drainage'))).toBe(true);
    });

    it('Factor 11: computes Gujarat stamp duty, registration, and recurring ownership costs strictly segregated from asset valuation', () => {
      const evaluatedMidpointLakhs = 90.0;
      const res = evaluateFinancialOwnershipCosts(sampleProperty, sampleContext, evaluatedMidpointLakhs);
      expect(res.factorId).toBe('FACTOR_11_FINANCIAL_OWNERSHIP_COSTS');
      expect(res.valuationImpactType).toBe('OWNERSHIP_COST');
      expect(res.valuationImpact.adjustmentPercent).toBe(0.0); // Never inflates property value

      const { costSummary } = res;
      // Gujarat Stamp Duty: 4.90% on 90 Lakhs = 4,41,000
      expect(costSummary.statutoryCosts.stampDutyRupees).toBe(441000);
      // Registration Fee: 1.00% on 90 Lakhs = 90,000
      expect(costSummary.statutoryCosts.registrationFeeRupees).toBe(90000);
      // Total Acquisition Taxes = 5,31,000
      expect(costSummary.statutoryCosts.totalAcquisitionTaxesRupees).toBe(531000);
      // Annual Recurring Costs
      expect(costSummary.annualRecurringCosts.propertyTaxAnnualRupees).toBeGreaterThan(0);
      expect(costSummary.annualRecurringCosts.societyMaintenanceAnnualRupees).toBeGreaterThan(0);
    });

    it('Factor 12: analyzes macroeconomic repo rate, mortgage liquidity, and gross rental yields', () => {
      const res = evaluateEconomicMarketTrends(sampleContext);
      expect(res.factorId).toBe('FACTOR_12_ECONOMIC_MARKET_TRENDS');
      expect(res.valuationImpactType).toBe('CONTEXTUAL_ONLY');
      expect(res.findings.some((f) => f.includes('Repo Rate'))).toBe(true);
    });
  });

  describe('2. Master 12-Factor Orchestrator (`evaluateAll12Factors`)', () => {
    it('evaluates all 12 factors simultaneously and compiles layered output', () => {
      const result = evaluateAll12Factors(sampleProperty, sampleContext, sampleProject, 90.0);

      expect(result.factors.length).toBe(12);
      expect(result.riskGateTriggered).toBe(false);
      expect(result.blockingReasons.length).toBe(0);
      expect(result.costSummary).toBeDefined();
      expect(result.costSummary.statutoryCosts.stampDutyRupees).toBe(441000);

      // Verify all factor IDs are present in sequence
      const factorIds = result.factors.map((f) => f.factorId);
      expect(factorIds).toContain('FACTOR_01_PROPERTY_CHARACTERISTICS');
      expect(factorIds).toContain('FACTOR_02_PROJECT_DEVELOPER_QUALITY');
      expect(factorIds).toContain('FACTOR_03_LOCATION_MICRO_MARKET');
      expect(factorIds).toContain('FACTOR_04_EXISTING_INFRASTRUCTURE');
      expect(factorIds).toContain('FACTOR_05_UPCOMING_INFRASTRUCTURE');
      expect(factorIds).toContain('FACTOR_06_REGISTERED_TRANSACTIONS');
      expect(factorIds).toContain('FACTOR_07_MARKET_SUPPLY_DEMAND');
      expect(factorIds).toContain('FACTOR_08_LEGAL_STATUTORY');
      expect(factorIds).toContain('FACTOR_09_BUILDING_CONDITION');
      expect(factorIds).toContain('FACTOR_10_ENVIRONMENTAL_RISKS');
      expect(factorIds).toContain('FACTOR_11_FINANCIAL_OWNERSHIP_COSTS');
      expect(factorIds).toContain('FACTOR_12_ECONOMIC_MARKET_TRENDS');
    });

    it('triggers master risk gate when quarantined project is evaluated', () => {
      const quarantinedProject: ProjectIntelligenceData = {
        ...sampleProject,
        publicationStatus: 'QUARANTINED',
      };
      const result = evaluateAll12Factors(sampleProperty, sampleContext, quarantinedProject, 90.0);

      expect(result.riskGateTriggered).toBe(true);
      expect(result.blockingReasons.some((r) => r.includes('quarantined'))).toBe(true);
    });
  });

  describe('3. Public Valuation Service Integration (`calculatePropertyValuation`)', () => {
    it('returns full 12-factor results and ownership cost summary on preview calculations', () => {
      const val = calculatePropertyValuation({
        state: 'Gujarat',
        city: 'Ahmedabad',
        localitySlug: 'south-bopal',
        propertyType: 'APARTMENT',
        carpetAreaSqFt: 1200,
        bedrooms: 3,
        floor: 5,
        totalFloors: 14,
        propertyAgeYears: 2,
        propertyCondition: 'EXCELLENT',
        furnishingStatus: 'SEMI_FURNISHED',
        sellerAskingPriceLakhs: 88.0,
      });

      expect(val.twelveFactorResults).toBeDefined();
      expect(val.twelveFactorResults?.length).toBe(12);
      expect(val.ownershipCostSummary).toBeDefined();
      expect(val.ownershipCostSummary?.statutoryCosts.stampDutyRupees).toBeGreaterThan(0);
      expect(val.ownershipCostSummary?.statutoryCosts.registrationFeeRupees).toBeGreaterThan(0);
    });

    it('strictly rejects commercial asset class requests with UnsupportedAssetClassError', () => {
      expect(() => {
        calculatePropertyValuation({
          state: 'Gujarat',
          city: 'Ahmedabad',
          localitySlug: 'south-bopal',
          propertyType: 'COMMERCIAL',
          carpetAreaSqFt: 1500,
        });
      }).toThrow(UnsupportedAssetClassError);
    });
  });
});

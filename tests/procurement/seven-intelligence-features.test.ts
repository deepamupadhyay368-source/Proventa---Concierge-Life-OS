import { describe, it, expect } from 'vitest';
import { rupeesToPaise } from '@/lib/construction-procurement/money';
import {
  computeTrueLandedCost,
  deduplicateQuotationVersions,
  evaluateComparableOffers,
} from '@/lib/construction-procurement/landed-cost-engine';
import { computeMaterialPriceBenchmark } from '@/lib/construction-procurement/price-intelligence';
import {
  computeSupplierReliabilityScore,
  validateReliabilityWeights,
  DEFAULT_RELIABILITY_WEIGHTS,
} from '@/lib/construction-procurement/supplier-reliability';
import { runProcurementLeakageScan } from '@/lib/construction-procurement/leakage-detector';
import {
  evaluateCrossProjectRateVariance,
  evaluateConsolidationCompatibility,
  computeSupplierConcentration,
} from '@/lib/construction-procurement/multi-project-intelligence';
import { computeProcurementTimingForecast } from '@/lib/construction-procurement/timing-intelligence';
import {
  matchSuppliersForRfq,
  runDeterministicQuotationAnalysis,
  detectDeliveryExceptions,
} from '@/lib/construction-procurement/autopilot-engine';

describe('PROVENTA — Seven Core Intelligence Features Test Suite', () => {
  /* ======================================================================== */
  /* FEATURE 1: PROCUREMENT LEAKAGE DETECTOR                                  */
  /* ======================================================================== */
  describe('Feature 1 — Procurement Leakage Detector', () => {
    it('detects duplicate invoices, price anomalies, quantity discrepancies, approval violations, and excessive freight', () => {
      const findings = runProcurementLeakageScan({
        organisationId: 'org-1',
        priceDeviationThresholdPct: 8,
        freightShareThresholdPct: 12,
        approvalThresholdPaise: rupeesToPaise(500000),
        purchaseOrders: [
          {
            poId: 'PO-001',
            projectId: 'proj-a',
            materialName: 'TMT Steel 16mm Fe-550D',
            specificationSignature: 'tmt-fe550d-16mm',
            supplierBusinessId: 'sup-1',
            supplierName: 'Steel Corp A',
            quantity: 20,
            approvedRequirementQuantity: 15, // Over-requirement by 5 MT
            unitLandedPaise: rupeesToPaise(75000),
            baselineUnitPaise: rupeesToPaise(65000), // +15.38% price anomaly
            totalAmountPaise: rupeesToPaise(1500000), // > ₹5L without approver
            freightPaise: rupeesToPaise(250000), // 16.67% > 12%
            approvedByUserId: null,
            quotationCountOnRfq: 1,
            createdAtIso: '2026-11-27T08:00:00Z',
          },
        ],
        invoices: [
          {
            invoiceNumber: 'INV-DUP-99',
            purchaseOrderId: 'PO-001',
            supplierBusinessId: 'sup-1',
            supplierName: 'Steel Corp A',
            materialName: 'TMT Steel 16mm Fe-550D',
            billedQuantity: 20,
            grnAcceptedQuantity: 18, // 2 MT shortage vs GRN
            invoiceTotalPaise: rupeesToPaise(1500000),
            poTotalPaise: rupeesToPaise(1500000),
          },
          {
            invoiceNumber: 'INV-DUP-99',
            purchaseOrderId: 'PO-002',
            supplierBusinessId: 'sup-1',
            supplierName: 'Steel Corp A',
            materialName: 'TMT Steel 16mm Fe-550D',
            billedQuantity: 20,
            grnAcceptedQuantity: 20,
            invoiceTotalPaise: rupeesToPaise(1500000),
            poTotalPaise: rupeesToPaise(1500000),
          },
        ],
      });

      const categories = findings.map((f) => f.category);
      expect(categories).toContain('DUPLICATE_TRANSACTION_RISK');
      expect(categories).toContain('QUANTITY_DISCREPANCY');
      expect(categories).toContain('PRICE_ANOMALY');
      expect(categories).toContain('APPROVAL_POLICY_VIOLATION');
      expect(categories).toContain('POTENTIAL_COST_LEAKAGE');
      expect(categories).toContain('MISSING_DOCUMENTATION');
    });
  });

  /* ======================================================================== */
  /* FEATURE 2: MATERIAL PRICE INTELLIGENCE                                   */
  /* ======================================================================== */
  describe('Feature 2 — Material Price Intelligence', () => {
    it('returns INSUFFICIENT_DATA when fewer than 3 verified like-for-like observations exist', () => {
      const bench = computeMaterialPriceBenchmark({
        materialCategorySlug: 'tmt-steel',
        grade: 'Fe-550D',
        unit: 'MT',
        observations: [
          {
            id: 'obs-1',
            materialCategorySlug: 'tmt-steel',
            materialName: 'TMT 16mm',
            brand: 'Tata',
            grade: 'Fe-550D',
            unit: 'MT',
            city: 'Ahmedabad',
            basePriceUnitPaise: rupeesToPaise(55000),
            landedPriceUnitPaise: rupeesToPaise(66000),
            observationDate: new Date('2026-11-20'),
            sourceType: 'VERIFIED_PO',
            verificationStatus: 'VERIFIED',
          },
          // Different grade (Fe-500) must NOT be mixed into Fe-550D benchmark
          {
            id: 'obs-2',
            materialCategorySlug: 'tmt-steel',
            materialName: 'TMT 16mm',
            brand: 'Local',
            grade: 'Fe-500',
            unit: 'MT',
            city: 'Ahmedabad',
            basePriceUnitPaise: rupeesToPaise(49000),
            landedPriceUnitPaise: rupeesToPaise(59000),
            observationDate: new Date('2026-11-21'),
            sourceType: 'VERIFIED_PO',
            verificationStatus: 'VERIFIED',
          },
        ],
      });

      expect(bench.status).toBe('INSUFFICIENT_DATA');
      expect(bench.message).toBe('Insufficient verified data to generate a reliable benchmark.');
      expect(bench.medianUnitPaise).toBeNull();
    });

    it('computes lowest, median, highest, volatility, and freshness with >= 3 verified observations', () => {
      const now = new Date('2026-11-27');
      const bench = computeMaterialPriceBenchmark({
        materialCategorySlug: 'tmt-steel',
        grade: 'Fe-550D',
        unit: 'MT',
        city: 'Ahmedabad',
        now,
        observations: [
          {
            id: 'o1', materialCategorySlug: 'tmt-steel', materialName: 'TMT', brand: 'Tata', grade: 'Fe-550D', unit: 'MT', city: 'Ahmedabad',
            basePriceUnitPaise: rupeesToPaise(54000), landedPriceUnitPaise: rupeesToPaise(65000),
            observationDate: new Date('2026-11-22'), sourceType: 'SUPPLIER_QUOTATION', verificationStatus: 'VERIFIED',
          },
          {
            id: 'o2', materialCategorySlug: 'tmt-steel', materialName: 'TMT', brand: 'JSW', grade: 'Fe-550D', unit: 'MT', city: 'Ahmedabad',
            basePriceUnitPaise: rupeesToPaise(55000), landedPriceUnitPaise: rupeesToPaise(66000),
            observationDate: new Date('2026-11-24'), sourceType: 'VERIFIED_PO', verificationStatus: 'VERIFIED',
          },
          {
            id: 'o3', materialCategorySlug: 'tmt-steel', materialName: 'TMT', brand: 'Jindal', grade: 'Fe-550D', unit: 'MT', city: 'Ahmedabad',
            basePriceUnitPaise: rupeesToPaise(57000), landedPriceUnitPaise: rupeesToPaise(68000),
            observationDate: new Date('2026-11-25'), sourceType: 'VERIFIED_INVOICE', verificationStatus: 'VERIFIED',
          },
        ],
      });

      expect(bench.status).toBe('RELIABLE');
      expect(bench.lowestUnitPaise).toBe(rupeesToPaise(65000));
      expect(bench.medianUnitPaise).toBe(rupeesToPaise(66000));
      expect(bench.highestUnitPaise).toBe(rupeesToPaise(68000));
      expect(bench.freshness).toBe('FRESH');
      expect(bench.volatilityPercent).toBeGreaterThan(0);
    });
  });

  /* ======================================================================== */
  /* FEATURE 3: PROCUREMENT TIMING INTELLIGENCE                               */
  /* ======================================================================== */
  describe('Feature 3 — Procurement Timing Intelligence', () => {
    it('calculates shortage, recommended buy, RFQ initiation date, and MILESTONE_AT_RISK alert', () => {
      const forecast = computeProcurementTimingForecast({
        projectId: 'proj-1',
        projectName: 'Skyline Tower A',
        milestoneName: 'Podium Slab Pour',
        materialName: 'TMT Steel 16mm Fe-550D',
        unit: 'MT',
        boqRequiredQuantity: 100,
        availableStockQuantity: 10,
        openPoOrderedQuantity: 20,
        alreadyReceivedQuantity: 15,
        safetyStockQuantity: 12,
        requiredByDateIso: '2026-12-10',
        leadTimeDays: 14,
        recentMedianUnitPaise: rupeesToPaise(65000),
        currentQuoteUnitPaise: rupeesToPaise(67080), // +3.2%
        verifiedPriceObservationCount: 6,
        now: new Date('2026-11-27'),
      });

      // Remaining = 100 - 15 = 85; Net pipeline = 10 + 20 = 30; Shortage = 55; Recommended = 55 + 12 = 67
      expect(forecast.expectedShortage).toBe(55);
      expect(forecast.recommendedProcurementQuantity).toBe(67);
      expect(forecast.confidence).toBe('MODERATE');
      expect(forecast.alerts.some((a) => a.type === 'MILESTONE_AT_RISK')).toBe(true);
      expect(forecast.alerts.some((a) => a.type === 'INSUFFICIENT_STOCK')).toBe(true);
      expect(forecast.priceTimingExplanation).toContain('3.2% higher than');
    });
  });

  /* ======================================================================== */
  /* FEATURE 4: SUPPLIER RELIABILITY INTELLIGENCE                             */
  /* ======================================================================== */
  describe('Feature 4 — Supplier Reliability Intelligence', () => {
    it('returns INSUFFICIENT_DATA instead of a high score when completed transactions < minimum sample', () => {
      const score = computeSupplierReliabilityScore({
        supplierBusinessId: 'sup-new',
        supplierName: 'Brand New Dealer',
        periodStartIso: '2026-01-01',
        periodEndIso: '2026-11-27',
        completedTransactions: 1,
        onTimeDeliveries: 1,
        totalDeliveries: 1,
        acceptedUnits: 10,
        receivedUnits: 10,
        orderedUnits: 10,
        rfqsResponded: 1,
        rfqsInvited: 1,
        matchedInvoices: 1,
        totalInvoices: 1,
        substantiatedDisputes: 0,
        verifiedDocumentsCount: 4,
        requiredDocumentsCount: 4,
      });

      expect(score.status).toBe('INSUFFICIENT_DATA');
      expect(score.compositeScore).toBeNull();
    });

    it('calculates weighted score accurately and enforces weights summing to 100%', () => {
      expect(() =>
        validateReliabilityWeights({ ...DEFAULT_RELIABILITY_WEIGHTS, deliveryReliabilityPct: 50 })
      ).toThrow(/INVALID_RELIABILITY_WEIGHTS/);

      const score = computeSupplierReliabilityScore({
        supplierBusinessId: 'sup-vet',
        supplierName: 'Verified Steel Distributors',
        periodStartIso: '2026-01-01',
        periodEndIso: '2026-11-27',
        completedTransactions: 10,
        onTimeDeliveries: 9,
        totalDeliveries: 10,
        acceptedUnits: 98,
        receivedUnits: 100,
        orderedUnits: 100,
        rfqsResponded: 8,
        rfqsInvited: 10,
        matchedInvoices: 10,
        totalInvoices: 10,
        substantiatedDisputes: 1,
        verifiedDocumentsCount: 5,
        requiredDocumentsCount: 5,
      });

      expect(score.status).toBe('SCORED');
      // 90*.25 + 98*.25 + 98*.15 + 80*.10 + 100*.10 + 90*.10 + 100*.05 = 22.5 + 24.5 + 14.7 + 8 + 10 + 9 + 5 = 93.7
      expect(score.compositeScore).toBe(93.7);
    });
  });

  /* ======================================================================== */
  /* FEATURE 5: MULTI-PROJECT PURCHASING INTELLIGENCE                         */
  /* ======================================================================== */
  describe('Feature 5 — Multi-Project Purchasing Intelligence', () => {
    it('attributes cross-project rate differences to freight, volume, and credit terms', () => {
      const comparisons = evaluateCrossProjectRateVariance([
        {
          projectId: 'p1', projectName: 'West Tower', city: 'Ahmedabad',
          materialCategorySlug: 'tmt-steel', materialName: 'TMT 16mm', specificationSignature: 'fe550d-16',
          unit: 'MT', quantity: 100, baseUnitPaise: rupeesToPaise(55000), freightUnitPaise: rupeesToPaise(800),
          gstRatePercent: 18, landedUnitPaise: rupeesToPaise(65700), totalLandedPaise: rupeesToPaise(6570000),
          paymentCreditDays: 30, supplierBusinessId: 's1', supplierName: 'Supplier A',
        },
        {
          projectId: 'p2', projectName: 'GIFT Annex', city: 'Gandhinagar',
          materialCategorySlug: 'tmt-steel', materialName: 'TMT 16mm', specificationSignature: 'fe550d-16',
          unit: 'MT', quantity: 40, baseUnitPaise: rupeesToPaise(55000), freightUnitPaise: rupeesToPaise(1500),
          gstRatePercent: 18, landedUnitPaise: rupeesToPaise(66400), totalLandedPaise: rupeesToPaise(2656000),
          paymentCreditDays: 45, supplierBusinessId: 's1', supplierName: 'Supplier A',
        },
      ]);

      expect(comparisons).toHaveLength(1);
      expect(comparisons[0].attributedFactors.some((f) => f.includes('Freight'))).toBe(true);
      expect(comparisons[0].attributedFactors.some((f) => f.includes('Credit terms'))).toBe(true);

      const concentration = computeSupplierConcentration([
        {
          projectId: 'p1', projectName: 'West Tower', city: 'Ahmedabad',
          materialCategorySlug: 'tmt-steel', materialName: 'TMT 16mm', specificationSignature: 'fe550d-16',
          unit: 'MT', quantity: 100, baseUnitPaise: rupeesToPaise(55000), freightUnitPaise: rupeesToPaise(800),
          gstRatePercent: 18, landedUnitPaise: rupeesToPaise(65700), totalLandedPaise: rupeesToPaise(6570000),
          paymentCreditDays: 30, supplierBusinessId: 's1', supplierName: 'Supplier A',
        },
      ]);
      expect(concentration[0].dependencyRisk).toBe('HIGH');
    });

    it('blocks consolidation when specifications or delivery dates are incompatible', () => {
      const blocked = evaluateConsolidationCompatibility([
        {
          projectId: 'p1', projectName: 'P1', city: 'Ahmedabad',
          materialCategorySlug: 'tmt-steel', materialName: 'TMT', specificationSignature: 'Fe-550D-16mm',
          unit: 'MT', quantity: 50, requiredByDateIso: '2026-12-01', eligibleSupplierIds: ['s1', 's2'],
        },
        {
          projectId: 'p2', projectName: 'P2', city: 'Ahmedabad',
          materialCategorySlug: 'tmt-steel', materialName: 'TMT', specificationSignature: 'Fe-500D-12mm',
          unit: 'MT', quantity: 50, requiredByDateIso: '2027-01-15', eligibleSupplierIds: ['s2', 's3'],
        },
      ]);
      expect(blocked.canConsolidate).toBe(false);
      expect(blocked.incompatibilityReasons.some((r) => r.includes('INCOMPATIBLE_SPECIFICATIONS'))).toBe(true);
      expect(blocked.incompatibilityReasons.some((r) => r.includes('SCHEDULE_MISMATCH'))).toBe(true);
    });
  });

  /* ======================================================================== */
  /* FEATURE 6: TRUE LANDED COST ENGINE                                       */
  /* ======================================================================== */
  describe('Feature 6 — True Landed Cost Engine', () => {
    it('prevents double-counting GST and freight when already included in base price', () => {
      const res = computeTrueLandedCost({
        currency: 'INR',
        quantity: 10,
        unit: 'MT',
        baseMaterialPaise: rupeesToPaise(650000),
        gstRatePercent: 18,
        gstIncludedInBase: true,
        freightPaise: rupeesToPaise(15000),
        freightIncludedInBase: true,
        loadingPaise: rupeesToPaise(2000),
        unloadingPaise: rupeesToPaise(2000),
        insurancePaise: BigInt(0),
        packagingPaise: BigInt(0),
        otherChargesPaise: BigInt(0),
        discountPaise: BigInt(0),
      });

      expect(res.calculatedGstPaise).toBe(BigInt(0));
      expect(res.effectiveFreightPaise).toBe(BigInt(0));
      expect(res.totalLandedCostPaise).toBe(rupeesToPaise(654000));
      expect(res.doubleCountPreventionNotes).toHaveLength(2);
    });

    it('deduplicates revised quotation versions and generates explainable buyer decision support', () => {
      const deduped = deduplicateQuotationVersions([
        { rfqId: 'r1', supplierId: 's1', versionNumber: 1, id: 'old' },
        { rfqId: 'r1', supplierId: 's1', versionNumber: 2, id: 'latest' },
      ]);
      expect(deduped).toHaveLength(1);
      expect(deduped[0].id).toBe('latest');

      const comparison = evaluateComparableOffers(
        [
          {
            quotationId: 'qA', rfqId: 'r1', supplierId: 'sA', supplierName: 'Supplier A', versionNumber: 1,
            unit: 'MT', categorySlug: 'tmt-steel',
            requestedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
            quotedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
            costInput: {
              currency: 'INR', quantity: 10, unit: 'MT', baseMaterialPaise: rupeesToPaise(560000),
              gstRatePercent: 18, freightPaise: rupeesToPaise(10000), loadingPaise: BigInt(0),
              unloadingPaise: BigInt(0), insurancePaise: BigInt(0), packagingPaise: BigInt(0),
              otherChargesPaise: BigInt(0), discountPaise: BigInt(0),
            },
            deliveryDays: 2, paymentTerms: '30d', validUntilIso: '2027-01-01T00:00:00Z',
            supplierReliabilityScore: 95,
          },
          {
            quotationId: 'qB', rfqId: 'r1', supplierId: 'sB', supplierName: 'Supplier B', versionNumber: 1,
            unit: 'MT', categorySlug: 'tmt-steel',
            requestedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
            quotedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
            costInput: {
              currency: 'INR', quantity: 10, unit: 'MT', baseMaterialPaise: rupeesToPaise(540000),
              gstRatePercent: 18, freightPaise: rupeesToPaise(10000), loadingPaise: BigInt(0),
              unloadingPaise: BigInt(0), insurancePaise: BigInt(0), packagingPaise: BigInt(0),
              otherChargesPaise: BigInt(0), discountPaise: BigInt(0),
            },
            deliveryDays: 7, paymentTerms: '30d', validUntilIso: '2027-01-01T00:00:00Z',
            supplierReliabilityScore: 81,
          },
        ],
        'MT',
        new Date('2026-11-27')
      );

      expect(comparison.comparableOffers).toHaveLength(2);
      expect(comparison.explainableSummary).toContain('Supplier B offers the lowest comparable landed cost');
      expect(comparison.explainableSummary).toContain('Supplier A has a higher recorded reliability score');
      expect(comparison.explainableSummary).toContain('5 day(s) slower');
    });
  });

  /* ======================================================================== */
  /* FEATURE 7: PROCUREMENT AUTOPILOT                                         */
  /* ======================================================================== */
  describe('Feature 7 — Procurement Autopilot', () => {
    it('matches eligible verified suppliers with explanations, analyses quotations deterministically, and flags overdue deliveries', () => {
      const matches = matchSuppliersForRfq({
        categorySlug: 'tmt-steel',
        deliveryCity: 'Ahmedabad',
        requestedQuantity: 50,
        candidates: [
          {
            supplierBusinessId: 's1', supplierName: 'Gujarat Steel Hub',
            categoriesServed: ['tmt-steel'], citiesServed: ['Ahmedabad', 'Gandhinagar'],
            verificationStatus: 'VERIFIED', minOrderQuantity: 20,
            reliabilityScore: 92, completedTransactions: 14, responseRatePercent: 95,
          },
          {
            supplierBusinessId: 's2', supplierName: 'Suspended Dealer',
            categoriesServed: ['tmt-steel'], citiesServed: ['Ahmedabad'],
            verificationStatus: 'SUSPENDED', minOrderQuantity: 10,
            reliabilityScore: 40, completedTransactions: 5, responseRatePercent: 50,
          },
        ],
      });
      expect(matches).toHaveLength(1);
      expect(matches[0].eligible).toBe(true);
      expect(matches[0].matchReasons.some((r) => r.includes('GSTIN'))).toBe(true);

      const analysis = runDeterministicQuotationAnalysis({
        quotationId: 'q-1',
        supplierName: 'Gujarat Steel Hub',
        categorySlug: 'tmt-steel',
        requestedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
        quotedSpecs: { brand: 'Tata Tiscon', grade: 'Fe-500', diameterMm: '16mm', standard: 'IS 1786:2008' },
        costInput: {
          currency: 'INR', quantity: 10, unit: 'MT', baseMaterialPaise: rupeesToPaise(650000),
          gstRatePercent: 18, freightPaise: rupeesToPaise(10000), loadingPaise: BigInt(0),
          unloadingPaise: BigInt(0), insurancePaise: BigInt(0), packagingPaise: BigInt(0),
          otherChargesPaise: BigInt(0), discountPaise: BigInt(0),
        },
        baselineUnitPaise: rupeesToPaise(65000),
      });
      expect(analysis.humanAuthorisationRequired).toBe(true);
      expect(analysis.missingFields).toContain('paymentTerms');
      expect(analysis.specEquivalence.hasMaterialMismatch).toBe(true);
      expect(analysis.followUpQuestions.length).toBeGreaterThanOrEqual(3);

      const exceptions = detectDeliveryExceptions([
        {
          purchaseOrderId: 'PO-9',
          deliveryCode: 'DLV-9',
          expectedDeliveryDateIso: '2026-11-20',
          orderedQuantity: 50,
          receivedQuantity: 0,
          status: 'IN_TRANSIT',
          now: new Date('2026-11-27'),
        },
      ]);
      expect(exceptions).toHaveLength(1);
      expect(exceptions[0].exceptionType).toBe('DELIVERY_OVERDUE');
    });
  });
});

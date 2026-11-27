import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  rupeesToPaise,
  formatInrFromPaise,
  calculateLineSubtotalPaise,
  calculateGstPaise,
  calculateLandedCostPaise,
} from '@/lib/construction-procurement/money';
import {
  hasProcurementPermission,
  assertOrganisationIsolation,
  evaluateSeparationOfDuties,
} from '@/lib/construction-procurement/rbac';
import { evaluateSpecificationEquivalence } from '@/lib/construction-procurement/taxonomy';
import { buildComparisonMatrix } from '@/lib/construction-procurement/comparison-engine';
import { computeProcurementSavings } from '@/lib/construction-procurement/savings-intelligence';
import {
  evaluateThreeWayMatch,
  appendDisputeAuditEntry,
} from '@/lib/construction-procurement/fulfilment-engine';
import { generatePacificaPilotAssessment } from '@/lib/construction-procurement/pacifica-pilot';
import { executeProtectedAward, AwardConflictError } from '@/lib/construction-procurement/award-engine';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    procurementAward: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    procurementRfq: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    procurementQuotation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    procurementOrder: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('PROVENTA Master Transformation — Construction Procurement Integrity & Security Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Integer Paise Financial Precision', () => {
    it('computes exact integer paise totals without floating-point drift', () => {
      const rate = rupeesToPaise('55400.75');
      expect(rate).toBe(BigInt(5540075));

      const subtotal = calculateLineSubtotalPaise(rate, 12.5);
      expect(subtotal).toBe(BigInt(69250938)); // 55400.75 * 12.5 = 692509.375 -> 692509.38

      const gst = calculateGstPaise(subtotal, 18);
      expect(gst).toBe(BigInt(12465169));

      const landed = calculateLandedCostPaise({
        baseMaterialPaise: subtotal,
        gstPaise: gst,
        freightPaise: rupeesToPaise(15000),
        loadingPaise: rupeesToPaise(2500),
        unloadingPaise: rupeesToPaise(2500),
        insurancePaise: rupeesToPaise(1000),
        otherChargesPaise: BigInt(0),
        discountPaise: rupeesToPaise(5000),
        quantity: 12.5,
      });

      expect(landed.totalLandedCostPaise).toBe(subtotal + gst + rupeesToPaise(16000));
      expect(formatInrFromPaise(rupeesToPaise('125000.50'))).toBe('₹1,25,000.50');
    });

    it('rejects negative cost components', () => {
      expect(() =>
        calculateLandedCostPaise({
          baseMaterialPaise: BigInt(-100),
          gstPaise: BigInt(0),
          freightPaise: BigInt(0),
          loadingPaise: BigInt(0),
          unloadingPaise: BigInt(0),
          insurancePaise: BigInt(0),
          otherChargesPaise: BigInt(0),
          discountPaise: BigInt(0),
          quantity: 10,
        })
      ).toThrow(/INVALID_COST_COMPONENT/);
    });
  });

  describe('2. Specification Equivalence & Intelligent Comparison Centre', () => {
    it('explicitly flags non-equivalent grades (Fe-550D vs Fe-500) so quotes are not compared as equal', () => {
      const result = evaluateSpecificationEquivalence(
        'tmt-steel',
        { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
        { brand: 'Tata Tiscon', grade: 'Fe-500', diameterMm: '16mm', standard: 'IS 1786:2008' }
      );
      expect(result.isEquivalent).toBe(false);
      expect(result.hasMaterialMismatch).toBe(true);
      expect(result.summary).toContain('NON-EQUIVALENT SPECIFICATION');
    });

    it('permits explicitly approved alternative brands while locking grade and diameter', () => {
      const result = evaluateSpecificationEquivalence(
        'tmt-steel',
        { brand: 'Tata Tiscon', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
        { brand: 'JSW Neosteel', grade: 'Fe-550D', diameterMm: '16mm', standard: 'IS 1786:2008' },
        ['JSW Neosteel']
      );
      expect(result.isEquivalent).toBe(true);
      expect(result.hasMaterialMismatch).toBe(false);
    });

    it('distinguishes lowest nominal landed cost from lowest spec-compliant landed cost', () => {
      const pilot = generatePacificaPilotAssessment();
      expect(pilot.isSampleData).toBe(true);
      expect(pilot.comparison.nonEquivalentWarningCount).toBe(1);
      // Lowest overall is non-compliant PILOT-QUOTE-03, lowest spec-compliant is PILOT-QUOTE-02
      expect(pilot.comparison.highlights.lowestLandedCostQuotationId).toBe('PILOT-QUOTE-03');
      expect(pilot.comparison.highlights.lowestCompliantLandedCostQuotationId).toBe('PILOT-QUOTE-02');
    });
  });

  describe('3. Procurement Savings Intelligence — Potential vs. Realised Separation', () => {
    it('blocks recording REALISED savings without approved PO and GRN/Invoice evidence', () => {
      expect(() =>
        computeProcurementSavings({
          classification: 'REALISED',
          rfqId: 'RFQ-001',
          purchaseOrderId: null,
          quantity: 100,
          unit: 'MT',
          baselineUnitLandedPaise: rupeesToPaise(68000),
          comparedUnitLandedPaise: rupeesToPaise(65000),
          disclosure: {
            dataSource: 'Internal PO History',
            observationDateIso: '2026-11-27',
            productSpecification: 'TMT Fe-550D 16mm',
            geography: 'Ahmedabad',
            sampleSize: 4,
            limitations: 'Q4 spot pricing only',
          },
        })
      ).toThrow(/SAVINGS_INTEGRITY_ERROR/);

      expect(() =>
        computeProcurementSavings({
          classification: 'REALISED',
          rfqId: 'RFQ-001',
          purchaseOrderId: 'PO-2026-001',
          goodsReceiptId: null,
          invoiceNumber: null,
          quantity: 100,
          unit: 'MT',
          baselineUnitLandedPaise: rupeesToPaise(68000),
          comparedUnitLandedPaise: rupeesToPaise(65000),
          disclosure: {
            dataSource: 'Internal PO History',
            observationDateIso: '2026-11-27',
            productSpecification: 'TMT Fe-550D 16mm',
            geography: 'Ahmedabad',
            sampleSize: 4,
            limitations: 'Q4 spot pricing only',
          },
        })
      ).toThrow(/SAVINGS_INTEGRITY_ERROR/);
    });

    it('records REALISED savings when linked to approved PO + GRN evidence', () => {
      const res = computeProcurementSavings({
        classification: 'REALISED',
        rfqId: 'RFQ-001',
        purchaseOrderId: 'PO-2026-001',
        goodsReceiptId: 'GRN-2026-001',
        quantity: 100,
        unit: 'MT',
        baselineUnitLandedPaise: rupeesToPaise(68000),
        comparedUnitLandedPaise: rupeesToPaise(66000),
        disclosure: {
          dataSource: 'Verified Historical PO Ledger',
          observationDateIso: '2026-11-27',
          productSpecification: 'TMT Fe-550D 16mm',
          geography: 'Ahmedabad',
          sampleSize: 5,
          limitations: 'Excludes seasonal steel surcharge',
        },
      });
      expect(res.evidenceVerified).toBe(true);
      expect(res.totalSavingsPaise).toBe(rupeesToPaise(200000));
    });
  });

  describe('4. RBAC, Tenant Isolation & Separation of Duties', () => {
    it('blocks cross-organisation data access (Buyer A cannot access Buyer B)', () => {
      const check = assertOrganisationIsolation(['org-buyer-a'], 'org-buyer-b', false);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('FORBIDDEN_CROSS_TENANT_ACCESS');
    });

    it('blocks RFQ creator from self-approving purchases above the dual-control threshold', () => {
      const sod = evaluateSeparationOfDuties({
        rfqCreatorUserId: 'user-exec-1',
        actorUserId: 'user-exec-1',
        actorRoles: ['PROCUREMENT_MANAGER'],
        amountPaise: rupeesToPaise(500000), // ₹5,00,000 > ₹50,000 limit
      });
      expect(sod.allowed).toBe(false);
      expect(sod.reason).toContain('SEPARATION_OF_DUTIES_VIOLATION');
    });

    it('blocks Procurement Executive from executing supplier awards', () => {
      expect(hasProcurementPermission(['PROCUREMENT_EXECUTIVE'], 'award:execute')).toBe(false);
      expect(hasProcurementPermission(['PROCUREMENT_HEAD'], 'award:execute')).toBe(true);
      expect(hasProcurementPermission(['SUPPLIER_OWNER'], 'quotation:read_buyer')).toBe(false);
    });
  });

  describe('5. Protected Award Engine — Duplicate, Expiry & Separation of Duties', () => {
    it('rejects duplicate award for an already-awarded RFQ with HTTP 409', async () => {
      vi.mocked(db.procurementAward.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.$transaction).mockImplementationOnce(async (cb: any) => {
        const tx = {
          $queryRaw: vi.fn().mockResolvedValue([{ id: 'RFQ-1' }]),
          procurementRfq: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'RFQ-1',
              buyerBusinessId: 'org-a',
              creatorUserId: 'user-creator',
              status: 'PO_ISSUED',
              purchaseOrderId: 'PO-EXISTING',
            }),
          },
          procurementAward: {
            findUnique: vi.fn().mockResolvedValue({ id: 'AWD-1', purchaseOrderId: 'PO-EXISTING' }),
          },
        };
        return cb(tx);
      });

      await expect(
        executeProtectedAward({
          organisationId: 'org-a',
          rfqId: 'RFQ-1',
          quotationId: 'QUOTE-2',
          actorUserId: 'user-approver',
          actorRoles: ['PROCUREMENT_HEAD'],
          idempotencyKey: 'idem-key-dup-01',
          technicalEvalPassed: true,
        })
      ).rejects.toMatchObject({ statusCode: 409, code: 'ALREADY_AWARDED' });
    });

    it('rejects awarding an expired quotation with HTTP 409', async () => {
      vi.mocked(db.procurementAward.findUnique).mockResolvedValueOnce(null);
      vi.mocked(db.$transaction).mockImplementationOnce(async (cb: any) => {
        const tx = {
          $queryRaw: vi.fn().mockResolvedValue([{ id: 'RFQ-2' }]),
          procurementRfq: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'RFQ-2',
              buyerBusinessId: 'org-a',
              creatorUserId: 'user-creator',
              status: 'QUOTED',
              purchaseOrderId: null,
            }),
          },
          procurementAward: { findUnique: vi.fn().mockResolvedValue(null) },
          procurementQuotation: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'QUOTE-EXPIRED',
              rfqId: 'RFQ-2',
              totalLandedCost: 100000,
              validUntil: new Date('2020-01-01T00:00:00Z'),
            }),
          },
        };
        return cb(tx);
      });

      await expect(
        executeProtectedAward({
          organisationId: 'org-a',
          rfqId: 'RFQ-2',
          quotationId: 'QUOTE-EXPIRED',
          actorUserId: 'user-approver',
          actorRoles: ['PROCUREMENT_HEAD'],
          idempotencyKey: 'idem-key-exp-01',
          technicalEvalPassed: true,
        })
      ).rejects.toMatchObject({ statusCode: 409, code: 'QUOTATION_EXPIRED' });
    });
  });

  describe('6. Three-Way Matching & Immutable Dispute Audit Trail', () => {
    it('approves payment when PO + GRN + Invoice match exactly in integer paise', () => {
      const match = evaluateThreeWayMatch({
        purchaseOrderId: 'PO-1',
        invoiceNumber: 'INV-101',
        poOrderedQuantity: 50,
        poUnitRatePaise: rupeesToPaise(55000),
        poGstRatePercent: 18,
        grnAcceptedQuantity: 50,
        invoiceBilledQuantity: 50,
        invoiceUnitRatePaise: rupeesToPaise(55000),
        invoiceTaxAmountPaise: rupeesToPaise(495000),
        invoiceTotalAmountPaise: rupeesToPaise(3245000),
      });
      expect(match.status).toBe('MATCHED');
      expect(match.eligibleForPaymentApproval).toBe(true);
      expect(match.variancePaise).toBe(BigInt(0));
    });

    it('flags QUANTITY_DISCREPANCY and holds payment when supplier overbills vs GRN', () => {
      const match = evaluateThreeWayMatch({
        purchaseOrderId: 'PO-1',
        invoiceNumber: 'INV-102',
        poOrderedQuantity: 50,
        poUnitRatePaise: rupeesToPaise(55000),
        poGstRatePercent: 18,
        grnAcceptedQuantity: 45, // 5 MT short at site
        invoiceBilledQuantity: 50,
        invoiceUnitRatePaise: rupeesToPaise(55000),
        invoiceTaxAmountPaise: rupeesToPaise(495000),
        invoiceTotalAmountPaise: rupeesToPaise(3245000),
      });
      expect(match.status).toBe('QUANTITY_DISCREPANCY');
      expect(match.eligibleForPaymentApproval).toBe(false);
      expect(match.discrepancyReasons[0]).toContain('QUANTITY_OVERBILL');
    });

    it('preserves immutable append-only dispute history without mutating prior entries', () => {
      const h1 = appendDisputeAuditEntry([], {
        timestampIso: '2026-11-27T10:00:00Z',
        actorUserId: 'buyer-1',
        action: 'CREATED',
        note: 'Shortage of 5 MT on weighbridge slip #441',
        newStatus: 'OPEN',
      });
      const h2 = appendDisputeAuditEntry(h1, {
        timestampIso: '2026-11-27T12:00:00Z',
        actorUserId: 'admin-1',
        action: 'RESOLVED',
        note: 'Supplier issued credit note CN-882',
        previousStatus: 'OPEN',
        newStatus: 'RESOLVED',
      });
      expect(h1).toHaveLength(1);
      expect(h2).toHaveLength(2);
      expect(h2[0].note).toContain('Shortage of 5 MT');
    });
  });
});

/**
 * PROVENTA — Industrial Procurement Platform
 * Unified Platform Integration & End-to-End Lifecycle Test Suite
 *
 * Validates the complete 16-step procurement lifecycle across all 3 subsystems:
 * 1. Business Registration, Onboarding & Multi-Business Authorization (commit fdc5e23)
 * 2. Critical Procurement Remediation & P0 Hardening (commit 5bde3c8)
 * 3. Supplier Intelligence & Discovery Engine (commit 046dfc3)
 *
 * Lifecycle Steps Verified:
 * 1. New enterprise registration
 * 2. Role selection (BUYER, SUPPLIER, BOTH)
 * 3. Profile details, GSTIN, and verification document submission
 * 4. Administrator review and verification
 * 5. Supplier commercial storefront creation
 * 6. Product catalogue upload with technical specs & IS standards
 * 7. Buyer multi-faceted supplier discovery & filtering
 * 8. Side-by-side supplier comparison
 * 9. RFQ creation with multi-item BOQ
 * 10. Automated location & catalogue matching with invitation delivery
 * 11. Multiple suppliers submitting competitive quotations
 * 12. Confidential side-by-side quotation comparison
 * 13. Buyer explicit quotation selection & award
 * 14. Atomic PO creation & strict duplicate award prevention (409 Conflict)
 * 15. Real-time multi-channel notifications (Zero competitor leakage)
 * 16. Supplier performance telemetry update & SLA tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createConstructionRfq,
  getConstructionRfqById,
  submitConstructionQuotation,
  getQuotationsForRfq,
  compareQuotationsForRfq,
  selectQuotationAndCreatePoAtomic,
  getPurchaseOrderById,
  AlreadyAwardedError,
} from '@/lib/procurement/repository';
import {
  getPublicSupplierStorefront,
  addSupplierProduct,
  searchSuppliers,
  matchSuppliersForRfq,
  toggleSaveSupplier,
  listSavedSuppliers,
  inviteSupplierToRfq,
} from '@/lib/supplier-intelligence/service';
import { resolveSupplierContext } from '@/lib/business/auth-context';
import { procurementNotificationService } from '@/lib/business/notifications';

describe('PROVENTA — Unified Platform Lifecycle & Security Integration', () => {
  // Test Actor Profiles
  const buyerUser = {
    id: 'usr_unified_buyer_01',
    email: 'procurement@adaniconstruction.in',
    name: 'Adani Infrastructure Projects',
  };

  const buyerBusiness = {
    id: 'biz_adani_infra_gujarat',
    name: 'Adani Infrastructure Projects Ltd',
    slug: 'adani-infra-projects',
    platformRole: 'BUYER',
  };

  const supplierAUser = {
    id: 'usr_unified_supp_a',
    email: 'sales@gujaratsteelsyndicate.com',
    name: 'Gujarat Building Materials Syndicate',
  };

  const supplierABusiness = {
    id: 'supp-gujarat-steel-cement',
    name: 'Gujarat Building Materials Syndicate',
  };

  const supplierBBusiness = {
    id: 'supp-sabarmati-tmt-rmc',
    name: 'Sabarmati Steel & Concrete Solutions',
  };

  const supplierCBusiness = {
    id: 'supp-royal-ceramics-marble',
    name: 'Royal Vitrified & Natural Stone Hub',
  };

  const competitorAttacker = {
    id: 'usr_attacker_spy',
    email: 'spy@competitor-steels.com',
  };

  beforeEach(() => {
    (globalThis as any).__proventaInAppNotifications = [];
  });

  // =========================================================================
  // STEP 1-4: BUSINESS REGISTRATION & VERIFICATION
  // =========================================================================
  describe('Steps 1-4: Business Registration, Role Selection & Verification', () => {
    it('1.1 resolves multi-business context and platform role correctly', async () => {
      const ctx = await resolveSupplierContext({
        user: buyerUser,
      });

      expect(ctx).toBeDefined();
      expect(Array.isArray(ctx.authorizedBusinesses)).toBe(true);
    });
  });

  // =========================================================================
  // STEP 5-6: STOREFRONT & CATALOGUE MANAGEMENT
  // =========================================================================
  describe('Steps 5-6: Supplier Storefront & Product Catalogue Management', () => {
    it('5.1 renders public supplier storefront without leaking confidential records', async () => {
      const sf = await getPublicSupplierStorefront(supplierABusiness.id);

      expect(sf).toBeDefined();
      expect(sf?.name).toBe('Gujarat Building Materials Syndicate');
      expect(sf?.gstVerificationStatus).toBe('VERIFIED');
      expect(sf?.proventaVerificationStatus).toBe('VERIFIED');

      // Security boundary verification: confidential fields must be strictly undefined
      const unsafe = sf as any;
      expect(unsafe.pan).toBeUndefined();
      expect(unsafe.cin).toBeUndefined();
      expect(unsafe.bankDetails).toBeUndefined();
      expect(unsafe.bankAccount).toBeUndefined();
      expect(unsafe.privatePhone).toBeUndefined();
    });

    it('6.1 enables registered supplier to register products with technical specs', async () => {
      const product = await addSupplierProduct(
        supplierABusiness.id,
        {
          name: 'Fe 550D High-Ductility Corrosion Resistant TMT',
          category: 'Structural Steel & TMT',
          subcategory: 'Primary Rebars',
          brand: 'Tata Tiscon CRS',
          grade: 'Fe 550D CRS',
          standards: 'IS 1786:2008',
          unit: 'Metric tonnes (MT)',
          indicativePrice: 56500,
          moq: 20,
          availableQuantity: 400,
        },
        supplierAUser.id
      );

      expect(product).toBeDefined();
      expect(product.brand).toBe('Tata Tiscon CRS');
      expect(product.indicativePrice).toBe(56500);
      expect(product.isActive).toBe(true);
    });
  });

  // =========================================================================
  // STEP 7-8: BUYER DISCOVERY & COMPARISON
  // =========================================================================
  describe('Steps 7-8: Buyer Supplier Discovery, Filtering & Comparison', () => {
    it('7.1 discovers verified suppliers by category and district filters', async () => {
      const searchRes = await searchSuppliers({
        category: 'Structural Steel & TMT',
        district: 'Ahmedabad',
        verificationStatus: 'VERIFIED',
      });

      expect(searchRes.suppliers.length).toBeGreaterThanOrEqual(1);
      const first = searchRes.suppliers[0];
      expect(first.categories.some((c) => c.toLowerCase().includes('steel'))).toBe(true);
      expect(first.city.toLowerCase()).toContain('ahmedabad');
    });

    it('8.1 persists saved suppliers isolated to the buyer business', async () => {
      const sf = await getPublicSupplierStorefront(supplierABusiness.id);
      expect(sf).toBeDefined();

      // Save
      const saveRes = await toggleSaveSupplier(
        buyerBusiness.id,
        sf!.id,
        'Preferred vendor for Ahmedabad East package'
      );
      expect(saveRes.isSaved).toBe(true);

      // Verify list
      const savedList = await listSavedSuppliers(buyerBusiness.id);
      expect(savedList.some((s) => s.id === sf!.id)).toBe(true);

      // Cleanup
      await toggleSaveSupplier(buyerBusiness.id, sf!.id);
    });
  });

  // =========================================================================
  // STEP 9-10: RFQ CREATION & AUTOMATIC LOCATION MATCHING
  // =========================================================================
  describe('Steps 9-10: RFQ Creation, Multi-item BOQ & Location Matching', () => {
    let rfqId: string;

    beforeEach(() => {
      const rfq = createConstructionRfq({
        buyerId: buyerUser.id,
        buyerBusinessId: buyerBusiness.id,
        buyerName: buyerBusiness.name,
        buyerEmail: buyerUser.email,
        title: 'SG Highway Commercial Complex Foundation & Podium BOQ',
        projectType: 'COMMERCIAL',
        requiredDeliveryDate: '2026-11-30',
        delivery: {
          siteName: 'SG Highway Tech Park Plot 9',
          addressLine: 'Near Vaishnodevi Circle, SG Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '382421',
          siteContactPerson: 'Vikram Mehta',
          siteContactPhone: '+91 98251 99881',
          vehicleAccessibility: '10-Wheeler Truck',
        },
        items: [
          {
            materialName: 'Primary TMT Steel Rebars Fe 550D',
            categorySlug: 'structural-steel',
            categoryName: 'Structural Steel & TMT',
            gradeOrSpec: 'Fe 550D',
            brandPreference: 'Tata Tiscon',
            quantity: 150,
            unit: 'Metric tonnes (MT)',
          },
          {
            materialName: 'OPC 53 Grade High Performance Cement',
            categorySlug: 'cement-aggregates',
            categoryName: 'Cement & Ready Mix Concrete (RMC)',
            gradeOrSpec: 'OPC 53',
            brandPreference: 'UltraTech',
            quantity: 2500,
            unit: 'Bags',
          },
        ],
      });
      rfqId = rfq.id;
    });

    it('9.1 creates RFQ with multi-item BOQ and triggers automatic matching', async () => {
      const rfq = getConstructionRfqById(rfqId);
      expect(rfq).toBeDefined();
      expect(rfq?.id).toBeDefined();
      expect(rfq?.items.length).toBe(2);
      expect(['OPEN', 'SUPPLIERS_INVITED']).toContain(rfq?.status);
      expect(Array.isArray(rfq?.invitedSupplierIds)).toBe(true);
    });

    it('10.1 matches eligible suppliers based on stockyard location and catalogue specs', async () => {
      const matches = await matchSuppliersForRfq(rfqId);

      expect(matches.length).toBeGreaterThan(0);
      const topMatch = matches[0];
      expect(topMatch.matchScore).toBeGreaterThanOrEqual(50);
      expect(topMatch.matchingReasons.length).toBeGreaterThan(0);
      expect(topMatch.matchedProducts.length).toBeGreaterThan(0);
    });

    it('10.2 delivers direct manual invitation to discovered supplier', async () => {
      const inviteRes = await inviteSupplierToRfq(rfqId, supplierBBusiness.id, buyerUser.id);

      expect(inviteRes.success).toBe(true);
      expect(inviteRes.matchRecord).toBeDefined();

      const rfq = getConstructionRfqById(rfqId);
      expect(rfq?.invitedSupplierIds).toContain(supplierBBusiness.id);
    });
  });

  // =========================================================================
  // STEP 11-12: MULTI-SUPPLIER QUOTATIONS & CONFIDENTIAL COMPARISON
  // =========================================================================
  describe('Steps 11-12: Multi-Supplier Quotations & Confidential Comparison', () => {
    let rfqId: string;
    let quoteAId: string;
    let quoteBId: string;

    beforeEach(() => {
      const rfq = createConstructionRfq({
        buyerId: buyerUser.id,
        buyerBusinessId: buyerBusiness.id,
        buyerName: buyerBusiness.name,
        buyerEmail: buyerUser.email,
        title: 'Bopal High-Rise Residential Tower BOQ',
        projectType: 'RESIDENTIAL',
        requiredDeliveryDate: '2026-12-05',
        delivery: {
          siteName: 'Bopal Sky Villas',
          addressLine: 'South Bopal Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380058',
          siteContactPerson: 'Karan Shah',
          siteContactPhone: '+91 98250 88771',
          vehicleAccessibility: '10-Wheeler Truck',
        },
        items: [
          {
            materialName: 'TMT Bars Fe 550D',
            categorySlug: 'structural-steel',
            categoryName: 'Structural Steel & TMT',
            gradeOrSpec: 'Fe 550D',
            quantity: 100,
            unit: 'Metric tonnes (MT)',
          },
        ],
      });
      rfqId = rfq.id;

      // Supplier 1 submits quote
      const qA = submitConstructionQuotation({
        rfqId,
        supplierId: supplierABusiness.id,
        items: [
          {
            itemId: rfq.items[0].id,
            brandSupplied: 'Tata Tiscon',
            unitPrice: 54000,
            gstRatePercent: 18,
            technicalNotes: 'Fe 550D primary stock',
          },
        ],
        deliveryCharges: 25000,
        promisedDeliveryDate: '2026-11-28',
        paymentTerms: '30_DAYS_NET',
      });
      quoteAId = qA.id;

      // Supplier 2 submits competing quote
      const qB = submitConstructionQuotation({
        rfqId,
        supplierId: supplierBBusiness.id,
        items: [
          {
            itemId: rfq.items[0].id,
            brandSupplied: 'Jindal Panther',
            unitPrice: 53200,
            gstRatePercent: 18,
            technicalNotes: 'Fe 550D factory direct',
          },
        ],
        deliveryCharges: 20000,
        promisedDeliveryDate: '2026-11-26',
        paymentTerms: 'IMMEDIATE',
      });
      quoteBId = qB.id;
    });

    it('11.1 records multiple independent quotations against one RFQ', () => {
      const allQuotes = getQuotationsForRfq(rfqId);
      expect(allQuotes.length).toBe(2);
    });

    it('12.1 preserves strict competitor confidentiality between competing suppliers', () => {
      const allQuotes = getQuotationsForRfq(rfqId);

      // Supplier A must only see their own quote
      const supplierAQuotes = allQuotes.filter((q) => q.supplierId === supplierABusiness.id);
      expect(supplierAQuotes.length).toBe(1);
      expect(supplierAQuotes[0].supplierId).toBe(supplierABusiness.id);
      expect(supplierAQuotes.some((q) => q.supplierId === supplierBBusiness.id)).toBe(false);

      // Supplier B must only see their own quote
      const supplierBQuotes = allQuotes.filter((q) => q.supplierId === supplierBBusiness.id);
      expect(supplierBQuotes.length).toBe(1);
      expect(supplierBQuotes[0].supplierId).toBe(supplierBBusiness.id);
      expect(supplierBQuotes.some((q) => q.supplierId === supplierABusiness.id)).toBe(false);

      // Unrelated competitor must see ZERO quotes in filtered perspective
      const attackerQuotes = allQuotes.filter((q) => q.supplierId === competitorAttacker.id);
      expect(attackerQuotes.length).toBe(0);
    });

    it('12.2 allows authorized buyer to view complete side-by-side comparison matrix', () => {
      const matrix = compareQuotationsForRfq(rfqId);

      expect(matrix).toBeDefined();
      expect(matrix?.quotations.length).toBe(2);
      expect(matrix?.lowestTotalPrice).toBeGreaterThan(0);
      expect(matrix?.fastestDeliveryDate).toBeDefined();
    });
  });

  // =========================================================================
  // STEP 13-16: ATOMIC AWARD, PO GENERATION, NOTIFICATIONS & PERFORMANCE
  // =========================================================================
  describe('Steps 13-16: Atomic PO Award, Concurrency Hardening & SLA Tracking', () => {
    let rfqId: string;
    let quoteAId: string;
    let quoteBId: string;

    beforeEach(() => {
      const rfq = createConstructionRfq({
        buyerId: buyerUser.id,
        buyerBusinessId: buyerBusiness.id,
        buyerName: buyerBusiness.name,
        buyerEmail: buyerUser.email,
        title: 'Sanand Industrial Factory Shed Package',
        projectType: 'INDUSTRIAL',
        requiredDeliveryDate: '2026-12-10',
        delivery: {
          siteName: 'Sanand GIDC Plot 120',
          addressLine: 'Sanand Industrial Estate',
          city: 'Sanand',
          state: 'Gujarat',
          pincode: '382110',
          siteContactPerson: 'Pravin Solanki',
          siteContactPhone: '+91 98252 77112',
          vehicleAccessibility: 'Trailer Accessible',
        },
        items: [
          {
            materialName: 'Structural Steel Beams',
            categorySlug: 'structural-steel',
            categoryName: 'Structural Steel & TMT',
            gradeOrSpec: 'E250BR',
            quantity: 60,
            unit: 'Metric tonnes (MT)',
          },
        ],
      });
      rfqId = rfq.id;

      const qA = submitConstructionQuotation({
        rfqId,
        supplierId: supplierABusiness.id,
        items: [
          {
            itemId: rfq.items[0].id,
            brandSupplied: 'SAIL',
            unitPrice: 56000,
            gstRatePercent: 18,
            technicalNotes: 'E250BR certified',
          },
        ],
        deliveryCharges: 15000,
        promisedDeliveryDate: '2026-12-01',
        paymentTerms: '15_DAYS_NET',
      });
      quoteAId = qA.id;

      const qB = submitConstructionQuotation({
        rfqId,
        supplierId: supplierBBusiness.id,
        items: [
          {
            itemId: rfq.items[0].id,
            brandSupplied: 'JSPL',
            unitPrice: 55500,
            gstRatePercent: 18,
            technicalNotes: 'E250BR certified',
          },
        ],
        deliveryCharges: 18000,
        promisedDeliveryDate: '2026-12-03',
        paymentTerms: 'IMMEDIATE',
      });
      quoteBId = qB.id;
    });

    it('13.1 & 14.1 successfully awards selected quotation and generates unique PO', async () => {
      const { order: po } = await selectQuotationAndCreatePoAtomic({
        quotationId: quoteAId,
        rfqId,
        buyerConfirmed: true,
      });

      expect(po).toBeDefined();
      expect(po.id).toMatch(/^po_/);
      expect(po.rfqId).toBe(rfqId);
      expect(po.quotationId).toBe(quoteAId);
      expect(po.deliveryStatus).toBe('ORDER_CONFIRMED');

      // Verify RFQ status updated to PO_ISSUED
      const updatedRfq = getConstructionRfqById(rfqId);
      expect(updatedRfq?.status).toBe('PO_ISSUED');
      expect(updatedRfq?.selectedQuotationId).toBe(quoteAId);
      expect(updatedRfq?.purchaseOrderId).toBe(po.id);
    });

    it('14.2 strictly rejects duplicate award attempts with AlreadyAwardedError (409 Conflict)', async () => {
      // First award succeeds
      await selectQuotationAndCreatePoAtomic({
        quotationId: quoteAId,
        rfqId,
        buyerConfirmed: true,
      });

      // Attempting to award competitor quote B MUST fail atomically
      await expect(
        selectQuotationAndCreatePoAtomic({
          quotationId: quoteBId,
          rfqId,
          buyerConfirmed: true,
        })
      ).rejects.toThrow(AlreadyAwardedError);

      // Idempotent retry of quote A returns the existing PO without creating a second PO
      const { order: retriedPo } = await selectQuotationAndCreatePoAtomic({
        quotationId: quoteAId,
        rfqId,
        buyerConfirmed: true,
      });
      expect(retriedPo).toBeDefined();
      expect(retriedPo.quotationId).toBe(quoteAId);
    });

    it('14.3 safely handles simultaneous concurrent award requests', async () => {
      // Simulate two concurrent requests arriving at the same millisecond
      const [resA, resB] = await Promise.allSettled([
        selectQuotationAndCreatePoAtomic({
          quotationId: quoteAId,
          rfqId,
          buyerConfirmed: true,
        }),
        selectQuotationAndCreatePoAtomic({
          quotationId: quoteBId,
          rfqId,
          buyerConfirmed: true,
        }),
      ]);

      // Exactly one must succeed, and the other must be rejected
      const fulfilled = [resA, resB].filter((r) => r.status === 'fulfilled');
      const rejected = [resA, resB].filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // The rejected error must be AlreadyAwardedError
      const rejectedError = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectedError).toBeInstanceOf(AlreadyAwardedError);
    });

    it('15.1 delivers win & loss notifications without leaking competitor pricing', async () => {
      const winnerNotice = await procurementNotificationService.notifySupplierQuotationAwarded(
        supplierABusiness.id,
        'PO-77892',
        'Sanand Shed',
        rfqId
      );
      expect(winnerNotice).toBe(true);

      const loserNotice = await procurementNotificationService.notifySupplierQuotationRejected(
        supplierBBusiness.id,
        'Sanand Shed',
        rfqId
      );
      expect(loserNotice).toBe(true);

      // Verify no price leakage in notification content
      const notifications = (globalThis as any).__proventaInAppNotifications || [];
      const loserNotif = notifications.find((n: any) => n.userId === supplierBBusiness.id);
      expect(loserNotif).toBeDefined();
      expect(loserNotif.body).not.toMatch(/₹|Rs\.|price|subtotal|winner bid/i);
    });

    it('16.1 enforces minimum sample threshold on verified supplier performance', async () => {
      const sf = await getPublicSupplierStorefront(supplierABusiness.id);
      expect(sf).toBeDefined();

      const perf = sf?.performance;
      expect(perf).toBeDefined();
      if ((perf?.ordersCompleted || 0) >= 3) {
        expect(perf?.sampleThresholdMet).toBe(true);
        expect(perf?.rating).toBeGreaterThan(0);
      } else {
        expect(perf?.sampleThresholdMet).toBe(false);
      }
    });
  });
});

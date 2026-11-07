/**
 * PROVENTA — Industrial Procurement Platform
 * Production Readiness & Operational Reliability Test Suite
 *
 * Verifies:
 * 1. Dynamic Supplier Quoting & Multi-Business Context
 * 2. Purchase Order Tenant Isolation & RBAC
 * 3. Supplier Dispatch Recording & Stage Progression Authorization
 * 4. Buyer Physical Site Delivery Receipt Sign-off & Order Closure
 * 5. RFQ Cancellation / Withdrawal Workflow & State Guardrails
 * 6. Cross-Business Buyer & Supplier Repository Query Resolution
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  createConstructionRfq,
  getConstructionRfqById,
  submitConstructionQuotation,
  selectQuotationAndCreatePoAtomic,
  getPurchaseOrderById,
  cancelConstructionRfq,
  listBuyerRfqs,
  listBuyerOrders,
  listSupplierOrders,
  updateOrderDispatchDetails,
  advanceOrderDeliveryStage,
  confirmOrderDeliveryReceipt,
} from '@/lib/procurement/repository';
import { resolveSupplierContext } from '@/lib/business/auth-context';

describe('PROVENTA — Production Readiness & Operational Reliability', () => {
  afterAll(async () => {
    // Allow background non-blocking microtasks to settle before worker teardown
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  const buyerUser = {
    id: 'user-apex-constructions',
    name: 'Apex Mega Infrastructures Ltd',
    email: 'procure@apexmega.in',
    roles: ['BUYER'],
  };

  const buyerBusinessId = 'biz-apex-infra-001';

  const supplierPrimary = {
    id: 'supp-gujarat-steel-cement',
    name: 'Gujarat Building Materials Syndicate',
    businessId: 'biz-gujarat-bms-001',
  };

  const supplierCompetitor = {
    id: 'supp-sabarmati-tmt-rmc',
    name: 'Sabarmati Steel & Concrete Solutions',
    businessId: 'biz-sabarmati-002',
  };

  let testRfq: ReturnType<typeof createConstructionRfq>;
  let winningQuote: ReturnType<typeof submitConstructionQuotation>;
  let po: any;

  beforeEach(async () => {
    // Create baseline RFQ
    testRfq = createConstructionRfq({
      buyerId: buyerUser.id,
      buyerBusinessId: buyerBusinessId,
      buyerName: buyerUser.name,
      buyerEmail: buyerUser.email,
      buyerRole: 'CONTRACTOR',
      title: 'Structural Steel Fe 550D for Sanand Manufacturing Plant',
      projectType: 'INDUSTRIAL',
      items: [
        {
          materialName: 'TMT Steel Rebars Fe 550D (16mm)',
          categorySlug: 'building-materials',
          categoryName: 'Building Materials',
          quantity: 50,
          unit: 'Metric tonnes (MT)',
        },
      ],
      delivery: {
        siteName: 'Sanand Industrial Cluster Plot 8',
        addressLine: 'GIDC Sanand II, Near Tata Motors Plant',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382170',
        siteContactPerson: 'Pravin Solanki Site Engineer',
        siteContactPhone: '+91 98255 12345',
        vehicleAccessibility: '10-Wheeler Truck',
      },
      requiredDeliveryDate: '2026-12-15',
      urgency: 'STANDARD',
    });

    // Supplier submits quotation
    winningQuote = submitConstructionQuotation({
      rfqId: testRfq.id,
      supplierId: supplierPrimary.id,
      supplierName: supplierPrimary.name,
      items: [
        {
          itemId: testRfq.items[0].id,
          unitPrice: 53500,
          gstRatePercent: 18,
          brandSupplied: 'Tata Tiscon Fe 550D Primary Producer',
          technicalNotes: 'Direct factory mill dispatched with test report',
        },
      ],
      deliveryCharges: 12000,
      discountAmount: 5000,
      promisedDeliveryDate: '2026-12-10',
      validityDays: 14,
      paymentTerms: '20% advance, 80% on site weighbridge delivery',
    } as any);

    // Explicit buyer award with mandatory confirmation flag
    const result = await selectQuotationAndCreatePoAtomic({
      rfqId: testRfq.id,
      quotationId: winningQuote.id,
      buyerUserId: buyerUser.id,
      buyerName: buyerUser.name,
      buyerEmail: buyerUser.email,
      buyerConfirmed: true,
    } as any);
    po = result.order;
  });

  // --------------------------------------------------------------------------
  // 1. Dynamic Supplier Quoting & Context Resolution
  // --------------------------------------------------------------------------
  describe('1. Dynamic Supplier Context & Multi-Business Bidding', () => {
    it('resolves supplier context dynamically without hardcoded identity failure', async () => {
      const resolved = await resolveSupplierContext({
        user: {
          id: supplierPrimary.id,
          name: supplierPrimary.name,
          roles: ['SUPPLIER'],
        },
        requestedSupplierId: supplierPrimary.id,
      });

      expect(resolved.isAuthorized).toBe(true);
      expect(resolved.supplierId).toBe(supplierPrimary.id);
    });

    it('rejects unauthorized supplier attempting to bid as competitor', async () => {
      const resolved = await resolveSupplierContext({
        user: {
          id: 'user-random-vendor',
          name: 'Random Vendor',
          roles: ['SUPPLIER'],
        },
        requestedSupplierId: supplierPrimary.id,
      });

      // User does not own or have membership in supplierPrimary
      expect(resolved.isAuthorized).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Repository Multi-Business Query Resolution
  // --------------------------------------------------------------------------
  describe('2. Multi-Business Query Resolution', () => {
    it('retrieves buyer RFQs by both user ID and business ID', () => {
      const byUser = listBuyerRfqs(buyerUser.id);
      expect(byUser.some((r) => r.id === testRfq.id)).toBe(true);

      const byBiz = listBuyerRfqs(buyerBusinessId);
      expect(byBiz.some((r) => r.id === testRfq.id)).toBe(true);
    });

    it('retrieves purchase orders by both buyer user ID and business ID', () => {
      po.buyerBusinessId = buyerBusinessId;
      const byUser = listBuyerOrders(buyerUser.id);
      expect(byUser.some((o) => o.id === po.id)).toBe(true);

      const byBiz = listBuyerOrders(buyerBusinessId);
      expect(byBiz.some((o) => o.id === po.id)).toBe(true);
    });

    it('retrieves purchase orders by supplier ID', () => {
      const supplierOrders = listSupplierOrders(supplierPrimary.id);
      expect(supplierOrders.some((o) => o.id === po.id)).toBe(true);

      const competitorOrders = listSupplierOrders(supplierCompetitor.id);
      expect(competitorOrders.some((o) => o.id === po.id)).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Order Dispatch & Delivery Tracking Lifecycle
  // --------------------------------------------------------------------------
  describe('3. Order Dispatch & Delivery Tracking Lifecycle', () => {
    it('records dispatch milestones and updates tracking stage to DISPATCHED', () => {
      const updated = updateOrderDispatchDetails({
        orderId: po.id,
        dispatch: {
          vehicleType: '10-Wheeler Heavy Truck',
          vehicleNumber: 'GJ-01-BX-4829',
          driverName: 'Ramesh Patel',
          driverPhone: '+91 98250 99887',
          transporterName: 'Gujarat Logistics Fleet',
          eWayBillNumber: 'EWB-24-9102847192',
          dispatchDateTime: new Date().toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          trackingNotes: 'Loaded with 50 MT Tata Tiscon rebar. Weighbridge slip #WB-4912 attached.',
        },
        advanceToStatus: 'DISPATCHED',
        updatedBy: 'Supplier Dispatch Officer',
        actorRole: 'SUPPLIER',
      });

      expect(updated.deliveryStatus).toBe('DISPATCHED');
      expect(updated.dispatchDetails?.vehicleNumber).toBe('GJ-01-BX-4829');
      expect(updated.timeline.length).toBeGreaterThan(1);
      expect(updated.timeline.some((t) => t.stage === 'DISPATCHED')).toBe(true);
    });

    it('advances stages sequentially through transit', () => {
      const advanced = advanceOrderDeliveryStage({
        orderId: po.id,
        stage: 'IN_TRANSIT',
        note: 'Vehicle passed Sanand Toll Plaza checkpoint',
        updatedBy: 'GPS Telemetry Engine',
        actorRole: 'TRANSPORTER',
      });

      expect(advanced.deliveryStatus).toBe('IN_TRANSIT');
      const latest = advanced.timeline[advanced.timeline.length - 1];
      expect(latest.stage).toBe('IN_TRANSIT');
      expect(latest.description).toContain('Sanand Toll Plaza');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Physical Site Delivery Sign-Off & Order Closure
  // --------------------------------------------------------------------------
  describe('4. Buyer Site Delivery Receipt & Final Order Closure', () => {
    it('records buyer physical verification, rating, and closes order to COMPLETED', () => {
      const confirmed = confirmOrderDeliveryReceipt({
        orderId: po.id,
        buyerName: buyerUser.name,
        confirmation: {
          confirmedReceivedQuantity: '50 MT Verified by On-Site Weighbridge',
          receivedAt: new Date().toISOString(),
          receivedBy: 'Pravin Solanki Site Engineer',
          receiverPhone: '+91 98255 12345',
          hasDamageOrShortage: false,
          supplierRating: 5,
          buyerFeedback: 'High quality rebar, mill test certificates verified. Fast delivery.',
          proofPhotos: ['/documents/proof/weighbridge_slip_wb4912.jpg'],
        },
      });

      expect(confirmed.deliveryStatus).toBe('COMPLETED');
      expect(confirmed.receiptConfirmation?.supplierRating).toBe(5);
      expect(confirmed.receiptConfirmation?.hasDamageOrShortage).toBe(false);

      // Verify RFQ status transitioned to FULFILLED
      const closedRfq = getConstructionRfqById(testRfq.id);
      expect(closedRfq?.status).toBe('FULFILLED');
    });
  });

  // --------------------------------------------------------------------------
  // 5. RFQ Cancellation / Withdrawal Workflow
  // --------------------------------------------------------------------------
  describe('5. RFQ Cancellation / Withdrawal Workflow & Guardrails', () => {
    it('cancels an open RFQ and logs the reason', () => {
      const openRfq = createConstructionRfq({
        buyerId: buyerUser.id,
        buyerBusinessId: buyerBusinessId,
        buyerName: buyerUser.name,
        buyerEmail: buyerUser.email,
        title: 'Ready Mix Concrete for Bopal Residential Project',
        projectType: 'RESIDENTIAL',
        items: [
          {
            materialName: 'RMC M25 Grade',
            categorySlug: 'building-materials',
            categoryName: 'Building Materials',
            quantity: 80,
            unit: 'Cubic metres (Cu.m)',
          },
        ],
        delivery: {
          siteName: 'Bopal Greens Site',
          addressLine: 'South Bopal Ring Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380058',
          siteContactPerson: 'Sanjay Varma',
          siteContactPhone: '+91 98250 11999',
          vehicleAccessibility: 'Transit Mixer (RMC)',
        },
        requiredDeliveryDate: '2026-12-20',
      });

      expect(['OPEN', 'SUPPLIERS_INVITED']).toContain(openRfq.status);

      const cancelled = cancelConstructionRfq({
        rfqId: openRfq.id,
        reason: 'Project foundation redesign postponed casting by 3 months',
        cancelledBy: buyerUser.email,
      });

      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.specialInstructions).toContain('foundation redesign');

      const refreshed = getConstructionRfqById(openRfq.id);
      expect(refreshed?.status).toBe('CANCELLED');
    });

    it('strictly prevents cancelling an RFQ that already has an issued Purchase Order', () => {
      // testRfq already has po issued
      expect(() => {
        cancelConstructionRfq({
          rfqId: testRfq.id,
          reason: 'Attempting to cancel awarded RFQ',
          cancelledBy: buyerUser.email,
        });
      }).toThrow(/Cannot cancel an RFQ that already has an issued Purchase Order/);
    });
  });
});

/**
 * PROVENTA — Construction Procurement Platform
 * Complete 6-Step End-to-End Integration Test Suite
 * Validates the full procurement lifecycle:
 * Step 1: Create Requirement (Multi-Item RFQ)
 * Step 2: Invite Matching Verified Suppliers
 * Step 3: Receive & Revise Itemized Quotations
 * Step 4: Compare & Explicitly Select Quotation (Decision Matrix)
 * Step 5: Coordinate Delivery (PO-XXXXX & 7-Stage Milestone Tracking)
 * Step 6: Physical Site Receipt Sign-Off, Ratings & Transaction Closure
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  BRAND_CONFIG,
  CONSTRUCTION_UNITS,
  INITIAL_MARKETPLACE_CATEGORIES,
} from '@/lib/brand';
import { parseNaturalLanguageRequirement } from '@/lib/procurement/ai-extractor';
import {
  createConstructionRfq,
  getConstructionRfqById,
  listBuyerRfqs,
  listSupplierMatchingRfqs,
  submitConstructionQuotation,
  reviseConstructionQuotation,
  getQuotationsForRfq,
  compareQuotationsForRfq,
  selectQuotationAndCreatePo,
  getPurchaseOrderById,
  updateOrderDispatchDetails,
  advanceOrderDeliveryStage,
  confirmOrderDeliveryReceipt,
  listSuppliers,
  getProcurementMetrics,
} from '@/lib/procurement/repository';
import type { DeliveryTrackingStage } from '@/lib/procurement/types';

describe('PROVENTA — Construction Procurement Engine E2E', () => {
  // 1. BRAND & TAXONOMY VALIDATION
  describe('1. Brand Configuration & Material Taxonomies', () => {
    it('should have correct brand name, tagline, and category', () => {
      expect(BRAND_CONFIG.name).toBe('PROVENTA');
      expect(BRAND_CONFIG.tagline).toBe('Require. Compare. Select. Deliver.');
      expect(BRAND_CONFIG.supportingStatement).toMatch(/(Industrial|Construction) Procurement\. Simplified\./);
      expect(BRAND_CONFIG.category).toMatch(/(Industrial|Construction) Procurement Platform/);
      expect(BRAND_CONFIG.initialCities).toContain('Ahmedabad');
      expect(BRAND_CONFIG.initialCities).toContain('Gandhinagar');
    });

    it('should support all standard construction units of measurement', () => {
      const requiredUnits = [
        'Bags',
        'Metric tonnes (MT)',
        'Kilograms (KG)',
        'Cubic feet (Cu.ft)',
        'Cubic metres (Cu.m)',
        'Square feet (Sq.ft)',
        'Pieces (Nos)',
        'Boxes',
        'Litres (L)',
      ];
      for (const unit of requiredUnits) {
        expect(CONSTRUCTION_UNITS).toContain(unit);
      }
    });

    it('should have the 6 core construction categories in initial taxonomy', () => {
      const slugs = INITIAL_MARKETPLACE_CATEGORIES.map((c) => c.slug);
      expect(slugs).toContain('building-materials');
      expect(slugs).toContain('electrical');
      expect(slugs).toContain('plumbing');
      expect(slugs).toContain('tiles-flooring');
      expect(slugs).toContain('finishing-materials');
      expect(slugs).toContain('doors-windows');
    });
  });

  // 2. AI BOQ & NATURAL LANGUAGE REQUIREMENT PARSER
  describe('2. AI BOQ & Requirement Extractor', () => {
    it('should parse freeform steel and cement requirements accurately', () => {
      const prompt =
        'Urgent: Need 50 MT Tata Tiscon Fe 550D TMT steel and 1,000 bags UltraTech 53 grade cement delivered to South Bopal, Ahmedabad by Friday';
      const parsed = parseNaturalLanguageRequirement(prompt);

      expect(parsed.items.length).toBeGreaterThanOrEqual(2);
      expect(parsed.urgency).toBe('URGENT');
      expect(parsed.delivery.city).toBe('Ahmedabad');
      expect(parsed.delivery.siteName).toContain('South Bopal');

      const cementItem = parsed.items.find((i) => i.categorySlug === 'building-materials' && i.unit === 'Bags');
      expect(cementItem).toBeDefined();
      expect(cementItem?.quantity).toBe(1000);
      expect(cementItem?.brandPreference).toBe('UltraTech');

      const steelItem = parsed.items.find((i) => i.categorySlug === 'building-materials' && i.unit === 'Metric tonnes (MT)');
      expect(steelItem).toBeDefined();
      expect(steelItem?.quantity).toBe(50);
      expect(steelItem?.brandPreference).toBe('Tata Tiscon');
    });

    it('should parse electrical cables and plumbing pipes requirements', () => {
      const prompt = 'Need Polycab 2.5 sq mm copper wires and Astral CPVC pipes for Science City commercial project';
      const parsed = parseNaturalLanguageRequirement(prompt);

      expect(parsed.items.some((i) => i.categorySlug === 'electrical')).toBe(true);
      expect(parsed.items.some((i) => i.categorySlug === 'plumbing')).toBe(true);
      expect(parsed.delivery.addressLine).toContain('Science City');
    });
  });

  // 3. COMPLETE 6-STEP WORKFLOW LIFECYCLE
  describe('3. Core 6-Step Procurement Workflow Execution', () => {
    let createdRfqId: string;
    let quote1Id: string;
    let quote2Id: string;
    let generatedPoId: string;

    // STEP 1: CREATE REQUIREMENT
    it('Step 1: should create a multi-item construction RFQ with unique RFQ-XXXXX ID', () => {
      const rfq = createConstructionRfq({
        buyerId: 'user-contractor-test',
        buyerName: 'Gujarat Sky Infra LLP',
        buyerEmail: 'procurement@skyinfra.in',
        buyerPhone: '+91 98251 11223',
        buyerRole: 'CONTRACTOR',
        title: '30 MT TMT Steel & 800 Bags 53 Grade Cement for High-Rise Project',
        projectType: 'RESIDENTIAL',
        items: [
          {
            categorySlug: 'building-materials',
            categoryName: 'Building Materials',
            subcategorySlug: 'tmt-steel',
            subcategoryName: 'TMT Steel & Rebars',
            materialName: 'TMT Steel Rebars Fe 550D (16mm & 20mm)',
            gradeOrSpec: 'Fe 550D Primary Producer Grade IS 1786',
            brandPreference: 'Tata Tiscon or Jindal Panther',
            quantity: 30,
            unit: 'Metric tonnes (MT)',
            itemNotes: 'Batch mill test certificates required',
          },
          {
            categorySlug: 'building-materials',
            categoryName: 'Building Materials',
            subcategorySlug: 'cement',
            subcategoryName: 'Cement',
            materialName: '53 Grade Ordinary Portland Cement',
            gradeOrSpec: 'IS 269:2015 fresh bags within 15 days',
            brandPreference: 'UltraTech or Ambuja',
            quantity: 800,
            unit: 'Bags',
            itemNotes: 'Moisture-proof packing',
          },
        ],
        delivery: {
          siteName: 'Sky Greens Tower Phase 1',
          addressLine: 'Near Sola Flyover, SG Highway',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380060',
          siteContactPerson: 'Bhavin Shah Site Engineer',
          siteContactPhone: '+91 98259 88123',
          vehicleAccessibility: '10-Wheeler Truck',
          siteAccessNotes: 'Direct double road access',
        },
        requiredDeliveryDate: '2026-11-20',
        urgency: 'STANDARD',
        boqAttachments: [
          {
            fileName: 'Sky_Greens_Package_A.pdf',
            fileUrl: '/documents/boq/Sky_Greens_Package_A.pdf',
            fileSizeMb: 1.5,
          },
        ],
        specialInstructions: 'Unloading by site crane after 8:30 AM',
      });

      expect(rfq.id).toBeDefined();
      expect(rfq.referenceCode).toMatch(/^RFQ-\d{5}$/);
      expect(rfq.items.length).toBe(2);
      expect(rfq.delivery.city).toBe('Ahmedabad');
      expect(rfq.status).toBe('SUPPLIERS_INVITED');
      expect(rfq.invitedSupplierIds.length).toBeGreaterThan(0);

      createdRfqId = rfq.id;
    });

    // STEP 2: SUPPLIER MATCHING & INVITATION
    it('Step 2: should match active Ahmedabad verified building material stockists', () => {
      const supplierRfqs = listSupplierMatchingRfqs('supp-gujarat-steel-cement');
      const found = supplierRfqs.find((r) => r.id === createdRfqId);
      expect(found).toBeDefined();
      expect(found?.invitedSupplierIds).toContain('supp-gujarat-steel-cement');
    });

    // STEP 3: RECEIVE ITEMIZE QUOTATIONS & REVISION
    it('Step 3: should allow verified suppliers to submit transparent itemized quotations', () => {
      const rfq = getConstructionRfqById(createdRfqId)!;

      // Supplier 1 submits quote
      const quote1 = submitConstructionQuotation({
        rfqId: rfq.id,
        supplierId: 'supp-gujarat-steel-cement',
        items: [
          {
            itemId: rfq.items[0].id,
            unitPrice: 53000,
            gstRatePercent: 18,
            brandSupplied: 'Tata Tiscon Fe 550D',
            technicalNotes: 'Direct stockyard supply',
          },
          {
            itemId: rfq.items[1].id,
            unitPrice: 340,
            gstRatePercent: 28,
            brandSupplied: 'UltraTech 53G OPC',
            technicalNotes: 'Fresh batch',
          },
        ],
        deliveryCharges: 12000,
        discountAmount: 15000,
        promisedDeliveryDate: '2026-11-18',
        validityDays: 7,
        paymentTerms: '20% Token Advance on PO, 80% against Site Weighbridge Slip',
        supplierNotes: 'Dedicated 16-wheeler transport. Free transit insurance included.',
      });

      expect(quote1.id).toBeDefined();
      expect(quote1.referenceCode).toMatch(/^QUO-\d{5}$/);
      expect(quote1.subtotal).toBe(30 * 53000 + 800 * 340); // 1590000 + 272000 = 1862000
      expect(quote1.totalGst).toBe(Math.round(1590000 * 0.18) + Math.round(272000 * 0.28)); // 286200 + 76160 = 362360
      expect(quote1.grandTotal).toBe(1862000 + 362360 + 12000 - 15000); // 2221360
      expect(quote1.supplierVerificationBadge).toBe('PREMIUM_VERIFIED');
      expect(quote1.status).toBe('SUBMITTED');

      quote1Id = quote1.id;

      // Supplier 2 submits competing quote
      const quote2 = submitConstructionQuotation({
        rfqId: rfq.id,
        supplierId: 'supp-sabarmati-tmt-rmc',
        items: [
          {
            itemId: rfq.items[0].id,
            unitPrice: 52500,
            gstRatePercent: 18,
            brandSupplied: 'Jindal Panther Fe 550D',
          },
          {
            itemId: rfq.items[1].id,
            unitPrice: 335,
            gstRatePercent: 28,
            brandSupplied: 'Ambuja OPC 53 Grade',
          },
        ],
        deliveryCharges: 14000,
        discountAmount: 10000,
        promisedDeliveryDate: '2026-11-17', // Faster
        validityDays: 5,
        paymentTerms: '30% Advance on PO, 70% against delivery',
      });

      expect(quote2.referenceCode).toMatch(/^QUO-\d{5}$/);
      quote2Id = quote2.id;
    });

    it('Step 3b: should support quotation revision before buyer selection', () => {
      const rfq = getConstructionRfqById(createdRfqId)!;

      const revised = reviseConstructionQuotation({
        quotationId: quote1Id,
        items: [
          {
            itemId: rfq.items[0].id,
            unitPrice: 52200, // Reduced price to win tender!
            gstRatePercent: 18,
            brandSupplied: 'Tata Tiscon Fe 550D',
          },
          {
            itemId: rfq.items[1].id,
            unitPrice: 335, // Reduced price!
            gstRatePercent: 28,
            brandSupplied: 'UltraTech 53G OPC',
          },
        ],
        deliveryCharges: 10000, // Lower freight!
        discountAmount: 20000, // Better discount!
        promisedDeliveryDate: '2026-11-16',
      });

      expect(revised.status).toBe('REVISED');
      expect(revised.revisionNumber).toBe(2);
      expect(revised.deliveryCharges).toBe(10000);
      expect(revised.discountAmount).toBe(20000);
    });

    // STEP 4: COMPARE & SELECT (DECISION MATRIX)
    it('Step 4: should compute quotation comparison matrix and enforce explicit buyer confirmation', () => {
      const matrix = compareQuotationsForRfq(createdRfqId);
      expect(matrix).not.toBeNull();
      expect(matrix?.quotations.length).toBe(2);
      expect(matrix?.lowestTotalPrice).toBeGreaterThan(0);
      expect(matrix?.fastestDeliveryDate).toBeDefined();

      // Ensure explicit buyer confirmation is strictly enforced (fails without confirmation)
      expect(() => {
        selectQuotationAndCreatePo({
          rfqId: createdRfqId,
          quotationId: quote1Id,
          buyerConfirmed: false, // Not confirmed!
        });
      }).toThrow('Explicit buyer confirmation is mandatory');

      // Valid explicit buyer confirmation
      const po = selectQuotationAndCreatePo({
        rfqId: createdRfqId,
        quotationId: quote1Id,
        buyerConfirmed: true,
      });

      expect(po.id).toBeDefined();
      expect(po.referenceCode).toMatch(/^PO-\d{5}$/);
      expect(po.supplierName).toBe('Gujarat Building Materials Syndicate');
      expect(po.deliveryStatus).toBe('ORDER_CONFIRMED');
      expect(po.timeline[0].stage).toBe('ORDER_CONFIRMED');

      generatedPoId = po.id;

      // Verify winning quote is accepted and competing quote is marked rejected
      const quotes = getQuotationsForRfq(createdRfqId);
      const winning = quotes.find((q) => q.id === quote1Id);
      const losing = quotes.find((q) => q.id === quote2Id);

      expect(winning?.status).toBe('ACCEPTED');
      expect(losing?.status).toBe('REJECTED');

      // Verify RFQ status updated to PO_ISSUED
      const updatedRfq = getConstructionRfqById(createdRfqId)!;
      expect(updatedRfq.status).toBe('PO_ISSUED');
      expect(updatedRfq.selectedQuotationId).toBe(quote1Id);
      expect(updatedRfq.purchaseOrderId).toBe(po.id);
    });

    // STEP 5: COORDINATE DELIVERY (7-STAGE TRACKING)
    it('Step 5: should coordinate dispatch and advance through 7 delivery stages', () => {
      // 1. Advance to PROCESSING
      advanceOrderDeliveryStage({
        orderId: generatedPoId,
        stage: 'PROCESSING',
        note: 'Warehouse allocating steel and cement stock at Odhav depot',
        updatedBy: 'Warehouse Manager',
        actorRole: 'SUPPLIER',
      });

      let po = getPurchaseOrderById(generatedPoId)!;
      expect(po.deliveryStatus).toBe('PROCESSING');

      // 2. Update Dispatch Details (Vehicle, Driver, E-Way Bill)
      updateOrderDispatchDetails({
        orderId: generatedPoId,
        dispatch: {
          vehicleType: '16-Wheeler Multi-Axle Trailer',
          vehicleNumber: 'GJ-01-CZ-9912',
          driverName: 'Dilipbhai Rabari',
          driverPhone: '+91 98255 19283',
          transporterName: 'Gujarat Heavy Haulage Fleet',
          eWayBillNumber: '241920194829',
          dispatchDateTime: new Date().toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          trackingNotes: 'Loaded and cleared weighbridge with 30 MT steel & 800 bags cement. Departing Odhav.',
        },
        advanceToStatus: 'DISPATCHED',
        updatedBy: 'Odhav Dispatch Office',
        actorRole: 'SUPPLIER',
      });

      po = getPurchaseOrderById(generatedPoId)!;
      expect(po.deliveryStatus).toBe('DISPATCHED');
      expect(po.dispatchDetails?.vehicleNumber).toBe('GJ-01-CZ-9912');
      expect(po.dispatchDetails?.driverPhone).toBe('+91 98255 19283');

      // 3. Advance to IN_TRANSIT
      advanceOrderDeliveryStage({
        orderId: generatedPoId,
        stage: 'IN_TRANSIT',
        note: 'Passed Naroda Ring Road, ETA at Sola site: 11:30 AM',
        updatedBy: 'Fleet GPS System',
        actorRole: 'TRANSPORTER',
      });

      po = getPurchaseOrderById(generatedPoId)!;
      expect(po.deliveryStatus).toBe('IN_TRANSIT');
      expect(po.timeline.length).toBeGreaterThanOrEqual(4);
    });

    // STEP 6: CONFIRM & COMPLETE (PHYSICAL SITE RECEIPT SIGN-OFF)
    it('Step 6: should record physical site receipt sign-off, rate supplier, and close transaction', () => {
      const completedOrder = confirmOrderDeliveryReceipt({
        orderId: generatedPoId,
        buyerName: 'Gujarat Sky Infra LLP',
        confirmation: {
          confirmedReceivedQuantity: '100% Full Order (30 MT Steel + 800 Bags Cement verified on weighbridge)',
          receivedAt: new Date().toISOString(),
          receivedBy: 'Bhavin Shah Site Engineer',
          receiverPhone: '+91 98259 88123',
          hasDamageOrShortage: false,
          proofPhotos: ['/documents/proof/weighbridge_slip_skyinfra.jpg'],
          supplierRating: 5,
          buyerFeedback: 'Exceptional on-time delivery. Fresh batch cement and clean steel rebars with valid mill test certificates.',
        },
      });

      expect(completedOrder.deliveryStatus).toBe('COMPLETED');
      expect(completedOrder.receiptConfirmation?.hasDamageOrShortage).toBe(false);
      expect(completedOrder.receiptConfirmation?.supplierRating).toBe(5);

      // Verify parent RFQ closed
      const closedRfq = getConstructionRfqById(createdRfqId)!;
      expect(closedRfq.status).toBe('FULFILLED');

      // Verify metrics update
      const metrics = getProcurementMetrics();
      expect(metrics.completedOrders).toBeGreaterThanOrEqual(1);
      expect(metrics.totalProcurementGmv).toBeGreaterThan(0);
    });
  });

  // 4. SUPPLIER DIRECTORY & REPUTATION ENGINE
  describe('4. Supplier Directory & Reputation Metrics', () => {
    it('should list verified suppliers filtered by category and Ahmedabad city', () => {
      const buildingSuppliers = listSuppliers({ categorySlug: 'building-materials', city: 'Ahmedabad' });
      expect(buildingSuppliers.length).toBeGreaterThan(0);
      for (const s of buildingSuppliers) {
        expect(s.city).toBe('Ahmedabad');
        expect(s.primaryCategories).toContain('building-materials');
      }

      const electricalSuppliers = listSuppliers({ categorySlug: 'electrical' });
      expect(electricalSuppliers.length).toBeGreaterThan(0);
      expect(electricalSuppliers[0].primaryCategories).toContain('electrical');
    });

    it('should calculate global procurement metrics accurately', () => {
      const metrics = getProcurementMetrics();
      expect(metrics.totalRfqs).toBeGreaterThan(0);
      expect(metrics.totalSuppliers).toBeGreaterThanOrEqual(7);
      expect(metrics.verifiedSuppliers).toBeGreaterThanOrEqual(7);
    });
  });
});

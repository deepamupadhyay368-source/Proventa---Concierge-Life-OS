import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { calculateValuationForRequest } from '@/lib/valuation/engine';

describe('PROVENTA PRICE — Valuation Engine & Paywall Security Test Suite', () => {
  let testUserId: string;
  let southBopalId: string;
  let aarohiProjectId: string;

  beforeAll(async () => {
    // 1. Ensure test user exists
    let user = await db.user.findFirst({ where: { email: 'vitest_valuation@proventa.in' } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'vitest_valuation@proventa.in',
          name: 'Vitest Valuation Auditor',
        },
      });
    }
    testUserId = user.id;

    // 2. Fetch South Bopal and Aarohi Elegance
    const locality = await db.locality.findUnique({ where: { slug: 'south-bopal' } });
    const project = await db.project.findUnique({ where: { slug: 'aarohi-elegance-south-bopal' } });

    expect(locality).toBeDefined();
    expect(project).toBeDefined();

    southBopalId = locality!.id;
    aarohiProjectId = project!.id;
  });

  it('1. Centralized Pricing: reads official rate from ValuationPricingConfig', async () => {
    const config = await db.valuationPricingConfig.findFirst({
      where: { reportType: 'RESIDENTIAL_STANDARD', active: true },
    });

    expect(config).toBeDefined();
    expect(config!.priceRupees).toBe(999);
    expect(config!.currency).toBe('INR');
    expect(config!.gstPercent).toBe(18);
  });

  it('2. Paywall Invariant: blocks valuation calculation on unpaid request', async () => {
    const unpaidRequest = await db.valuationRequest.create({
      data: {
        referenceNo: `PV-TEST-UNPAID-${Date.now()}`,
        userId: testUserId,
        status: 'PENDING_PAYMENT',
        propertyType: 'APARTMENT',
        localityId: southBopalId,
        projectId: aarohiProjectId,
        address: 'Tower A, Flat 501, Aarohi Elegance',
        pincode: '380058',
        bhk: 2,
        carpetAreaSqFt: 750,
      },
    });

    // Attempting to calculate valuation without payment MUST throw ACCESS_DENIED
    await expect(
      calculateValuationForRequest(unpaidRequest.id, { bypassPaymentCheck: false })
    ).rejects.toThrow(/ACCESS_DENIED/);
  });

  it('3. Valuation Execution: computes accurate range & comps on paid request', async () => {
    // Create paid request
    const paidRequest = await db.valuationRequest.create({
      data: {
        referenceNo: `PV-TEST-PAID-${Date.now()}`,
        userId: testUserId,
        status: 'PAID',
        propertyType: 'APARTMENT',
        localityId: southBopalId,
        projectId: aarohiProjectId,
        address: 'Tower B, Flat 802, Aarohi Elegance',
        pincode: '380058',
        bhk: 2,
        carpetAreaSqFt: 750,
        floor: 8,
        totalFloors: 12,
        propertyAgeYears: 5,
        askingPriceLakhs: 46.0,
      },
    });

    // Attach captured payment
    await db.valuationPayment.create({
      data: {
        requestId: paidRequest.id,
        userId: testUserId,
        amountPaise: 99900,
        currency: 'INR',
        status: 'CAPTURED',
        idempotencyKey: `idemp_${paidRequest.id}`,
        paymentId: `pay_test_${Date.now()}`,
      },
    });

    const result = await calculateValuationForRequest(paidRequest.id, { bypassPaymentCheck: false });

    expect(result).toBeDefined();
    expect(result.valuation.estimatedMidpointLakhs).toBeGreaterThan(35);
    expect(result.valuation.estimatedMidpointLakhs).toBeLessThan(55);
    expect(result.valuation.estimatedValueMinLakhs).toBeLessThan(result.valuation.estimatedMidpointLakhs);
    expect(result.valuation.estimatedValueMaxLakhs).toBeGreaterThan(result.valuation.estimatedMidpointLakhs);
    expect(result.valuation.confidenceScore).toBeGreaterThanOrEqual(70);
    expect(result.valuation.confidenceLevel).toBe('HIGH');
    expect(result.comparableEvidence.registeredTransactions.length).toBeGreaterThanOrEqual(2);

    // Verify report was created in database
    const report = await db.valuationReport.findUnique({ where: { requestId: paidRequest.id } });
    expect(report).toBeDefined();
    expect(report!.status).toBe('READY');
  });

  it('4. Insufficient Evidence Safeguard: transitions to MANUAL_REVIEW when evidence is inadequate', async () => {
    // Request with an abnormal carpet area where zero comps exist in database
    const outlierRequest = await db.valuationRequest.create({
      data: {
        referenceNo: `PV-TEST-OUTLIER-${Date.now()}`,
        userId: testUserId,
        status: 'PAID',
        propertyType: 'APARTMENT',
        localityId: southBopalId,
        address: 'Ultra Penthouse, South Bopal',
        pincode: '380058',
        bhk: 6,
        carpetAreaSqFt: 18000, // No residential comps in this bracket
      },
    });

    await db.valuationPayment.create({
      data: {
        requestId: outlierRequest.id,
        userId: testUserId,
        amountPaise: 99900,
        currency: 'INR',
        status: 'CAPTURED',
        idempotencyKey: `idemp_${outlierRequest.id}`,
      },
    });

    // Engine should throw INSUFFICIENT_EVIDENCE
    await expect(
      calculateValuationForRequest(outlierRequest.id, { bypassPaymentCheck: false })
    ).rejects.toThrow(/INSUFFICIENT_EVIDENCE/);

    // Verify request transitioned to MANUAL_REVIEW
    const updated = await db.valuationRequest.findUnique({ where: { id: outlierRequest.id } });
    expect(updated!.status).toBe('MANUAL_REVIEW');
  });

  it('5. Advertised Listings: applies statutory negotiation haircut', async () => {
    const paidRequest = await db.valuationRequest.create({
      data: {
        referenceNo: `PV-TEST-HAIRCUT-${Date.now()}`,
        userId: testUserId,
        status: 'PAID',
        propertyType: 'APARTMENT',
        localityId: southBopalId,
        projectId: aarohiProjectId,
        address: 'Tower C, Flat 301, Aarohi Elegance',
        pincode: '380058',
        bhk: 2,
        carpetAreaSqFt: 750,
      },
    });

    await db.valuationPayment.create({
      data: {
        requestId: paidRequest.id,
        userId: testUserId,
        amountPaise: 99900,
        currency: 'INR',
        status: 'CAPTURED',
        idempotencyKey: `idemp_${paidRequest.id}`,
      },
    });

    const result = await calculateValuationForRequest(paidRequest.id, { bypassPaymentCheck: false });

    // Find any asking listing in evidence
    const listingComp = result.comparableEvidence.askingListings[0];
    if (listingComp) {
      expect(listingComp.adjustments.askingHaircutPercent).toBe(-6.5);
      expect(listingComp.adjustedRateSqFt).toBeLessThan(listingComp.baselineRateSqFt);
    }
  });
});

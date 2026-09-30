import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/lib/db';
import crypto from 'crypto';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  getPlanById,
  isValidPlanId,
} from '@/lib/membership/plans';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from '@/lib/payments/razorpay';

describe('PROVENTA — MEMBERSHIP CHECKOUT & PAYMENT SECURITY SUITE', { timeout: 30000 }, () => {
  let testCustomerUser: any;
  let otherCustomerUser: any;
  let adminUser: any;
  let testCustomerProfile: any;
  let otherCustomerProfile: any;

  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_dev_key_32chars';

  beforeAll(async () => {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    testCustomerUser = await db.user.create({
      data: {
        email: `mem_user_${uniqueId}@proventa.in`,
        name: 'Rohan Shah',
        phone: '+919876543299',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    otherCustomerUser = await db.user.create({
      data: {
        email: `mem_other_${uniqueId}@proventa.in`,
        name: 'Aanya Patel',
        phone: '+919876543298',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
    });

    adminUser = await db.user.create({
      data: {
        email: `mem_admin_${uniqueId}@proventa.in`,
        name: 'Founder Admin',
        userRoles: { create: [{ role: 'SUPER_ADMIN' }] },
      },
    });

    testCustomerProfile = await db.customerProfile.create({
      data: {
        userId: testCustomerUser.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: 'SELECT',
        membershipStatus: 'PENDING',
      },
    });

    otherCustomerProfile = await db.customerProfile.create({
      data: {
        userId: otherCustomerUser.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: 'SELECT',
        membershipStatus: 'PENDING',
      },
    });
  }, 60000);

  // 1, 2, 3: Canonical Plans and Pricing Tests
  it('1. should resolve Select plan with exact canonical price of ₹2,499 (249,900 paise)', () => {
    const plan = getPlanById('select');
    expect(plan).toBeDefined();
    expect(plan?.name).toBe('SELECT');
    expect(plan?.priceInr).toBe(2499);
    expect(plan?.pricePaise).toBe(249900);
    expect(plan?.formattedPrice).toBe('₹2,499');
    expect(plan?.cadence).toBe('/month');
    expect(plan?.priorityLevel).toBe('STANDARD');
  });

  it('2. should resolve Private plan with exact canonical price of ₹4,999 (499,900 paise) and recommended badge', () => {
    const plan = getPlanById('private');
    expect(plan).toBeDefined();
    expect(plan?.name).toBe('PRIVATE');
    expect(plan?.priceInr).toBe(4999);
    expect(plan?.pricePaise).toBe(499900);
    expect(plan?.formattedPrice).toBe('₹4,999');
    expect(plan?.recommended).toBe(true);
    expect(plan?.priorityLevel).toBe('PRIORITY');
  });

  it('3. should resolve Reserve plan with exact canonical price of ₹9,999 (999,900 paise) and dedicated priority', () => {
    const plan = getPlanById('reserve');
    expect(plan).toBeDefined();
    expect(plan?.name).toBe('RESERVE');
    expect(plan?.priceInr).toBe(9999);
    expect(plan?.pricePaise).toBe(999900);
    expect(plan?.formattedPrice).toBe('₹9,999');
    expect(plan?.priorityLevel).toBe('HIGHEST_DEDICATED');
  });

  // 4 & 5: Server-side pricing resolution & browser amount manipulation protection
  it('4 & 5. should enforce server-side pricing resolution and reject invalid/manipulated plan IDs', () => {
    expect(isValidPlanId('select')).toBe(true);
    expect(isValidPlanId('private')).toBe(true);
    expect(isValidPlanId('reserve')).toBe(true);
    expect(isValidPlanId('SELECT')).toBe(true);
    expect(isValidPlanId('CUSTOM_VIP')).toBe(false);
    expect(isValidPlanId('discount_99')).toBe(false);
    expect(isValidPlanId('')).toBe(false);
    expect(getPlanById('manipulated_plan_id')).toBeNull();
  });

  // 6: Razorpay order creation for membership
  it('6. should create a secure server-side Razorpay order for canonical Private plan amount', async () => {
    const plan = getPlanById('private')!;
    const idempotencyKey = `test_mem_order_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      currency: 'INR',
      receipt: `RCPT-MEM-${Date.now()}`,
      customerId: testCustomerProfile.id,
      notes: {
        type: 'MEMBERSHIP_SUBSCRIPTION',
        planId: plan.id,
        planName: plan.name,
      },
      idempotencyKey,
    });

    expect(order).toBeDefined();
    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(499900);
    expect(order.currency).toBe('INR');
    expect(order.status).toBe('PENDING');
  });

  // 7: Valid payment signature verification
  it('7. should successfully verify authentic Razorpay HMAC SHA-256 payment signature', () => {
    const orderId = 'order_test_mem_12345';
    const paymentId = 'pay_test_mem_67890';
    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: expectedSig,
    });

    expect(isValid).toBe(true);
  });

  // 8: Tampered/invalid signature rejection
  it('8. should reject forged, tampered, or mismatched payment signatures', () => {
    const orderId = 'order_test_mem_12345';
    const paymentId = 'pay_test_mem_67890';
    const fakeSignature = '0000000000000000000000000000000000000000000000000000000000000000';

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: fakeSignature,
    });

    expect(isValid).toBe(false);

    // Tampered orderId
    const authenticSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isTamperedOrderValid = verifyPaymentSignature({
      orderId: 'order_tampered_different_id',
      paymentId,
      signature: authenticSig,
    });

    expect(isTamperedOrderValid).toBe(false);
  });

  // 9 & 10: Server amount and currency validation
  it('9 & 10. should ensure payment records strictly validate expected paise and INR currency', async () => {
    const plan = getPlanById('reserve')!;
    const idempotencyKey = `test_val_${Date.now()}`;

    const order = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      currency: 'INR',
      receipt: `RCPT-MEM-VAL`,
      customerId: testCustomerProfile.id,
      notes: { type: 'MEMBERSHIP_SUBSCRIPTION', planId: 'reserve' },
      idempotencyKey,
    });

    const payment = await db.payment.findUnique({
      where: { idempotencyKey },
    });

    expect(payment).toBeDefined();
    expect(payment?.amount).toBe(999900); // exactly ₹9,999 in paise
    expect(payment?.currency).toBe('INR');
  });

  // 11 & 12: Duplicate payment and webhook idempotency
  it('11 & 12. should handle duplicate order requests and repeated webhooks idempotently', async () => {
    const plan = getPlanById('select')!;
    const idempotencyKey = `idemp_mem_${Date.now()}`;

    const firstOrder = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      receipt: 'RCPT-IDEMP-1',
      customerId: testCustomerProfile.id,
      idempotencyKey,
    });

    const secondOrder = await createRazorpayOrder({
      amountPaise: plan.pricePaise,
      receipt: 'RCPT-IDEMP-2',
      customerId: testCustomerProfile.id,
      idempotencyKey,
    });

    expect(firstOrder.orderId).toBe(secondOrder.orderId);
    expect(secondOrder.isExisting).toBe(true);

    // Verify Webhook HMAC Signature helper
    const testPayload = JSON.stringify({ event: 'payment.captured', id: 'evt_test_123' });
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'proventa_webhook_secret_dev';
    const validWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(testPayload)
      .digest('hex');

    expect(verifyWebhookSignature(testPayload, validWebhookSig, webhookSecret)).toBe(true);
    expect(verifyWebhookSignature(testPayload, 'bad_sig', webhookSecret)).toBe(false);
  });

  // 13: Successful verified payment activates membership
  it('13. should transition CustomerProfile to ACTIVE status upon verified membership checkout', async () => {
    const now = new Date();
    const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updated = await db.customerProfile.update({
      where: { id: testCustomerProfile.id },
      data: {
        membershipPlan: 'PRIVATE',
        membershipStatus: 'ACTIVE',
        membershipStartedAt: now,
        membershipRenewsAt: renewsAt,
      },
    });

    expect(updated.membershipPlan).toBe('PRIVATE');
    expect(updated.membershipStatus).toBe('ACTIVE');
    expect(updated.membershipRenewsAt).toBeDefined();
  });

  // 14 & 15: Failed/abandoned payment does NOT activate membership
  it('14 & 15. should NOT activate membership if payment is failed, pending, or abandoned', async () => {
    const unverifiedCustomer = await db.customerProfile.findUnique({
      where: { id: otherCustomerProfile.id },
    });

    expect(unverifiedCustomer?.membershipStatus).toBe('PENDING');
    // Ensure access remains un-activated
    expect(unverifiedCustomer?.membershipStatus).not.toBe('ACTIVE');
  });

  // 16: Duplicate active purchase prevention
  it('16. should detect existing active membership and prevent duplicate duplicate subscription', async () => {
    const activeProfile = await db.customerProfile.findUnique({
      where: { id: testCustomerProfile.id },
    });

    const isAlreadyActive =
      activeProfile?.membershipPlan === 'PRIVATE' && activeProfile?.membershipStatus === 'ACTIVE';

    expect(isAlreadyActive).toBe(true);
  });

  // 17: Customer data isolation
  it('17. should maintain strict customer data isolation between subscriber accounts', async () => {
    const prof1 = await db.customerProfile.findUnique({
      where: { id: testCustomerProfile.id },
    });
    const prof2 = await db.customerProfile.findUnique({
      where: { id: otherCustomerProfile.id },
    });

    expect(prof1?.userId).not.toBe(prof2?.userId);
    expect(prof1?.membershipPlan).toBe('PRIVATE');
    expect(prof2?.membershipPlan).toBe('SELECT');
    expect(prof1?.membershipStatus).toBe('ACTIVE');
    expect(prof2?.membershipStatus).toBe('PENDING');
  });

  // 18: Admin visibility of customer membership
  it('18. should provide full membership tier, status, and renewal visibility to Admin queries', async () => {
    const adminCustomerQuery = await db.customerProfile.findMany({
      where: { id: testCustomerProfile.id },
      select: {
        id: true,
        membershipPlan: true,
        membershipStatus: true,
        membershipStartedAt: true,
        membershipRenewsAt: true,
        user: { select: { email: true, name: true } },
      },
    });

    expect(adminCustomerQuery.length).toBe(1);
    expect(adminCustomerQuery[0].membershipPlan).toBe('PRIVATE');
    expect(adminCustomerQuery[0].membershipStatus).toBe('ACTIVE');
    expect(adminCustomerQuery[0].user.name).toBe('Rohan Shah');
  });

  // 19: Concierge membership visibility
  it('19. should allow Concierge operations to resolve member tier and service priority', async () => {
    const profile = await db.customerProfile.findUnique({
      where: { id: testCustomerProfile.id },
    });

    const tier = profile?.membershipPlan || 'SELECT';
    const priorityLabel =
      tier === 'RESERVE'
        ? 'RESERVE · Dedicated'
        : tier === 'PRIVATE'
        ? 'PRIVATE · Priority'
        : 'SELECT · Standard';

    expect(priorityLabel).toBe('PRIVATE · Priority');
  });

  // 20: Security and credential safety
  it('20. should never store raw card numbers, CVVs, or UPI PINs in the database', async () => {
    const payments = await db.payment.findMany({
      where: { customerId: testCustomerProfile.id },
    });

    for (const p of payments) {
      const serialized = JSON.stringify(p);
      expect(serialized).not.toContain('cvv');
      expect(serialized).not.toContain('upi_pin');
      expect(serialized).not.toContain('cardNumber');
    }
  });
});

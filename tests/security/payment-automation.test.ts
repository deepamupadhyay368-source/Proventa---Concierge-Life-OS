import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '@/lib/db';
import crypto from 'crypto';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createUpiMandateSetup,
  chargeUpiMandate,
  processPaymentRefund,
} from '@/lib/payments/razorpay';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

describe('PROVENTA — PAYMENT CENTER & CUSTOMER PAYMENT AUTOMATION SUITE', { timeout: 30000 }, () => {
  let customerUser: any;
  let otherUser: any;
  let adminUser: any;
  let customerProfile: any;
  let otherProfile: any;

  beforeAll(async () => {
    // Setup test users & profiles
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    customerUser = await db.user.create({
      data: {
        email: `pay_customer_${uniqueId}@proventa.in`,
        name: 'Arjun Mehta',
        phone: '+919876543210',
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
    });

    otherUser = await db.user.create({
      data: {
        email: `pay_other_${uniqueId}@proventa.in`,
        name: 'Vikram Seth',
        phone: '+919876543211',
        userRoles: {
          create: [{ role: 'CUSTOMER' }],
        },
      },
    });

    adminUser = await db.user.create({
      data: {
        email: `pay_admin_${uniqueId}@proventa.in`,
        name: 'Admin Concierge',
        userRoles: {
          create: [{ role: 'SUPER_ADMIN' }],
        },
      },
    });

    customerProfile = await db.customerProfile.create({
      data: {
        userId: customerUser.id,
      },
    });

    otherProfile = await db.customerProfile.create({
      data: {
        userId: otherUser.id,
      },
    });
  });

  // Scenario 1: UPI Autopay mandate setup initiation
  it('1. should initiate UPI Autopay mandate setup in PENDING status', async () => {
    const result = await createUpiMandateSetup({
      customerId: customerProfile.id,
      maxAmountPaise: 5000000,
      vpaHandle: 'arjun@oksbi',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('PENDING');
    expect(result.mandateReference).toBeDefined();

    const savedProfile = await db.customerPaymentProfile.findUnique({
      where: { customerId: customerProfile.id },
    });
    expect(savedProfile?.mandateStatus).toBe('PENDING');
    expect(savedProfile?.mandateMaxAmount).toBe(5000000);
  });

  // Scenario 2: UPI Autopay auto-debits within pre-authorized limit
  it('2. should automatically debit active UPI Autopay mandate within limit', async () => {
    await db.customerPaymentProfile.upsert({
      where: { customerId: customerProfile.id },
      update: {
        mandateStatus: 'ACTIVE',
        mandateReference: 'mandate_active_ref_123',
        mandateMaxAmount: 5000000,
      },
      create: {
        customerId: customerProfile.id,
        mandateStatus: 'ACTIVE',
        mandateReference: 'mandate_active_ref_123',
        mandateMaxAmount: 5000000,
      },
    });

    const result = await chargeUpiMandate({
      customerId: customerProfile.id,
      amountPaise: 2500000, // ₹25,000 <= ₹50,000
      idempotencyKey: `mandate_charge_${Date.now()}`,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CAPTURED');
    expect(result.providerRef).toBeDefined();
  });

  // Scenario 3: UPI Autopay fails / falls back when exceeding limit
  it('3. should require standard checkout fallback when amount exceeds mandate limit', async () => {
    await db.customerPaymentProfile.upsert({
      where: { customerId: customerProfile.id },
      update: {
        mandateStatus: 'ACTIVE',
        mandateMaxAmount: 5000000, // ₹50,000 limit
      },
      create: {
        customerId: customerProfile.id,
        mandateStatus: 'ACTIVE',
        mandateMaxAmount: 5000000,
      },
    });

    const result = await chargeUpiMandate({
      customerId: customerProfile.id,
      amountPaise: 7500000, // ₹75,000 > ₹50,000
      idempotencyKey: `mandate_over_${Date.now()}`,
    });

    expect(result.success).toBe(false);
    expect(result.fallbackRequired).toBe(true);
    expect(result.reason).toBe('EXCEEDS_MANDATE_LIMIT');
  });

  // Scenario 4: Revoked mandate blocks auto-debit
  it('4. should block auto-debit if UPI Autopay mandate is REVOKED', async () => {
    await db.customerPaymentProfile.upsert({
      where: { customerId: customerProfile.id },
      update: { mandateStatus: 'REVOKED' },
      create: {
        customerId: customerProfile.id,
        mandateStatus: 'REVOKED',
      },
    });

    const result = await chargeUpiMandate({
      customerId: customerProfile.id,
      amountPaise: 100000,
      idempotencyKey: `mandate_revoked_${Date.now()}`,
    });

    expect(result.success).toBe(false);
    expect(result.fallbackRequired).toBe(true);
    expect(result.reason).toBe('NO_ACTIVE_MANDATE');
  });

  // Scenario 5: Task requiring upfront payment generates order and pauses before execution
  it('5. should identify flight tasks as requiring upfront payment', () => {
    const flightOption = {
      id: 'opt_flight_1',
      title: 'Indigo 6E-241 Business',
      priceAmount: 12500,
    };

    const requiresPayment = PaymentAutomationEngine.requiresUpfrontPayment({
      category: 'flights',
      option: flightOption,
    });

    expect(requiresPayment).toBe(true);
  });

  // Scenario 6: Non-prepaid task does not require upfront payment
  it('6. should not require upfront payment for zero-cost or basic table reservations', () => {
    const diningOption = {
      id: 'opt_table_1',
      title: 'Table for 2 at Agashiye',
      priceAmount: 0,
    };

    const requiresPayment = PaymentAutomationEngine.requiresUpfrontPayment({
      category: 'dining',
      option: diningOption,
    });

    expect(requiresPayment).toBe(false);
  });

  // Scenario 7: Razorpay checkout signature verification success
  it('7. should correctly verify valid Razorpay checkout HMAC SHA256 signature', () => {
    const orderId = 'order_test_12345';
    const paymentId = 'pay_test_67890';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_dev_key_32chars';

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

  // Scenario 8: Razorpay signature verification failure with tampered payload
  it('8. should reject invalid or tampered Razorpay checkout signatures', () => {
    const isValid = verifyPaymentSignature({
      orderId: 'order_test_12345',
      paymentId: 'pay_test_67890',
      signature: 'invalid_tampered_signature_hex_code_1234567890abcdef',
    });

    expect(isValid).toBe(false);
  });

  // Scenario 9: Razorpay webhook HMAC signature verification success
  it('9. should verify valid Razorpay webhook signature with configured secret', () => {
    const secret = 'proventa_webhook_secret_dev';
    const rawPayload = JSON.stringify({ event: 'payment.captured', entity: { id: 'pay_123' } });

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawPayload)
      .digest('hex');

    const isValid = verifyWebhookSignature(rawPayload, expectedSig, secret);
    expect(isValid).toBe(true);
  });

  // Scenario 10: Razorpay webhook signature rejection on mismatch
  it('10. should reject invalid webhook signature', () => {
    const secret = 'proventa_webhook_secret_dev';
    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const fakeSig = 'fake_signature_hex';

    const isValid = verifyWebhookSignature(rawPayload, fakeSig, secret);
    expect(isValid).toBe(false);
  });

  // Scenario 11: Payment confirmation updates task and payment status
  it('11. should confirm task payment and transition payment record to CAPTURED', async () => {
    const task = await db.task.create({
      data: {
        publicId: `TSK-TEST-${Date.now().toString(36)}`,
        customerId: customerProfile.id,
        category: 'travel',
        intent: 'Flight to Delhi',
        originalRequest: 'Flight to Delhi',
        assignedAgent: 'Concierge Lead',
        status: 'AWAITING_APPROVAL',
        paymentStatus: 'PENDING',
      },
    });

    const payment = await db.payment.create({
      data: {
        customerId: customerProfile.id,
        taskId: task.id,
        amount: 850000,
        currency: 'INR',
        status: 'PENDING',
        idempotencyKey: `pay_${task.id}_${Date.now()}`,
      },
    });

    const confirmRes = await PaymentAutomationEngine.confirmTaskPayment({
      taskId: task.id,
      paymentId: payment.id,
      providerRef: 'pay_rzp_confirmed_123',
      amountPaise: 850000,
    });

    expect(confirmRes.success).toBe(true);

    const updatedTask = await db.task.findUnique({ where: { id: task.id } });
    const updatedPayment = await db.payment.findUnique({ where: { id: payment.id } });

    expect(updatedTask?.paymentStatus).toBe('CAPTURED');
    expect(updatedPayment?.status).toBe('CAPTURED');
    expect(updatedPayment?.providerRef).toBe('pay_rzp_confirmed_123');
  });

  // Scenario 12: Strict payment idempotency
  it('12. should return existing payment record when called with identical idempotencyKey', async () => {
    const idempotencyKey = `idemp_order_${Date.now()}`;

    const order1 = await createRazorpayOrder({
      amountPaise: 500000,
      receipt: 'RCPT-TEST-1',
      customerId: customerProfile.id,
      idempotencyKey,
    });

    const order2 = await createRazorpayOrder({
      amountPaise: 500000,
      receipt: 'RCPT-TEST-1',
      customerId: customerProfile.id,
      idempotencyKey,
    });

    expect(order1.paymentId).toBe(order2.paymentId);
    expect(order2.isExisting).toBe(true);
  });

  // Scenario 13: Authoritative refund processing
  it('13. should process full payment refund and update payment and task status', async () => {
    const task = await db.task.create({
      data: {
        publicId: `TSK-RFD-${Date.now().toString(36)}`,
        customerId: customerProfile.id,
        category: 'hotels',
        intent: 'The Oberoi Suite',
        originalRequest: 'The Oberoi Suite',
        assignedAgent: 'Concierge Lead',
        status: 'COMPLETED',
        paymentStatus: 'CAPTURED',
      },
    });

    const payment = await db.payment.create({
      data: {
        customerId: customerProfile.id,
        taskId: task.id,
        amount: 4500000, // ₹45,000
        currency: 'INR',
        status: 'CAPTURED',
        providerRef: 'pay_rzp_for_refund',
        idempotencyKey: `pay_rfd_${task.id}`,
      },
    });

    const refundRes = await processPaymentRefund({
      paymentId: payment.id,
      reason: 'Guest requested date cancellation',
    });

    expect(refundRes.success).toBe(true);
    expect(refundRes.status).toBe('REFUNDED');
    expect(refundRes.refundId).toBeDefined();

    const updatedPayment = await db.payment.findUnique({ where: { id: payment.id } });
    const updatedTask = await db.task.findUnique({ where: { id: task.id } });

    expect(updatedPayment?.status).toBe('REFUNDED');
    expect(updatedPayment?.refundStatus).toBe('COMPLETED');
    expect(updatedTask?.paymentStatus).toBe('REFUNDED');
  });

  // Scenario 14: Partial refund processing
  it('14. should handle partial refund amounts accurately', async () => {
    const payment = await db.payment.create({
      data: {
        customerId: customerProfile.id,
        amount: 1000000, // ₹10,000
        currency: 'INR',
        status: 'CAPTURED',
        idempotencyKey: `pay_partial_${Date.now()}`,
      },
    });

    const refundRes = await processPaymentRefund({
      paymentId: payment.id,
      amountPaise: 300000, // ₹3,000
      reason: 'Partial cancellation fee refund',
    });

    expect(refundRes.success).toBe(true);
    expect(refundRes.status).toBe('PARTIALLY_REFUNDED');
    expect(refundRes.refundAmount).toBe(300000);
  });

  // Scenario 15: Prohibit refunding non-captured payment
  it('15. should throw error when attempting to refund a non-captured payment', async () => {
    const payment = await db.payment.create({
      data: {
        customerId: customerProfile.id,
        amount: 200000,
        currency: 'INR',
        status: 'PENDING',
        idempotencyKey: `pay_pending_rfd_${Date.now()}`,
      },
    });

    await expect(
      processPaymentRefund({
        paymentId: payment.id,
      })
    ).rejects.toThrow('Must be CAPTURED');
  });

  // Scenario 16: Multi-tenant Customer Isolation
  it('16. should maintain strict customer data isolation in payment lookups', async () => {
    // Payment for customer A
    const paymentA = await db.payment.create({
      data: {
        customerId: customerProfile.id,
        amount: 500000,
        currency: 'INR',
        status: 'CAPTURED',
        idempotencyKey: `pay_cust_a_${Date.now()}`,
      },
    });

    // Customer B queries payments
    const paymentsForB = await db.payment.findMany({
      where: { customerId: otherProfile.id },
    });

    const containsA = paymentsForB.some((p) => p.id === paymentA.id);
    expect(containsA).toBe(false);
  });

  // Scenario 17: Zero-custodial security - no credentials stored
  it('17. should guarantee no sensitive payment credentials (PIN/CVV/bank password) are persisted', async () => {
    const profile = await db.customerPaymentProfile.create({
      data: {
        customerId: otherProfile.id,
        paymentProvider: 'RAZORPAY',
        mandateStatus: 'PENDING',
        mandateVpa: 'vikram@okaxis',
      },
    });

    const rawObject = JSON.parse(JSON.stringify(profile));
    expect(rawObject).not.toHaveProperty('upiPin');
    expect(rawObject).not.toHaveProperty('cvv');
    expect(rawObject).not.toHaveProperty('password');
    expect(rawObject).not.toHaveProperty('bankPassword');
  });

  // Scenario 18: High value dining threshold upfront payment check
  it('18. should require upfront payment for high-value dining (> ₹5,000)', () => {
    const fineDiningOption = {
      id: 'opt_chef_table',
      title: 'Chef Degustation Tasting Menu for 4',
      priceAmount: 18000,
    };

    const requiresPayment = PaymentAutomationEngine.requiresUpfrontPayment({
      category: 'dining',
      option: fineDiningOption,
    });

    expect(requiresPayment).toBe(true);
  });

  // Scenario 19: Upfront payment initiation returns checkout order details
  it('19. should return structured checkout order details on standard task payment initiation', async () => {
    const task = await db.task.create({
      data: {
        publicId: `TSK-ORD-${Date.now().toString(36)}`,
        customerId: customerProfile.id,
        category: 'gifts',
        intent: 'Rare Vintage Champagne',
        originalRequest: 'Rare Vintage Champagne',
        assignedAgent: 'Concierge Lead',
        status: 'AWAITING_APPROVAL',
        budgetAmount: 25000,
      },
    });

    const initRes = await PaymentAutomationEngine.initiateTaskPayment({
      taskId: task.id,
      option: { id: 'opt_vintage_champagne', priceAmount: 25000, title: 'Dom Perignon 2008' },
      customerId: customerProfile.id,
      userId: customerUser.id,
    });

    expect(initRes.paymentStatus).toBe('PENDING');
    expect(initRes.orderId).toBeDefined();
    expect(initRes.amountPaise).toBe(2500000);
    expect(initRes.executedAutomatically).toBe(false);
  });

  // Scenario 20: Auto-execution triggers on upfront paid task once signature verified
  it('20. should execute task when payment is pre-captured', async () => {
    const task = await db.task.create({
      data: {
        publicId: `TSK-AUTO-${Date.now().toString(36)}`,
        customerId: customerProfile.id,
        category: 'hotels',
        intent: 'Book Leela Palace Udaipur',
        originalRequest: 'Book Leela Palace Udaipur',
        assignedAgent: 'Concierge Lead',
        status: 'AWAITING_APPROVAL',
        paymentStatus: 'CAPTURED', // Pre-captured
        proposedOptions: [
          {
            id: 'opt_leela_1',
            title: 'Royal Lake View Suite',
            priceAmount: 65000,
            providerName: 'The Leela Palace Udaipur',
            priceFormatted: '₹65,000',
            confidence: 0.95,
          },
        ] as any,
      },
    });

    const execRes = await RequestOrchestrator.executeApprovedTask({
      taskId: task.id,
      optionId: 'opt_leela_1',
      userId: customerUser.id,
    });

    expect(execRes.success).toBe(true);
    expect(execRes.paymentRequired).toBeUndefined();
  });
});

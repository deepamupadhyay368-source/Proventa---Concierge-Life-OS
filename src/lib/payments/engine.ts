import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { createRazorpayOrder, chargeUpiMandate } from './razorpay';
import type { OptionProposal } from '@/lib/orchestration/types';

export class PaymentAutomationEngine {
  /**
   * Determines whether an approved option requires upfront customer payment
   * before external provider execution.
   */
  static requiresUpfrontPayment(params: {
    category: string;
    option: OptionProposal | any;
  }): boolean {
    const { category, option } = params;
    const cat = category.toLowerCase();
    const price = option.priceAmount || 0;

    // Categories that inherently require upfront settlement (e.g. flight tickets, gifts, prepaid bookings)
    if (price <= 0) return false;

    if (
      cat.includes('flight') ||
      cat.includes('travel') ||
      cat.includes('hotel') ||
      cat.includes('gift') ||
      cat.includes('shopping') ||
      cat.includes('experience') ||
      cat.includes('event')
    ) {
      return true;
    }

    // High value dining deposits / guarantees (e.g. > ₹5,000)
    if (cat.includes('dining') && price > 5000) {
      return true;
    }

    return false;
  }

  /**
   * Prepares or initiates payment for an approved concierge task.
   * If customer has an ACTIVE UPI Autopay mandate within limit, it auto-debits idempotently.
   * Otherwise, generates a secure checkout order.
   */
  static async initiateTaskPayment(params: {
    taskId: string;
    option: OptionProposal | any;
    customerId: string;
    userId: string;
    paymentMethod?: string;
  }) {
    const { taskId, option, customerId, userId, paymentMethod } = params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: true },
    });

    if (!task) {
      throw new Error(`[Payment Engine] Task ${taskId} not found.`);
    }

    const priceAmount = option.priceAmount || task.budgetAmount || 0;
    const amountPaise = priceAmount * 100;
    const idempotencyKey = `pay_task_${taskId}_${option.id || 'primary'}_${priceAmount}`;

    // 1. Check if UPI Autopay mandate is available and preferred
    const paymentProfile = await db.customerPaymentProfile?.findUnique?.({
      where: { customerId },
    });

    if (
      paymentProfile &&
      paymentProfile.mandateStatus === 'ACTIVE' &&
      paymentMethod !== 'STANDARD_CHECKOUT'
    ) {
      logger.info({ taskId, customerId }, '[Payment Engine] Attempting UPI Autopay mandate execution');
      const mandateResult = await chargeUpiMandate({
        customerId,
        amountPaise,
        taskId,
        approvedOptionId: option.id,
        idempotencyKey,
      });

      if (mandateResult.success) {
        // Update Task to PAYMENT_CONFIRMED
        await db.task.update({
          where: { id: taskId },
          data: {
            paymentStatus: 'CAPTURED',
            paymentId: mandateResult.paymentId,
            budgetAmount: priceAmount,
          },
        });

        await appendTaskEvent({
          taskId,
          eventType: 'PAYMENT_CONFIRMED',
          actorRole: 'SYSTEM',
          message: `Payment authorized & confirmed via UPI Autopay [Ref: ${mandateResult.providerRef}] — ₹${priceAmount.toLocaleString('en-IN')}`,
          data: {
            paymentId: mandateResult.paymentId,
            providerRef: mandateResult.providerRef,
            amount: priceAmount,
            method: 'UPI_AUTOPAY',
          },
        });

        return {
          paymentStatus: 'CAPTURED',
          paymentId: mandateResult.paymentId,
          method: 'UPI_AUTOPAY',
          executedAutomatically: true,
          message: 'Payment confirmed via UPI Autopay.',
        };
      }
    }

    // 2. Fallback to standard checkout order
    const order = await createRazorpayOrder({
      amountPaise,
      currency: option.priceCurrency || 'INR',
      receipt: `RCPT-${taskId.slice(0, 16)}`,
      notes: {
        taskId,
        customerId,
        optionTitle: option.title || 'Concierge Service',
      },
      customerId,
      taskId,
      approvedOptionId: option.id,
      idempotencyKey,
    });

    const existingPrefs = (task.clientPreferences as Record<string, any>) || {};
    await db.task.update({
      where: { id: taskId },
      data: {
        approvalStatus: 'APPROVED',
        paymentStatus: 'PENDING',
        paymentId: order.paymentId,
        budgetAmount: priceAmount,
        clientPreferences: {
          ...existingPrefs,
          approvedOption: option,
          approvedAt: new Date().toISOString(),
        },
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'PAYMENT_REQUIRED',
      actorRole: 'SYSTEM',
      message: `Payment required before booking dispatch: ₹${priceAmount.toLocaleString('en-IN')}. Secure checkout generated.`,
      data: {
        orderId: order.orderId,
        paymentId: order.paymentId,
        amount: priceAmount,
      },
    });

    return {
      paymentStatus: 'PENDING',
      paymentId: order.paymentId,
      orderId: order.orderId,
      amountPaise,
      currency: order.currency,
      keyId: order.keyId,
      executedAutomatically: false,
      message: 'Payment order generated. Awaiting customer authorization.',
    };
  }

  /**
   * Confirms payment for a task after authoritative provider webhook or verified signature.
   */
  static async confirmTaskPayment(params: {
    taskId: string;
    paymentId: string;
    providerRef: string;
    amountPaise: number;
    method?: string;
  }) {
    const { taskId, paymentId, providerRef, amountPaise, method = 'UPI' } = params;

    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`[Payment Engine] Task ${taskId} not found.`);
    }

    // Update payment record
    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CAPTURED',
        providerRef,
        method,
      },
    });

    // Update task
    await db.task.update({
      where: { id: taskId },
      data: {
        paymentStatus: 'CAPTURED',
        paymentId,
        budgetAmount: Math.round(amountPaise / 100),
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'PAYMENT_CONFIRMED',
      actorRole: 'SYSTEM',
      message: `Payment verified & confirmed [Ref: ${providerRef}] — ₹${Math.round(amountPaise / 100).toLocaleString('en-IN')}`,
      data: {
        paymentId,
        providerRef,
        amount: Math.round(amountPaise / 100),
        method,
      },
    });

    return {
      success: true,
      taskId,
      paymentId,
      status: 'CAPTURED',
    };
  }
}

/**
 * PROVENTA — PRE-EXECUTION PAYMENT AUTHORIZATION GATE
 * Enforces: AI MUST NEVER independently decide to spend customer money.
 * Paid execution requires: Customer Approval + Valid Payment Authorization + Amount within authorized limits.
 */

import { ExecutionGateResult, ExecutionPlan } from './types';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { OptionProposal } from '../types';

export class PaymentAuthorizationGate {
  /**
   * Evaluates and processes payment authorization for an approved execution plan.
   */
  static async evaluate(params: {
    taskId: string;
    taskRecord: any;
    approvedOption: OptionProposal;
    executionPlan: ExecutionPlan;
    skipPaymentGate?: boolean;
    paymentMethod?: string;
  }): Promise<ExecutionGateResult & { paymentOrder?: any; paymentCaptured?: boolean }> {
    const { taskId, taskRecord, approvedOption, executionPlan, skipPaymentGate, paymentMethod } = params;

    // 1. If no payment required or already pre-authorized/skipped
    if (!executionPlan.paymentRequired || skipPaymentGate) {
      return {
        passed: true,
        gateName: 'PAYMENT_AUTHORIZATION_GATE',
        paymentCaptured: taskRecord.paymentStatus === 'CAPTURED',
      };
    }

    // 2. If payment was already pre-captured for this task
    if (taskRecord.paymentStatus === 'CAPTURED') {
      return {
        passed: true,
        gateName: 'PAYMENT_AUTHORIZATION_GATE',
        paymentCaptured: true,
      };
    }

    // 3. Initiate or execute payment via PaymentAutomationEngine
    try {
      const customerId = taskRecord.customerId;
      const userId = taskRecord.customer?.userId || customerId;

      // Check UPI Autopay Mandate ceiling if active
      const paymentProfile = await db.customerPaymentProfile?.findUnique?.({
        where: { customerId },
      });

      if (paymentProfile && paymentProfile.mandateStatus === 'ACTIVE') {
        const ceilingPaise = paymentProfile.mandateMaxAmount || 10000000; // default 1 Lakh
        const requiredPaise = executionPlan.amount * 100;

        if (requiredPaise > ceilingPaise) {
          logger.warn(
            { taskId, amount: executionPlan.amount, ceiling: ceilingPaise / 100 },
            '[PaymentGate] Transaction amount exceeds UPI Autopay authorized ceiling'
          );

          // Amount exceeds auto-debit ceiling -> Require explicit checkout
          const checkoutOrder = await PaymentAutomationEngine.initiateTaskPayment({
            taskId,
            option: approvedOption,
            customerId,
            userId,
            paymentMethod: 'STANDARD_CHECKOUT',
          });

          return {
            passed: false,
            gateName: 'PAYMENT_AUTHORIZATION_GATE',
            reason: `Amount (₹${executionPlan.amount.toLocaleString('en-IN')}) exceeds authorized UPI Autopay limit (₹${(ceilingPaise / 100).toLocaleString('en-IN')}). Standard checkout required.`,
            errorCode: 'AMOUNT_EXCEEDS_MANDATE_LIMIT',
            paymentOrder: checkoutOrder,
            paymentCaptured: false,
          };
        }
      }

      const paymentResult = await PaymentAutomationEngine.initiateTaskPayment({
        taskId,
        option: approvedOption,
        customerId,
        userId,
        paymentMethod,
      });

      if (paymentResult.executedAutomatically) {
        return {
          passed: true,
          gateName: 'PAYMENT_AUTHORIZATION_GATE',
          paymentCaptured: true,
        };
      }

      // Upfront payment required before execution dispatch
      return {
        passed: false,
        gateName: 'PAYMENT_AUTHORIZATION_GATE',
        reason: 'Payment authorization required before booking execution.',
        errorCode: 'PAYMENT_REQUIRED',
        paymentOrder: paymentResult,
        paymentCaptured: false,
      };
    } catch (err: any) {
      logger.error({ taskId, error: err?.message }, '[PaymentGate] Payment initiation failed');
      return {
        passed: false,
        gateName: 'PAYMENT_AUTHORIZATION_GATE',
        reason: err?.message || 'Payment authorization failed.',
        errorCode: 'PAYMENT_FAILED',
        paymentCaptured: false,
      };
    }
  }
}

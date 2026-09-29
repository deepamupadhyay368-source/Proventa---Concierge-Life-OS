/**
 * PROVENTA — AI AUTONOMOUS TASK EXECUTION AGENT
 * Authoritative AI Execution Agent for Proventa Concierge Life OS.
 * Pipeline: APPROVED -> PLAN -> CAPABILITY RESOLUTION -> CONSTRAINT GATE -> PAYMENT GATE -> TOOL EXECUTION -> VERIFICATION -> COMPLETION (or Concierge Fallback)
 * Strict Zero-Fabrication • Deterministic Verification • Idempotent Folios • Bounded Retries
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ExecutionPlanner } from './execution-planner';
import { ExecutionCapabilityRegistry } from './execution-capability-registry';
import { ExecutionToolRegistry } from './tool-registry';
import { PreExecutionConstraintGate } from './constraint-gate';
import { PaymentAuthorizationGate } from './payment-gate';
import { DeterministicVerificationGate } from './verification-gate';
import {
  ExecutionAgentOutput,
  ExecutionPlan,
  ExecutionToolResult,
  ExecutionFailureCategory,
} from './types';
import { validateTransition } from '../state-machine';
import { appendTaskEvent } from '../timeline';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { sendBookingConfirmationEmail } from '@/lib/email/sender';
import type { OptionProposal, TaskStatus, ProposalBatch } from '../types';

export class AIExecutionAgent {
  private static MAX_TRANSIENT_RETRIES = 3;

  /**
   * Primary entrypoint: Executes an approved task autonomously through the verified execution pipeline.
   */
  static async executeTask(params: {
    taskId: string;
    option?: OptionProposal;
    optionId?: string;
    userId?: string;
    skipPaymentGate?: boolean;
    paymentMethod?: string;
  }): Promise<ExecutionAgentOutput> {
    const { taskId, optionId, skipPaymentGate, paymentMethod } = params;
    let option = params.option;

    // 1. Load Task & Customer
    const taskRecord = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });

    if (!taskRecord) {
      throw new Error(`[AIExecutionAgent] Task '${taskId}' not found.`);
    }

    // Check ownership if userId is provided
    if (params.userId) {
      const taskUserId = taskRecord.customer?.userId || taskRecord.customerId;
      if (taskUserId && taskUserId !== params.userId) {
        return {
          success: false,
          status: (taskRecord.status as TaskStatus) || 'OPTIONS_READY',
          handedToConcierge: false,
          message: 'Forbidden: You do not have permission to execute this task.',
        };
      }
    }

    // 2. Resolve Approved Option
    if (!option && optionId && Array.isArray(taskRecord.proposedOptions)) {
      option = (taskRecord.proposedOptions as any[]).find((o: any) => o.id === optionId);
    }
    if (!option && Array.isArray(taskRecord.proposedOptions) && taskRecord.proposedOptions.length > 0) {
      option = (taskRecord.proposedOptions as any[])[0];
    }
    if (!option && (taskRecord.clientPreferences as any)?.approvedOption) {
      option = (taskRecord.clientPreferences as any).approvedOption;
    }
    if (!option && (taskRecord.clientPreferences as any)?.selectedOption) {
      option = (taskRecord.clientPreferences as any).selectedOption;
    }
    const selectedOpt = option;
    if (selectedOpt && !selectedOpt.providerId && Array.isArray(taskRecord.proposedOptions)) {
      const storedOption = (taskRecord.proposedOptions as any[]).find(
        (o: any) => o.id === selectedOpt.id || o.title === selectedOpt.title
      );
      if (storedOption?.providerId) {
        option = { ...selectedOpt, providerId: storedOption.providerId, venueId: storedOption.venueId };
      }
    }

    if (!option) {
      return {
        success: false,
        status: (taskRecord.status as TaskStatus) || 'OPTIONS_READY',
        handedToConcierge: false,
        message: 'No approved option selected for execution.',
      };
    }

    // 3. Execution Planning (Exact locked approved option)
    const executionPlan = ExecutionPlanner.createPlan({
      taskId,
      taskRecord,
      approvedOption: option,
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_PLANNED',
      actorRole: 'AI_AGENT',
      message: `Execution planned for "${option.title}" with provider ${executionPlan.providerName}.`,
      data: { plan: executionPlan },
    });

    // 4. Check Idempotency: Has this exact execution already succeeded?
    const existingPrefs = (taskRecord.clientPreferences as Record<string, any>) || {};
    if (
      existingPrefs.executionIdempotencyKey === executionPlan.idempotencyKey &&
      taskRecord.status === 'COMPLETED' &&
      taskRecord.externalReferenceId
    ) {
      logger.info({ taskId, idempotencyKey: executionPlan.idempotencyKey }, '[AIExecutionAgent] Returning existing idempotent execution result');
      return {
        success: true,
        status: 'COMPLETED',
        executionPlan,
        confirmationReference: taskRecord.externalReferenceId,
        handedToConcierge: false,
        message: 'Execution already confirmed.',
        task: taskRecord,
      };
    }

    // 5. Pre-Execution Entity Integrity Constraint Gate
    const constraintResult = PreExecutionConstraintGate.evaluate({
      taskRecord,
      approvedOption: option,
      executionPlan,
    });

    if (!constraintResult.passed) {
      await appendTaskEvent({
        taskId,
        eventType: 'INTENT_CONSTRAINT_MISMATCH',
        actorRole: 'SYSTEM',
        message: constraintResult.reason || 'Pre-execution constraint validation mismatch.',
        data: { reason: constraintResult.reason },
      });

      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          executionMethod: 'HUMAN_CONCIERGE',
          failedReason: constraintResult.reason,
        },
      });

      return {
        success: false,
        status: 'NEEDS_HUMAN',
        executionPlan,
        handedToConcierge: true,
        failureCategory: 'CONSTRAINT_MISMATCH',
        message: constraintResult.reason || 'Constraint check failed. Handed to Proventa Concierge.',
        task: escalatedTask,
      };
    }

    // 6. Tool Selection & Capability Resolution
    const tool = ExecutionToolRegistry.resolveTool(executionPlan.providerId, executionPlan.toolName);

    await appendTaskEvent({
      taskId,
      eventType: 'TOOL_SELECTED',
      actorRole: 'AI_AGENT',
      message: `Selected execution tool: ${tool.toolName} (Provider: ${tool.providerId}, Capability: ${tool.capabilityStatus}).`,
      data: { toolName: tool.toolName, capabilityStatus: tool.capabilityStatus },
    });

    // If provider is MOCK or automated execution is disallowed, escalate immediately to Human Concierge
    if (!ExecutionCapabilityRegistry.isAutomatedExecutionAllowed(tool.providerId) || option.isMock || option.environment === 'MOCK') {
      validateTransition(taskRecord.status as TaskStatus, 'NEEDS_HUMAN');
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          approvalStatus: 'APPROVED',
          failedReason: `Provider ${tool.providerId} has capability status ${tool.capabilityStatus}; automated execution prohibited. Escaped to Human Concierge Desk.`,
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'EXECUTION_ESCALATED',
        actorRole: 'SYSTEM',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        data: { providerId: tool.providerId, capabilityStatus: tool.capabilityStatus },
      });

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        executionPlan,
        toolSelected: tool.toolName,
        handedToConcierge: true,
        failureCategory: 'PROVIDER_UNAVAILABLE',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        task: escalatedTask,
      };
    }

    // 7. Payment Authorization Gate
    const paymentResult = await PaymentAuthorizationGate.evaluate({
      taskId,
      taskRecord,
      approvedOption: option,
      executionPlan,
      skipPaymentGate,
      paymentMethod,
    });

    if (!paymentResult.passed) {
      if (paymentResult.errorCode === 'PAYMENT_REQUIRED') {
        const updatedTask = await db.task.findUnique({ where: { id: taskId } });
        return {
          success: true,
          status: (updatedTask?.status as TaskStatus) || 'APPROVED',
          executionPlan,
          paymentRequired: true,
          paymentOrder: paymentResult.paymentOrder,
          handedToConcierge: false,
          failureCategory: 'PAYMENT_FAILURE',
          message: 'Payment required before booking execution. Please complete checkout.',
          task: updatedTask || taskRecord,
        };
      }

      // Payment declined or failed
      await appendTaskEvent({
        taskId,
        eventType: 'PAYMENT_FAILED',
        actorRole: 'SYSTEM',
        message: paymentResult.reason || 'Payment authorization declined.',
      });

      return {
        success: false,
        status: (taskRecord.status as TaskStatus) || 'APPROVED',
        executionPlan,
        paymentRequired: true,
        handedToConcierge: false,
        failureCategory: 'PAYMENT_FAILURE',
        message: paymentResult.reason || 'Payment failed.',
        task: taskRecord,
      };
    }

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_AUTHORIZED',
      actorRole: 'SYSTEM',
      message: 'Execution authorized. Customer approval and payment requirements verified.',
    });

    // 8. State Transition -> EXECUTING
    validateTransition(taskRecord.status as TaskStatus, 'EXECUTING');

    const batchHistory: ProposalBatch[] = Array.isArray(existingPrefs.batchHistory) ? [...existingPrefs.batchHistory] : [];
    const updatedHistory = batchHistory.map((b) => {
      if (b.status === 'ACTIVE' || b.options.some((o) => o.id === option!.id)) {
        return { ...b, status: 'APPROVED' as const, approvedOptionId: option!.id };
      }
      return b;
    });

    await db.task.update({
      where: { id: taskId },
      data: {
        status: 'EXECUTING',
        approvalStatus: 'APPROVED',
        vendorName: option.providerName,
        budgetAmount: option.priceAmount,
        clientPreferences: {
          ...existingPrefs,
          approvedOption: option as any,
          approvedAt: new Date().toISOString(),
          batchHistory: updatedHistory,
          executionIdempotencyKey: executionPlan.idempotencyKey,
        } as any,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CUSTOMER_APPROVED',
      actorRole: 'CUSTOMER',
      message: `Client approved option: ${option.title} (${option.providerName})`,
      data: { optionId: option.id, title: option.title, providerName: option.providerName },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_STARTED',
      actorRole: 'AI_AGENT',
      message: `Executing reservation with ${option.providerName}...`,
    });

    // 9. Tool Execution with Bounded Transient Retries
    let toolResult: ExecutionToolResult | undefined;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < this.MAX_TRANSIENT_RETRIES) {
      attempt++;
      try {
        await appendTaskEvent({
          taskId,
          eventType: 'PROVIDER_REQUEST_SENT',
          actorRole: 'AI_AGENT',
          message: `Sending booking dispatch to provider (attempt ${attempt}/${this.MAX_TRANSIENT_RETRIES})...`,
        });

        toolResult = await tool.execute({
          taskId,
          taskRecord,
          approvedOption: option,
          customer: taskRecord.customer,
          executionPlan,
        });

        await appendTaskEvent({
          taskId,
          eventType: 'PROVIDER_RESPONSE_RECEIVED',
          actorRole: 'AI_AGENT',
          message: `Received provider response from ${tool.providerId}. Status: ${toolResult.status}`,
          data: { status: toolResult.status, reference: toolResult.providerReference },
        });

        // If not a transient failure, break out of retry loop
        if (toolResult.success || toolResult.status === 'AWAITING_CONCIERGE_CALL') {
          break;
        }

        // Permanent failures (e.g. sold out, policy blocked) should not retry
        if (toolResult.errorCode && !toolResult.errorCode.includes('TIMEOUT') && !toolResult.errorCode.includes('NETWORK')) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        logger.warn({ taskId, attempt, error: err?.message }, '[AIExecutionAgent] Transient execution error occurred');
        if (attempt >= this.MAX_TRANSIENT_RETRIES) break;
        // Bounded exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    if (!toolResult) {
      toolResult = {
        success: false,
        provider: tool.providerId,
        status: 'FAILED',
        isMock: false,
        environment: 'REAL',
        timestamp: new Date().toISOString(),
        errorMessage: lastError?.message || 'Tool execution encountered unexpected network failure.',
      };
    }

    // 10. Handle AWAITING_CONCIERGE_CALL (Assisted phone coordination / call brief)
    if (
      toolResult.status === 'AWAITING_CONCIERGE_CALL' ||
      toolResult.confirmedDetails?.status === 'AWAITING_CONCIERGE_CALL' ||
      option.bookingMethod === 'PHONE'
    ) {
      validateTransition('EXECUTING', 'NEEDS_HUMAN');
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          approvalStatus: 'APPROVED',
          vendorName: option.providerName || taskRecord.vendorName,
          budgetAmount: option.priceAmount || taskRecord.budgetAmount,
          clientPreferences: {
            ...existingPrefs,
            approvedOption: option as any,
            approvedAt: new Date().toISOString(),
            executionTier: 'ASSISTED',
            handoffMessage: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
            dispatchPayload: toolResult.confirmedDetails?.dispatchPayload || toolResult.confirmedDetails,
          } as any,
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'AWAITING_CONCIERGE_CALL',
        actorRole: 'AI_AGENT',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        data: {
          providerId: toolResult.provider || option.providerId,
          dispatchPayload: toolResult.confirmedDetails?.dispatchPayload || toolResult.confirmedDetails,
        },
      });

      // Dispatch customer notification
      try {
        if (taskRecord.customer?.user?.phone) {
          await sendWhatsAppNotification({
            phone: taskRecord.customer.user.phone,
            template: 'AWAITING_CONCIERGE_CALL',
            params: {
              name: taskRecord.customer.user.name || 'Member',
              details: `${option.title} (${option.providerName})`,
              actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
            },
          });
        }
      } catch (e) {
        console.error('[AIExecutionAgent] Concierge notice failed:', e);
      }

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        executionPlan,
        toolSelected: tool.toolName,
        toolResult,
        handedToConcierge: true,
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        task: escalatedTask,
      };
    }

    // 11. Deterministic Verification Gate
    const verificationResult = DeterministicVerificationGate.evaluate({
      taskRecord,
      approvedOption: option,
      executionPlan,
      toolResult,
    });

    if (!verificationResult.passed) {
      logger.warn(
        { taskId, reason: verificationResult.reason },
        '[AIExecutionAgent] Verification failed; escalating to Human Concierge'
      );

      validateTransition('EXECUTING', 'NEEDS_HUMAN');
      const escalatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          status: 'NEEDS_HUMAN',
          executionMethod: 'HUMAN_CONCIERGE',
          isEscalated: true,
          approvalStatus: 'APPROVED',
          failedReason: verificationResult.reason,
        },
      });

      await appendTaskEvent({
        taskId,
        eventType: 'EXECUTION_ESCALATED',
        actorRole: 'SYSTEM',
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        data: { reason: verificationResult.reason, errorCode: verificationResult.errorCode },
      });

      return {
        success: true,
        status: 'NEEDS_HUMAN',
        executionPlan,
        toolSelected: tool.toolName,
        toolResult,
        verificationPassed: false,
        handedToConcierge: true,
        failureCategory: verificationResult.errorCode as ExecutionFailureCategory,
        message: 'Your request is approved and has been handed to your Proventa Concierge for execution.',
        task: escalatedTask,
      };
    }

    // 12. Verification Succeeded -> Transition to PROVIDER_CONFIRMED -> COMPLETED
    const finalRef = toolResult.providerReference!;
    validateTransition('EXECUTING', 'CONFIRMED');

    const confirmedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'CONFIRMED',
        externalReferenceId: finalRef,
        completedAt: new Date(),
        clientPreferences: {
          ...existingPrefs,
          approvedOption: option as any,
          approvedAt: new Date().toISOString(),
          confirmedDetails: toolResult.confirmedDetails,
          folio: {
            taskId,
            service: taskRecord.category,
            provider: option.providerName,
            reference: finalRef,
            amount: executionPlan.amount,
            currency: executionPlan.currency,
            completedAt: new Date().toISOString(),
            status: 'COMPLETED',
          },
        } as any,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'EXECUTION_VERIFIED',
      actorRole: 'SYSTEM',
      message: `Execution verified with provider ${toolResult.provider}. Reference: ${finalRef}.`,
      data: { reference: finalRef },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'PROVIDER_CONFIRMED',
      actorRole: 'AI_AGENT',
      message: `Genuine provider confirmed booking with ${option.providerName}. Reference: ${finalRef}`,
      data: {
        provider: option.providerName,
        reference: finalRef,
        details: toolResult.confirmedDetails,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CONFIRMED',
      actorRole: 'AI_AGENT',
      message: `Done. Here's your confirmed booking. Reference: ${finalRef}`,
      data: {
        provider: option.providerName,
        reference: finalRef,
        details: toolResult.confirmedDetails,
      },
    });

    // 13. Authoritative Booking Record Creation (Idempotent)
    if (confirmedTask.customerId) {
      await db.booking.create({
        data: {
          requestId: confirmedTask.requestId || confirmedTask.id,
          customerId: confirmedTask.customerId,
          status: 'CONFIRMED',
          confirmationRef: finalRef,
          details: {
            title: option.title,
            providerName: option.providerName,
            price: option.priceFormatted,
            reference: finalRef,
            confirmedAt: new Date().toISOString(),
            ...toolResult.confirmedDetails,
          },
        },
      });
    }

    // 14. Customer Notification
    try {
      if (taskRecord.customer?.user?.phone) {
        await sendWhatsAppNotification({
          phone: taskRecord.customer.user.phone,
          template: 'BOOKING_CONFIRMED',
          params: {
            name: taskRecord.customer.user.name || 'Member',
            details: `${option.title} (${option.providerName}) · Ref: ${finalRef}`,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
          },
        });
      }

      if (taskRecord.customer?.user?.email) {
        await sendBookingConfirmationEmail({
          email: taskRecord.customer.user.email,
          name: taskRecord.customer.user.name || 'Valued Member',
          title: option.title,
          reference: finalRef,
          vendor: option.providerName || 'Proventa Concierge',
          notes: toolResult.confirmedDetails?.notes || `Confirmed reservation for ${option.title}`,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
        });
      }
    } catch (e) {
      console.error('[AIExecutionAgent] Notification error:', e);
    }

    return {
      success: true,
      status: 'CONFIRMED',
      executionPlan,
      toolSelected: tool.toolName,
      toolResult,
      verificationPassed: true,
      confirmationReference: finalRef,
      handedToConcierge: false,
      message: `Done. Your reservation with ${option.providerName} is confirmed. Reference: ${finalRef}`,
      task: confirmedTask,
    };
  }
}

import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';

export type FailureCategory =
  | 'TRANSIENT_NETWORK'
  | 'INSUFFICIENT_INVENTORY'
  | 'PERMISSION_DENIED'
  | 'MISSING_INFORMATION'
  | 'PAYMENT_FAILED'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNKNOWN';

export interface FailureResolution {
  action: 'RETRY' | 'FALLBACK_TOOL' | 'REQUEST_USER_INPUT' | 'ESCALATE_TO_HUMAN';
  delayMs?: number;
  reason: string;
  fallbackTool?: string;
  clarificationPrompt?: string;
}

export class FailureRecoveryEngine {
  /**
   * Classifies an execution failure into a distinct category.
   */
  static classifyFailure(error: any): FailureCategory {
    const msg = (error?.message || error?.toString() || '').toLowerCase();

    if (msg.includes('network') || msg.includes('timeout') || msg.includes('econnreset') || msg.includes('429')) {
      return 'TRANSIENT_NETWORK';
    }
    if (msg.includes('booked out') || msg.includes('sold out') || msg.includes('no availability') || msg.includes('full')) {
      return 'INSUFFICIENT_INVENTORY';
    }
    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('risk')) {
      return 'PERMISSION_DENIED';
    }
    if (msg.includes('missing') || msg.includes('required') || msg.includes('clarification')) {
      return 'MISSING_INFORMATION';
    }
    if (msg.includes('payment') || msg.includes('card') || msg.includes('funds') || msg.includes('declined')) {
      return 'PAYMENT_FAILED';
    }
    if (msg.includes('unavailable') || msg.includes('closed') || msg.includes('maintenance')) {
      return 'PROVIDER_UNAVAILABLE';
    }

    return 'UNKNOWN';
  }

  /**
   * Evaluates the recovery strategy based on error classification and retry attempts.
   */
  static determineResolution(params: {
    category: FailureCategory;
    attemptCount: number;
    maxRetries?: number;
    currentTool: string;
  }): FailureResolution {
    const { category, attemptCount, maxRetries = 2, currentTool } = params;

    // 1. Transient network/timeout errors: Retry with exponential backoff
    if (category === 'TRANSIENT_NETWORK' && attemptCount < maxRetries) {
      const delayMs = Math.pow(2, attemptCount) * 1000;
      return {
        action: 'RETRY',
        delayMs,
        reason: `Transient network delay detected. Retrying attempt #${attemptCount + 1} after ${delayMs}ms.`,
      };
    }

    // 2. Inventory / Provider unavailable: Fallback to alternative provider/tool
    if (category === 'INSUFFICIENT_INVENTORY' || category === 'PROVIDER_UNAVAILABLE') {
      if (currentTool === 'create_reservation') {
        return {
          action: 'FALLBACK_TOOL',
          fallbackTool: 'search_restaurants',
          reason: 'Preferred venue unavailable. Triggering fallback search across verified alternative dining partners.',
        };
      }
      if (currentTool === 'search_transport') {
        return {
          action: 'FALLBACK_TOOL',
          fallbackTool: 'search_places',
          reason: 'Primary chauffeur tier unavailable. Switching to secondary luxury fleet search.',
        };
      }
    }

    // 3. Missing info: Prompt client for needed detail
    if (category === 'MISSING_INFORMATION') {
      return {
        action: 'REQUEST_USER_INPUT',
        reason: 'Required details missing for reliable execution.',
        clarificationPrompt: 'Please specify the exact date/time and number of guests to proceed.',
      };
    }

    // 4. Permission or unrecoverable payment error: Escalate safely to human concierge
    return {
      action: 'ESCALATE_TO_HUMAN',
      reason: `Unrecoverable ${category} error encountered. Safely escalated to Proventa Concierge Desk. Zero-fabrication guarantee maintained.`,
    };
  }

  /**
   * Executes recovery resolution on a task.
   */
  static async handleFailure(taskId: string, error: any, attemptCount: number, currentTool: string): Promise<FailureResolution> {
    const classification = this.classifyFailure(error);
    const resolution = this.determineResolution({
      category: classification,
      attemptCount,
      currentTool,
    });

    await appendTaskEvent({
      taskId,
      eventType: 'STATUS_CHANGED',
      actorRole: 'SYSTEM',
      message: `[RecoveryEngine] Classified: ${classification} -> Strategy: ${resolution.action} (${resolution.reason})`,
      data: { classification, resolution },
    });

    if (resolution.action === 'ESCALATE_TO_HUMAN') {
      await db.task.update({
        where: { id: taskId },
        data: { status: 'NEEDS_HUMAN', isEscalated: true, failedReason: resolution.reason },
      });
    }

    return resolution;
  }
}

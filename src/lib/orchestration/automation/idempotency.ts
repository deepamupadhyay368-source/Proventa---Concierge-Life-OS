import { logger } from '@/lib/logger';
import crypto from 'crypto';

export interface RetryOptions {
  idempotencyKey: string;
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  actionName?: string;
  isRetryableError?: (err: any) => boolean;
}

// In-memory idempotency execution ledger to prevent double-execution in server instance
const executedActionsLedger = new Map<string, { result: any; executedAt: number; status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' }>();

export class IdempotencyEngine {
  /**
   * Generates a deterministic, unique idempotency key for any task action.
   */
  static generateIdempotencyKey(taskId: string, action: string, payload?: any): string {
    const raw = `${taskId}:${action}:${payload ? JSON.stringify(payload) : ''}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
    return `IDEMP-${taskId.slice(-6).toUpperCase()}-${action.toUpperCase()}-${hash}`;
  }

  /**
   * Safe execution wrapper with bounded backoff and strict idempotency protection.
   * Prevents duplicate financial/booking operations on network timeouts.
   */
  static async executeWithRetry<T>(options: RetryOptions, fn: () => Promise<T>): Promise<T> {
    const {
      idempotencyKey,
      maxRetries = 3,
      initialDelayMs = 300,
      maxDelayMs = 2500,
      actionName = 'ProviderOperation',
      isRetryableError = (err) => {
        const msg = String(err?.message || '').toLowerCase();
        // Do not retry 4xx user errors or hard constraint mismatches
        if (msg.includes('validation') || msg.includes('constraint') || msg.includes('unauthorized') || msg.includes('forbidden')) {
          return false;
        }
        // Retry transient network errors, timeouts, 5xx server issues
        return msg.includes('timeout') || msg.includes('econnreset') || msg.includes('50') || msg.includes('network') || msg.includes('rate limit');
      },
    } = options;

    // Check idempotency ledger
    const existing = executedActionsLedger.get(idempotencyKey);
    if (existing && existing.status === 'COMPLETED') {
      logger.info({ idempotencyKey, actionName }, '[IdempotencyEngine] Returning previously executed result');
      return existing.result as T;
    }

    executedActionsLedger.set(idempotencyKey, { result: null, executedAt: Date.now(), status: 'IN_PROGRESS' });

    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt <= maxRetries) {
      attempt++;
      try {
        const result = await fn();
        executedActionsLedger.set(idempotencyKey, { result, executedAt: Date.now(), status: 'COMPLETED' });
        return result;
      } catch (err: any) {
        const canRetry = attempt <= maxRetries && isRetryableError(err);
        logger.warn(
          { attempt, maxRetries, idempotencyKey, actionName, error: err?.message, canRetry },
          '[IdempotencyEngine] Operation attempt failed'
        );

        if (!canRetry) {
          executedActionsLedger.set(idempotencyKey, { result: null, executedAt: Date.now(), status: 'FAILED' });
          throw err;
        }

        // Bounded exponential backoff with jitter
        const jitter = Math.floor(Math.random() * 100);
        const actualDelay = Math.min(delay + jitter, maxDelayMs);
        await new Promise((res) => setTimeout(res, actualDelay));
        delay = Math.min(delay * 2, maxDelayMs);
      }
    }

    executedActionsLedger.set(idempotencyKey, { result: null, executedAt: Date.now(), status: 'FAILED' });
    throw new Error(`[IdempotencyEngine] ${actionName} exhausted all ${maxRetries} retries.`);
  }
}

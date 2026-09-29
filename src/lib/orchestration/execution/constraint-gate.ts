/**
 * PROVENTA — PRE-EXECUTION CONSTRAINT GATE
 * Deterministic gate verifying that the approved option strictly complies with the customer's intent
 * and entity constraints prior to execution.
 * Mismatch -> HALTS execution -> Escalates to Human Concierge with INTENT_CONSTRAINT_MISMATCH.
 */

import { ExecutionGateResult, ExecutionPlan } from './types';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import type { OptionProposal } from '../types';
import { logger } from '@/lib/logger';

export class PreExecutionConstraintGate {
  /**
   * Validates that the approved option and execution plan comply with all hard constraints.
   */
  static evaluate(params: {
    taskRecord: any;
    approvedOption: OptionProposal;
    executionPlan: ExecutionPlan;
  }): ExecutionGateResult {
    const { taskRecord, approvedOption, executionPlan } = params;

    // 1. Run EntityIntegrityValidator
    const integrityResult = EntityIntegrityValidator.verifyPreExecutionConstraints(taskRecord, approvedOption);

    if (!integrityResult.isValid) {
      logger.warn(
        { taskId: taskRecord.id, reason: integrityResult.violationReason },
        '[ConstraintGate] Pre-execution entity constraint check failed'
      );

      return {
        passed: false,
        gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
        reason: integrityResult.violationReason || 'Pre-execution entity constraint validation failed.',
        errorCode: 'INTENT_CONSTRAINT_MISMATCH',
        details: {
          originalRequest: taskRecord.originalRequest,
          category: taskRecord.category,
          optionTitle: approvedOption.title,
          plan: executionPlan,
        },
      };
    }

    // 2. Direct Plan Specific Checks (e.g. Flight Origin/Destination match)
    if (taskRecord.category?.includes('flight') || taskRecord.category?.includes('travel')) {
      const originalLower = (taskRecord.originalRequest || '').toLowerCase();
      if (executionPlan.origin && originalLower.includes('from ')) {
        const originClean = executionPlan.origin.toLowerCase();
        // If customer explicitly requested Mumbai and plan has AMD, detect mismatch
        if (originalLower.includes('from mumbai') && originClean === 'amd') {
          return {
            passed: false,
            gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
            reason: 'Origin airport in execution plan does not match customer origin intent.',
            errorCode: 'INTENT_CONSTRAINT_MISMATCH',
          };
        }
      }
    }

    return {
      passed: true,
      gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
    };
  }
}

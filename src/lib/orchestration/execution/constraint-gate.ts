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

    // 2. Direct Plan Specific Checks (Flight Origin/Destination/Date/Passenger match)
    const originalLower = (taskRecord.originalRequest || taskRecord.intent || '').toLowerCase();
    const extracted = (taskRecord.extractedData as Record<string, any>) || {};
    const prefs = (taskRecord.clientPreferences as Record<string, any>) || {};
    const prep = prefs.preparedContext || {};

    // 2A. Flight Origin check
    if (taskRecord.category?.includes('flight') || taskRecord.category?.includes('travel') || executionPlan.origin) {
      const reqOrigin = (
        extracted.origin ||
        extracted.from ||
        extracted.originAirport ||
        prefs.origin ||
        prefs.originAirport ||
        prep.origin ||
        prep.originAirport ||
        taskRecord.origin ||
        ''
      ).toUpperCase();

      if (executionPlan.origin) {
        const planOrigin = executionPlan.origin.toUpperCase();
        if (reqOrigin) {
          const reqResolved = EntityIntegrityValidator.resolveCityAirport(reqOrigin);
          const planResolved = EntityIntegrityValidator.resolveCityAirport(planOrigin);
          const reqCode = reqResolved?.code || reqOrigin;
          const planCode = planResolved?.code || planOrigin;
          if (reqCode !== planCode && !planOrigin.includes(reqOrigin) && !reqOrigin.includes(planOrigin)) {
            return {
              passed: false,
              gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
              reason: `Origin mismatch: Customer requested departure from ${reqOrigin}, but execution plan specifies ${planOrigin}.`,
              errorCode: 'INTENT_CONSTRAINT_MISMATCH',
            };
          }
        }
      }
    }

    // 2B. Destination check
    if (taskRecord.category?.includes('flight') || taskRecord.category?.includes('travel') || taskRecord.category?.includes('hotel') || executionPlan.destination) {
      const reqDest = (
        extracted.destination ||
        extracted.to ||
        extracted.destinationAirport ||
        extracted.location ||
        prefs.destination ||
        prefs.destinationAirport ||
        prep.destination ||
        prep.destinationAirport ||
        taskRecord.destination ||
        ''
      ).toUpperCase();

      if (executionPlan.destination && reqDest) {
        const planDest = executionPlan.destination.toUpperCase();
        const reqResolved = EntityIntegrityValidator.resolveCityAirport(reqDest);
        const planResolved = EntityIntegrityValidator.resolveCityAirport(planDest);
        const reqCode = reqResolved?.code || reqDest;
        const planCode = planResolved?.code || planDest;
        if (reqCode !== planCode && !planDest.includes(reqDest) && !reqDest.includes(planDest)) {
          return {
            passed: false,
            gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
            reason: `Destination airport mismatch: Customer requested destination ${reqDest}, but execution plan specifies ${planDest}.`,
            errorCode: 'INTENT_CONSTRAINT_MISMATCH',
          };
        }
      }
    }

    // 2C. Date Check
    const planDate = (executionPlan.date || approvedOption.metadata?.date || approvedOption.metadata?.departureDate || '').slice(0, 10);
    const requestedDate = (
      extracted.date ||
      extracted.departureDate ||
      prefs.date ||
      prefs.departureDate ||
      prep.date ||
      (taskRecord.targetDate ? new Date(taskRecord.targetDate).toISOString().slice(0, 10) : '')
    ).slice(0, 10);

    if (requestedDate && planDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && /^\d{4}-\d{2}-\d{2}$/.test(planDate)) {
      if (requestedDate !== planDate) {
        return {
          passed: false,
          gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
          reason: `Date mismatch: Customer requested ${requestedDate}, but execution plan is scheduled for ${planDate}.`,
          errorCode: 'INTENT_CONSTRAINT_MISMATCH',
        };
      }
    }

    // 2D. Passenger / Party Size Check
    const reqPax = extracted.passengers || extracted.partySize || prefs.partySize || prefs.passengers || prep.partySize;
    const planPax = executionPlan.partySize || approvedOption.metadata?.passengers || approvedOption.metadata?.partySize;
    if (reqPax && planPax && Number(reqPax) > 0 && Number(planPax) > 0) {
      if (Number(reqPax) !== Number(planPax)) {
        return {
          passed: false,
          gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
          reason: `Passenger count mismatch: Customer requested ${reqPax} guests/passengers, but execution plan specifies ${planPax}.`,
          errorCode: 'INTENT_CONSTRAINT_MISMATCH',
        };
      }
    }

    return {
      passed: true,
      gateName: 'PRE_EXECUTION_CONSTRAINT_GATE',
    };
  }
}

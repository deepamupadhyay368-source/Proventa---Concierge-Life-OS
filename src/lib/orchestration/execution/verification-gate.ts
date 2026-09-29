/**
 * PROVENTA — DETERMINISTIC EXECUTION VERIFICATION GATE
 * Zero-Fabrication Verification: Validates provider responses against authentic evidence standards.
 * Strictly rejects synthetic references (PV-*, MOCK-*, TEST-*, DEMO-*, FAKE-*, SANDBOX).
 */

import { ExecutionGateResult, ExecutionPlan, ExecutionToolResult } from './types';
import { EntityIntegrityValidator } from '@/lib/validation/entity-integrity';
import { logger } from '@/lib/logger';
import type { OptionProposal } from '../types';

export class DeterministicVerificationGate {
  private static SYNTHETIC_PREFIXES = ['PV-', 'MOCK-', 'TEST-', 'DEMO-', 'FAKE-', 'SANDBOX'];

  /**
   * Evaluates provider response evidence against zero-fabrication standards.
   */
  static evaluate(params: {
    taskRecord: any;
    approvedOption: OptionProposal;
    executionPlan: ExecutionPlan;
    toolResult: ExecutionToolResult;
  }): ExecutionGateResult {
    const { taskRecord, approvedOption, toolResult } = params;

    // 1. Check basic tool execution status
    if (!toolResult.success && toolResult.status !== 'AWAITING_CONCIERGE_CALL') {
      return {
        passed: false,
        gateName: 'DETERMINISTIC_VERIFICATION_GATE',
        reason: toolResult.errorMessage || 'Provider execution failed to complete successfully.',
        errorCode: toolResult.errorCode || toolResult.errorMessage || 'PROVIDER_EXECUTION_FAILED',
      };
    }

    // 2. If status is AWAITING_CONCIERGE_CALL (Assisted phone coordination), valid for concierge handoff
    if (toolResult.status === 'AWAITING_CONCIERGE_CALL') {
      return {
        passed: true,
        gateName: 'DETERMINISTIC_VERIFICATION_GATE',
        details: { mode: 'ASSISTED_CONCIERGE_DISPATCHED' },
      };
    }

    // 3. For automated CONFIRMED executions, check environment and mock status
    if (toolResult.isMock || toolResult.environment === 'SANDBOX' || toolResult.environment === 'MOCK') {
      logger.warn(
        { taskId: taskRecord.id, toolResult },
        '[VerificationGate] Simulated/Sandbox execution output rejected from automated production confirmation'
      );

      return {
        passed: false,
        gateName: 'DETERMINISTIC_VERIFICATION_GATE',
        reason: 'Execution was simulated in sandbox/mock environment. Real production confirmation requires Live Provider or Concierge execution.',
        errorCode: 'SYNTHETIC_EVIDENCE_REJECTED',
      };
    }

    // 4. Validate Provider Reference
    const ref = (toolResult.providerReference || '').trim();
    if (!ref) {
      return {
        passed: false,
        gateName: 'DETERMINISTIC_VERIFICATION_GATE',
        reason: 'Provider returned confirmation status without providing an authoritative booking reference.',
        errorCode: 'EMPTY_CONFIRMATION_REFERENCE',
      };
    }

    // 5. Zero-Fabrication: Synthetic Prefix Check
    const upperRef = ref.toUpperCase();
    for (const prefix of this.SYNTHETIC_PREFIXES) {
      if (upperRef.startsWith(prefix) || upperRef.includes('SANDBOX')) {
        logger.error(
          { taskId: taskRecord.id, reference: ref, prefix },
          '[VerificationGate] Synthetic reference detected and rejected'
        );

        return {
          passed: false,
          gateName: 'DETERMINISTIC_VERIFICATION_GATE',
          reason: `Synthetic reference format '${ref}' rejected under Proventa Zero-Fabrication Standards.`,
          errorCode: 'SYNTHETIC_EVIDENCE_REJECTED',
        };
      }
    }

    // 6. Post-Execution Entity Constraint Validation
    const postIntegrity = EntityIntegrityValidator.verifyPostExecutionResponse(
      taskRecord,
      {
        success: toolResult.success,
        providerId: toolResult.provider,
        externalReferenceId: ref,
        confirmedDetails: toolResult.confirmedDetails,
        status: toolResult.status,
      },
      approvedOption
    );

    if (!postIntegrity.isValid) {
      logger.warn(
        { taskId: taskRecord.id, reason: postIntegrity.violationReason },
        '[VerificationGate] Post-execution response constraint mismatch'
      );

      return {
        passed: false,
        gateName: 'DETERMINISTIC_VERIFICATION_GATE',
        reason: postIntegrity.violationReason || 'Post-execution response validation failed.',
        errorCode: 'INTENT_CONSTRAINT_MISMATCH',
      };
    }

    return {
      passed: true,
      gateName: 'DETERMINISTIC_VERIFICATION_GATE',
      details: {
        verifiedReference: ref,
        confirmedDetails: toolResult.confirmedDetails,
      },
    };
  }
}

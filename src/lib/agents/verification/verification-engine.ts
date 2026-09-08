import type { VerificationResult, ExecutionOutput } from '@/lib/orchestration/types';

export class AuthoritativeVerificationEngine {
  /**
   * Strictly inspects the raw output from tools and provider networks.
   * Zero-Fabrication rule: Never marks a task verified unless an authoritative reference
   * exists and the status is explicitly CONFIRMED, SENT, or ORDER_PLACED.
   */
  static verifyExecution(toolName: string, output: any): VerificationResult {
    if (!output) {
      return {
        verified: false,
        status: 'FAILED',
        verifiedAt: new Date(),
        auditTrail: `Tool '${toolName}' returned null or empty response. Zero-fabrication check failed.`,
      };
    }

    const hasRef = Boolean(
      output.externalReferenceId ||
      output.orderId ||
      output.paymentId ||
      output.eventId ||
      output.messageId ||
      (output.confirmedDetails && output.confirmedDetails.reference)
    );

    const refId =
      output.externalReferenceId ||
      output.orderId ||
      output.paymentId ||
      output.eventId ||
      output.messageId ||
      output.confirmedDetails?.reference ||
      'UNVERIFIED';

    const isConfirmedStatus =
      output.status === 'CONFIRMED' ||
      output.status === 'ORDER_PLACED' ||
      output.status === 'CAPTURED' ||
      output.status === 'SCHEDULED' ||
      output.status === 'SENT' ||
      output.status === 'DELIVERED' ||
      output.status === 'CANCELLED';

    if (output.success && hasRef && isConfirmedStatus) {
      return {
        verified: true,
        status: 'CONFIRMED',
        confirmationReference: refId,
        isMock: Boolean(output.isMock),
        verifiedAt: new Date(),
        auditTrail: `Authoritative confirmation verified via ${output.providerName || toolName} [Ref: ${refId}].`,
        details: output.details || output.confirmedDetails || output,
      };
    }

    return {
      verified: false,
      status: 'FAILED',
      confirmationReference: undefined,
      verifiedAt: new Date(),
      auditTrail: `Verification rejected: Action reported success=${output.success} but missing authoritative confirmation status or reference.`,
      details: output,
    };
  }
}

/**
 * PROVENTA — Protected Purchase Award Engine
 * Executes supplier awards inside an atomic PostgreSQL transaction with row-level locking
 * (SELECT ... FOR UPDATE), idempotency protection, quotation validity checks,
 * separation-of-duties verification, and immutable award snapshots.
 */

import { db } from '@/lib/db';
import { evaluateSeparationOfDuties } from './rbac';

export class AwardConflictError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly existingPurchaseOrderId?: string;

  constructor(code: string, message: string, statusCode = 409, existingPurchaseOrderId?: string) {
    super(message);
    this.name = 'AwardConflictError';
    this.code = code;
    this.statusCode = statusCode;
    this.existingPurchaseOrderId = existingPurchaseOrderId;
  }
}

export interface ExecuteProtectedAwardInput {
  organisationId: string;
  rfqId: string;
  quotationId: string;
  actorUserId: string;
  actorRoles: readonly string[];
  idempotencyKey: string;
  technicalEvalPassed: boolean;
  approvedByUserId?: string;
  selfApprovalLimitPaise?: bigint;
  now?: Date;
}

export interface ProtectedAwardResult {
  awardId: string;
  purchaseOrderId: string;
  rfqId: string;
  quotationId: string;
  awardedAmountPaise: bigint;
  isIdempotentReplay: boolean;
}

export async function executeProtectedAward(
  input: ExecuteProtectedAwardInput
): Promise<ProtectedAwardResult> {
  const now = input.now ?? new Date();

  if (!input.idempotencyKey || input.idempotencyKey.trim().length < 6) {
    throw new AwardConflictError(
      'INVALID_IDEMPOTENCY_KEY',
      'A valid idempotencyKey (minimum 6 characters) is required to execute a purchase award.',
      400
    );
  }

  if (!input.technicalEvalPassed) {
    throw new AwardConflictError(
      'TECHNICAL_EVALUATION_REQUIRED',
      'Technical evaluation must be explicitly confirmed before executing a supplier award.',
      400
    );
  }

  // 1. Idempotency pre-check
  const existingByKey = await db.procurementAward.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existingByKey) {
    if (existingByKey.organisationId !== input.organisationId) {
      throw new AwardConflictError(
        'FORBIDDEN_CROSS_TENANT_ACCESS',
        'Idempotency key belongs to a different organisation.',
        403
      );
    }
    return {
      awardId: existingByKey.id,
      purchaseOrderId: existingByKey.purchaseOrderId,
      rfqId: existingByKey.rfqId,
      quotationId: existingByKey.quotationId,
      awardedAmountPaise: existingByKey.awardedAmountPaise,
      isIdempotentReplay: true,
    };
  }

  // 2. Atomic database transaction with row-level lock on parent RFQ
  return await db.$transaction(async (tx) => {
    if (typeof (tx as any).$queryRaw === 'function') {
      await (tx as any).$queryRaw`SELECT id FROM procurement_rfqs WHERE id = ${input.rfqId} FOR UPDATE`;
    }

    const rfq = await tx.procurementRfq.findUnique({
      where: { id: input.rfqId },
    });

    if (!rfq) {
      throw new AwardConflictError('RFQ_NOT_FOUND', `RFQ ${input.rfqId} not found.`, 404);
    }

    if (rfq.buyerBusinessId && rfq.buyerBusinessId !== input.organisationId) {
      throw new AwardConflictError(
        'FORBIDDEN_CROSS_TENANT_ACCESS',
        'You are not authorised to award an RFQ belonging to another organisation.',
        403
      );
    }

    // Prevent duplicate / conflicting awards
    const existingAward = await tx.procurementAward.findUnique({
      where: { rfqId: input.rfqId },
    });
    if (existingAward || rfq.purchaseOrderId || rfq.status === 'PO_ISSUED') {
      throw new AwardConflictError(
        'ALREADY_AWARDED',
        `RFQ ${input.rfqId} has already been awarded and cannot be awarded again without a formal amendment.`,
        409,
        existingAward?.purchaseOrderId || rfq.purchaseOrderId || undefined
      );
    }

    if (rfq.status === 'CANCELLED') {
      throw new AwardConflictError(
        'RFQ_INACTIVE',
        `Cannot award cancelled RFQ ${input.rfqId}.`,
        409
      );
    }

    const quotation = await tx.procurementQuotation.findUnique({
      where: { id: input.quotationId },
    });

    if (!quotation || quotation.rfqId !== input.rfqId) {
      throw new AwardConflictError(
        'QUOTATION_NOT_FOUND',
        `Quotation ${input.quotationId} does not belong to RFQ ${input.rfqId}.`,
        404
      );
    }

    if (quotation.validUntil && new Date(quotation.validUntil).getTime() < now.getTime()) {
      throw new AwardConflictError(
        'QUOTATION_EXPIRED',
        `Quotation ${input.quotationId} expired on ${new Date(quotation.validUntil).toISOString()} and cannot be awarded.`,
        409
      );
    }

    const awardedAmountPaise = BigInt(Math.round(quotation.totalLandedCost * 100));

    // Separation of duties enforcement
    const sod = evaluateSeparationOfDuties({
      rfqCreatorUserId: rfq.creatorUserId,
      actorUserId: input.actorUserId,
      actorRoles: input.actorRoles,
      amountPaise: awardedAmountPaise,
      selfApprovalLimitPaise: input.selfApprovalLimitPaise,
    });
    if (!sod.allowed) {
      throw new AwardConflictError('APPROVAL_REQUIRED', sod.reason || 'Approval policy blocked award.', 403);
    }

    const poNumber = `PO-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await tx.procurementOrder.create({
      data: {
        id: poNumber,
        rfqId: rfq.id,
        quotationId: quotation.id,
        buyerBusinessId: input.organisationId,
        supplierBusinessId: quotation.supplierBusinessId,
        supplierId: quotation.supplierId,
        supplierName: quotation.supplierName,
        totalAmount: quotation.totalLandedCost,
        status: 'AWAITING_SUPPLIER_CONFIRMATION',
      },
    });

    const award = await tx.procurementAward.create({
      data: {
        organisationId: input.organisationId,
        rfqId: rfq.id,
        quotationId: quotation.id,
        supplierBusinessId: quotation.supplierBusinessId || quotation.supplierId,
        purchaseOrderId: order.id,
        idempotencyKey: input.idempotencyKey,
        awardedAmountPaise,
        currency: 'INR',
        awardedByUserId: input.actorUserId,
        approvedByUserId: input.approvedByUserId || input.actorUserId,
        technicalEvalPassed: true,
        status: 'ACTIVE',
        immutableSnapshotJson: {
          rfqTitle: rfq.title,
          rfqCategory: rfq.category,
          supplierId: quotation.supplierId,
          supplierName: quotation.supplierName,
          totalLandedCostPaise: awardedAmountPaise.toString(),
          paymentTerms: quotation.paymentTerms,
          leadTimeDays: quotation.leadTimeDays,
          awardedAtIso: now.toISOString(),
        },
      },
    });

    await tx.procurementQuotation.update({
      where: { id: quotation.id },
      data: { status: 'ACCEPTED' },
    });

    await tx.procurementRfq.update({
      where: { id: rfq.id },
      data: {
        status: 'PO_ISSUED',
        purchaseOrderId: order.id,
      },
    });

    return {
      awardId: award.id,
      purchaseOrderId: order.id,
      rfqId: rfq.id,
      quotationId: quotation.id,
      awardedAmountPaise,
      isIdempotentReplay: false,
    };
  });
}

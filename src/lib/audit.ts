import { db } from './db';
import { AuditAction } from '@prisma/client';
import { logger } from './logger';

interface AuditLogParams {
  actorId?: string;
  actorRole?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        before: params.before as never,
        after: params.after as never,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId,
      },
    });
  } catch (error) {
    // Audit log failure must never crash the main operation
    logger.error({ error, params }, 'Failed to create audit log');
  }
}

export async function createSecurityEvent(
  type: string,
  details: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    data?: unknown;
  },
): Promise<void> {
  try {
    await db.securityEvent.create({
      data: {
        type: type as never,
        userId: details.userId,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        details: details.data as never,
      },
    });
  } catch (error) {
    logger.error({ error, type, details }, 'Failed to create security event');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hasAnyRole } from '@/lib/auth/session';
import { AppError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  assertKeyAccess,
  deleteStorageObject,
} from '@/lib/storage';

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const { attachmentId, storageKey } = body;

    const isStaff = hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE']);

    let targetStorageKey: string;

    if (attachmentId) {
      const attachment = await db.requestAttachment.findUnique({
        where: { id: attachmentId },
        include: {
          request: {
            include: {
              customer: true,
            },
          },
        },
      });

      if (!attachment || attachment.deletedAt) {
        throw new NotFoundError('Attachment');
      }

      const isOwner =
        attachment.uploadedBy === user.id ||
        attachment.request?.customer?.userId === user.id;

      if (!isStaff && !isOwner) {
        throw new AuthorizationError('Access denied: you do not have permission to delete this attachment');
      }

      targetStorageKey = attachment.storageKey;

      // Soft delete in database
      await db.requestAttachment.update({
        where: { id: attachmentId },
        data: { deletedAt: new Date() },
      });
    } else if (storageKey) {
      assertKeyAccess(storageKey);

      if (!isStaff) {
        const customerProfile = await db.customerProfile.findUnique({
          where: { userId: user.id },
        });

        if (!customerProfile) {
          throw new AuthorizationError('Member account required');
        }

        assertKeyAccess(storageKey, customerProfile.id);
      }

      targetStorageKey = storageKey;

      // Soft-delete if record exists in database
      await db.requestAttachment.updateMany({
        where: { storageKey, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    } else {
      throw new ValidationError('Either attachmentId or storageKey must be provided');
    }

    // Delete object from S3/R2 storage
    await deleteStorageObject(targetStorageKey);

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }

    logger.error({ err: err.message }, '[Storage] Deletion error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the attachment' },
      { status: 500 }
    );
  }
}

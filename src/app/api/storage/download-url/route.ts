import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hasAnyRole } from '@/lib/auth/session';
import { AppError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  assertKeyAccess,
  generatePresignedDownloadUrl,
} from '@/lib/storage';

async function handleDownloadRequest(user: any, attachmentId?: string | null, storageKeyParam?: string | null) {
  const isStaff = hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE']);

  let targetStorageKey: string;
  let filename: string | undefined = undefined;

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

    // Customer isolation check
    const isOwner =
      attachment.uploadedBy === user.id ||
      attachment.request?.customer?.userId === user.id;

    if (!isStaff && !isOwner) {
      throw new AuthorizationError('Access denied: you do not have permission to access this attachment');
    }

    targetStorageKey = attachment.storageKey;
    filename = attachment.filename;
  } else if (storageKeyParam) {
    assertKeyAccess(storageKeyParam);

    if (!isStaff) {
      const customerProfile = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!customerProfile) {
        throw new AuthorizationError('Member account required');
      }

      assertKeyAccess(storageKeyParam, customerProfile.id);
    }

    targetStorageKey = storageKeyParam;
  } else {
    throw new ValidationError('Either attachmentId or storageKey must be provided');
  }

  const { downloadUrl, expiresInSeconds } = await generatePresignedDownloadUrl({
    key: targetStorageKey,
    filename,
  });

  return {
    downloadUrl,
    storageKey: targetStorageKey,
    filename,
    expiresInSeconds,
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { attachmentId, storageKey } = body;

    const result = await handleDownloadRequest(user, attachmentId, storageKey);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }

    logger.error({ err: err.message }, '[Storage] Download URL generation error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the download URL' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');
    const storageKey = searchParams.get('storageKey');

    const result = await handleDownloadRequest(user, attachmentId, storageKey);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }

    logger.error({ err: err.message }, '[Storage] Download URL generation error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the download URL' },
      { status: 500 }
    );
  }
}

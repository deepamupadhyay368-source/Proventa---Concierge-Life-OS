import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, hasAnyRole } from '@/lib/auth/session';
import { AppError, AuthorizationError, NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  validateUploadMetadata,
  generateCustomerObjectKey,
  generatePresignedUploadUrl,
} from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { filename, mimeType, sizeBytes, requestId, customerId: targetCustomerIdParam } = body;

    // 1. Validate file metadata
    const { sanitizedFilename } = validateUploadMetadata({
      filename,
      mimeType,
      sizeBytes: Number(sizeBytes),
    });

    const isStaff = hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'CONCIERGE']);

    let targetCustomerId: string;

    if (isStaff && targetCustomerIdParam) {
      targetCustomerId = targetCustomerIdParam;
    } else {
      const customerProfile = await db.customerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!customerProfile) {
        if (isStaff) {
          throw new AppError('customerId or requestId required for staff uploads', 'MISSING_TARGET_CUSTOMER', 400);
        }
        throw new AuthorizationError('Only registered members or authorized staff can upload documents');
      }
      targetCustomerId = customerProfile.id;
    }

    // 2. If requestId is specified, verify ownership and existence
    let validatedRequestId: string | undefined = undefined;
    if (requestId) {
      const requestRecord = await db.conciergeRequest.findUnique({
        where: { id: requestId },
        include: { customer: true },
      });

      if (!requestRecord) {
        throw new NotFoundError('Concierge request');
      }

      // Customer isolation: ensure customer only uploads to their own request
      if (!isStaff && requestRecord.customerId !== targetCustomerId) {
        throw new AuthorizationError('Access denied: you do not have permission to attach files to this request');
      }

      targetCustomerId = requestRecord.customerId;
      validatedRequestId = requestRecord.id;
    }

    // 3. Server generates safe, isolated object key
    const storageKey = generateCustomerObjectKey({
      customerId: targetCustomerId,
      originalFilename: sanitizedFilename,
      requestId: validatedRequestId,
    });

    // 4. Generate presigned upload URL
    const { uploadUrl, expiresInSeconds } = await generatePresignedUploadUrl({
      key: storageKey,
      contentType: mimeType,
      sizeBytes: Number(sizeBytes),
    });

    // 5. Register attachment record in DB if linked to a request
    let attachmentId: string | undefined = undefined;
    if (validatedRequestId) {
      const attachment = await db.requestAttachment.create({
        data: {
          requestId: validatedRequestId,
          uploadedBy: user.id,
          storageKey,
          filename: sanitizedFilename,
          mimeType,
          sizeBytes: Number(sizeBytes),
        },
      });
      attachmentId = attachment.id;
    }

    return NextResponse.json({
      uploadUrl,
      storageKey,
      expiresInSeconds,
      attachmentId,
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }

    logger.error({ err: err.message }, '[Storage] Upload URL generation error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the upload URL' },
      { status: 500 }
    );
  }
}

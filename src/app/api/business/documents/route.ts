import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { uploadBusinessDocument } from '@/lib/business/service';
import type { BusinessDocumentType } from '@prisma/client';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: business.documents,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      businessId,
      documentType,
      documentNumber,
      fileName,
      fileUrl,
      fileSizeBytes,
      mimeType,
    } = body;

    if (!businessId || !documentType || !fileName || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'businessId, documentType, fileName, and fileUrl are required' },
        { status: 400 }
      );
    }

    if (mimeType && !ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Allowed formats: PDF, JPG, PNG, WEBP.' },
        { status: 400 }
      );
    }

    if (fileSizeBytes && fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum permitted limit of 10MB.' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;

    const doc = await uploadBusinessDocument({
      userId: user.id,
      businessId,
      documentType: documentType as BusinessDocumentType,
      documentNumber,
      fileName,
      fileUrl,
      fileSizeBytes,
      mimeType,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error: any) {
    console.error('[documents POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 400 }
    );
  }
}

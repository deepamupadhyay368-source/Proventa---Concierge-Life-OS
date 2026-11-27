import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function sanitizeFilename(name: string): string {
  const base = name.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  return (base || 'document.bin').slice(0, 140);
}

/**
 * POST /api/real-estate/property-os/documents
 * Private binary document upload for a Property Passport.
 * Enforces strict authentication, passport ownership (403 on IDOR),
 * MIME allowlist, 10 MB limit, safe filename, and SHA-256 checksum.
 * Never exposes public URLs; all downloads require authenticated ownership check.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const passportId = String(formData.get('passportId') || '').trim();
    const file = formData.get('file');

    if (!passportId) {
      return NextResponse.json({ error: 'passportId is required.' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Binary file upload is required.' }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type (${file.type}). Allowed: PDF, PNG, JPEG, WEBP.` },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'File size must be between 1 byte and 10 MB.' },
        { status: 400 }
      );
    }

    const passport = await db.propertyPassport.findUnique({
      where: { id: passportId },
      select: { id: true, ownerUserId: true, deletedAt: true },
    });
    if (!passport || passport.deletedAt) {
      return NextResponse.json({ error: 'Property Passport not found.' }, { status: 404 });
    }
    if (passport.ownerUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this private Property Passport.' },
        { status: 403 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const sha256Checksum = crypto.createHash('sha256').update(bytes).digest('hex');
    const safeName = sanitizeFilename(file.name);
    const storageKey = `private/property-os/${userId}/${passportId}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeName}`;

    const doc = await db.propertyDocument.create({
      data: {
        passportId,
        ownerUserId: userId,
        fileName: safeName,
        mimeType: file.type,
        sizeBytes: bytes.length,
        storageKey,
        storageProvider: 'DATABASE_PRIVATE',
        sha256Checksum,
        contentBase64: bytes.toString('base64'),
      },
      select: {
        id: true,
        passportId: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        storageProvider: true,
        sha256Checksum: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        document: {
          ...doc,
          downloadUrl: `/api/real-estate/property-os/documents/${doc.id}`,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/real-estate/property-os/documents]', err);
    return NextResponse.json({ error: 'Failed to upload private document.' }, { status: 500 });
  }
}

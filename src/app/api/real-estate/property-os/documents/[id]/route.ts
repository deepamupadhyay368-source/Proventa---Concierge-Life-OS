import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/real-estate/property-os/documents/[id]
 * Strictly owner-authorized private binary document download.
 * Returns 401 if unauthenticated, 403 on cross-user IDOR, 404 if not found.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await context.params;
    const doc = await db.propertyDocument.findUnique({
      where: { id },
      select: {
        id: true,
        ownerUserId: true,
        fileName: true,
        mimeType: true,
        sha256Checksum: true,
        contentBase64: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Private document not found.' }, { status: 404 });
    }
    if (doc.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Cross-user private document access denied.' },
        { status: 403 }
      );
    }
    if (!doc.contentBase64) {
      return NextResponse.json({ error: 'Document payload unavailable.' }, { status: 404 });
    }

    const bytes = Buffer.from(doc.contentBase64, 'base64');
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `attachment; filename="${doc.fileName}"`,
        'Content-Length': String(bytes.length),
        'X-Content-SHA256': doc.sha256Checksum,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('[GET /api/real-estate/property-os/documents/[id]]', err);
    return NextResponse.json({ error: 'Failed to download private document.' }, { status: 500 });
  }
}

/**
 * DELETE /api/real-estate/property-os/documents/[id]
 * Strictly owner-authorized document deletion.
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await context.params;
    const doc = await db.propertyDocument.findUnique({
      where: { id },
      select: { id: true, ownerUserId: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Private document not found.' }, { status: 404 });
    }
    if (doc.ownerUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await db.propertyDocument.delete({ where: { id: doc.id } });
    return NextResponse.json({ deleted: true, id: doc.id });
  } catch (err) {
    console.error('[DELETE /api/real-estate/property-os/documents/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete private document.' }, { status: 500 });
  }
}

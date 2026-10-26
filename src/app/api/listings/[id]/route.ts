import { NextRequest, NextResponse } from 'next/server';
import {
  deleteBusinessListing,
  updateBusinessListing,
} from '@/lib/marketplace/repository';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    const listing = updateBusinessListing(
      user.id,
      id,
      body,
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'UPDATE',
      resourceType: 'BusinessListing',
      resourceId: listing.id,
      after: { title: listing.title, status: listing.status },
    });

    return NextResponse.json({ listing });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireAuth();
    deleteBusinessListing(user.id, id, isAdminOrModerator(user));

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'DELETE',
      resourceType: 'BusinessListing',
      resourceId: id,
    });

    return NextResponse.json({ deleted: true });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

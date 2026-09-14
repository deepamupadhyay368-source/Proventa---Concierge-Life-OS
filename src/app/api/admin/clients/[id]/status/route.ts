import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const { status } = await request.json();
    const resolvedParams = await Promise.resolve(context.params);
    const userId = resolvedParams.id;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    // Record immutable audit trail
    await createAuditLog({
      actorId: adminUser.id,
      actorRole: adminUser.roles[0] || 'ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: 'USER_ACCOUNT',
      resourceId: updatedUser.id,
      after: { status: updatedUser.status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized or failed to update user status' },
      { status: 500 }
    );
  }
}

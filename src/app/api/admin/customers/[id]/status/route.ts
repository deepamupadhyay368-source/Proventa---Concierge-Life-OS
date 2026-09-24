import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { isAppError } from '@/lib/errors';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status', fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, reason } = parsed.data;

    // Find user directly or by customerProfile
    let user = await db.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    });

    if (!user) {
      const profile = await db.customerProfile.findUnique({
        where: { id },
        include: { user: true },
      });
      if (profile) {
        user = { ...profile.user, customerProfile: profile } as any;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const previousStatus = user.status;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    // Record audit log
    await createAuditLog({
      actorId: adminUser.id,
      actorRole: adminUser.roles[0] || 'ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: 'UserStatus',
      resourceId: user.id,
      before: { status: previousStatus },
      after: { status: updatedUser.status, reason },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Customer status changed to ${status}`,
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: ADMIN privilege required' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update customer status' }, { status: 500 });
  }
}

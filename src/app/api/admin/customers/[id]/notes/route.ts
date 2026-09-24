import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { isAppError } from '@/lib/errors';
import { z } from 'zod';

const noteSchema = z.object({
  note: z.string().min(1, 'Note content cannot be empty').max(2000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const adminUser = await requireAdmin();
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid note', fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { note } = parsed.data;

    let customer = await db.customerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Save as internal audit note
    await createAuditLog({
      actorId: adminUser.id,
      actorRole: adminUser.roles[0] || 'ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: 'CustomerInternalNote',
      resourceId: customer.id,
      after: { note },
    });

    return NextResponse.json({
      success: true,
      message: 'Internal note saved successfully',
      note: {
        author: adminUser.name || adminUser.email,
        content: note,
        createdAt: new Date(),
      },
    }, { status: 201 });

  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: ADMIN privilege required' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Failed to add internal note' }, { status: 500 });
  }
}

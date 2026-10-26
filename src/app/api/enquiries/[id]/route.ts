import { NextRequest, NextResponse } from 'next/server';
import {
  getEnquiryByIdForViewer,
  updateCustomerEnquiryLifecycle,
} from '@/lib/marketplace/repository';
import { updateEnquiryStatusSchema } from '@/lib/marketplace/validation';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireAuth();
    const enquiry = getEnquiryByIdForViewer(id, {
      userId: user.id,
      isAdmin: isAdminOrModerator(user),
    });

    return NextResponse.json({ enquiry });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    const parsed = updateEnquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || 'Invalid enquiry status action',
      );
    }

    const updated = updateCustomerEnquiryLifecycle(
      user.id,
      id,
      parsed.data.action,
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'CUSTOMER',
      action: 'UPDATE',
      resourceType: 'CustomerEnquiry',
      resourceId: updated.id,
      after: { status: updated.status },
    });

    return NextResponse.json({ enquiry: updated });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

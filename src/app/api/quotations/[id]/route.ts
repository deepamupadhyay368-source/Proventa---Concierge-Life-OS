import { NextRequest, NextResponse } from 'next/server';
import { updateQuotationStatusByCustomer } from '@/lib/marketplace/repository';
import { updateQuotationCustomerStatusSchema } from '@/lib/marketplace/validation';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
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

    const parsed = updateQuotationCustomerStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || 'Invalid quotation action',
      );
    }

    const quotation = await updateQuotationStatusByCustomer(
      user.id,
      id,
      parsed.data.action,
      parsed.data.customerNote,
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'CUSTOMER',
      action: 'UPDATE',
      resourceType: 'BusinessQuotation',
      resourceId: quotation.id,
      after: {
        status: quotation.status,
        action: parsed.data.action,
      },
    });

    return NextResponse.json({ quotation });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getEnquiryByIdForViewer,
  submitOrUpdateQuotation,
} from '@/lib/marketplace/repository';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { isAppError, toSafeError } from '@/lib/errors';
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

    return NextResponse.json({
      quotations: enquiry.quotations ?? [],
      total: (enquiry.quotations ?? []).length,
    });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'quote_submit',
      max: 20,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    const user = await requireAuth();
    const body = await req.json();

    const quotation = await submitOrUpdateQuotation(
      user.id,
      {
        ...body,
        enquiryId: id,
      },
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'CREATE',
      resourceType: 'BusinessQuotation',
      resourceId: quotation.id,
      after: {
        referenceCode: quotation.referenceCode,
        enquiryId: quotation.enquiryId,
        businessId: quotation.businessId,
        priceType: quotation.priceType,
        priceAmount: quotation.priceAmount,
      },
    });

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  createCustomerEnquiry,
  listEnquiriesForCustomer,
  listMatchedEnquiriesForBusiness,
} from '@/lib/marketplace/repository';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (businessId) {
      const matched = listMatchedEnquiriesForBusiness(
        user.id,
        businessId,
        isAdminOrModerator(user),
      );
      return NextResponse.json({ items: matched, total: matched.length });
    }

    const enquiries = listEnquiriesForCustomer(user.id);
    return NextResponse.json({ items: enquiries, total: enquiries.length });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'enquiry_create',
      max: 20,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    const user = await requireAuth();
    const body = await req.json();

    const result = await createCustomerEnquiry(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      body,
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'CUSTOMER',
      action: 'CREATE',
      resourceType: 'CustomerEnquiry',
      resourceId: result.enquiry.id,
      after: {
        referenceCode: result.enquiry.referenceCode,
        title: result.enquiry.title,
        city: result.enquiry.city,
        matchedBusinessesCount: result.matchedBusinessesCount,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

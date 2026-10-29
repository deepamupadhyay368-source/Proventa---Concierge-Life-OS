import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';
import { submitMissionQuotation } from '@/lib/marketplace/mission-service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    if (!body.businessId) {
      throw new ValidationError('businessId is required.');
    }
    if (!body.summary || !body.detailedProposal) {
      throw new ValidationError('Proposal summary and detailed specifications are required.');
    }
    if (!body.deliveryTimeline) {
      throw new ValidationError('Committed delivery timeline is required.');
    }

    const mission = await submitMissionQuotation(
      id,
      {
        id: user.id,
        name: user.name,
      },
      {
        businessId: body.businessId,
        summary: body.summary,
        detailedProposal: body.detailedProposal,
        priceType: body.priceType || 'FIXED_QUOTE',
        priceAmount: body.priceAmount ? Number(body.priceAmount) : undefined,
        priceMaxAmount: body.priceMaxAmount ? Number(body.priceMaxAmount) : undefined,
        deliveryTimeline: body.deliveryTimeline,
        validityDays: body.validityDays ? Number(body.validityDays) : 14,
        inclusions: Array.isArray(body.inclusions) ? body.inclusions : undefined,
        exclusions: body.exclusions,
        terms: body.terms,
      },
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'CREATE',
      resourceType: 'BusinessQuotation',
      resourceId: id,
      after: {
        businessId: body.businessId,
        priceAmount: body.priceAmount,
        deliveryTimeline: body.deliveryTimeline,
      },
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

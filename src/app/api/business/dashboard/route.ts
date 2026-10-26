import { NextRequest, NextResponse } from 'next/server';
import {
  addBusinessTeamMember,
  getBusinessDashboardSummary,
} from '@/lib/marketplace/repository';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || undefined;

    const summary = getBusinessDashboardSummary(
      user.id,
      businessId,
      isAdminOrModerator(user),
    );

    return NextResponse.json({ dashboard: summary });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const team = addBusinessTeamMember(
      user.id,
      String(body.businessId || ''),
      {
        userId: String(body.userId || body.email || ''),
        email: body.email ? String(body.email) : undefined,
        name: body.name ? String(body.name) : undefined,
        role: body.role || 'RESPONDER',
      },
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: 'BUSINESS_OWNER',
      action: 'CREATE',
      resourceType: 'BusinessMembership',
      resourceId: String(body.businessId || ''),
      after: { memberEmail: body.email, role: body.role },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

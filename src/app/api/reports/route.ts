import { NextRequest, NextResponse } from 'next/server';
import { createModerationReport } from '@/lib/marketplace/repository';
import { requireAuth } from '@/lib/auth/session';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'report_submit',
      max: 10,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    const user = await requireAuth();
    const body = await req.json();

    const report = createModerationReport(user.id, body);

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'CUSTOMER',
      action: 'CREATE',
      resourceType: 'ModerationReport',
      resourceId: report.id,
      after: {
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

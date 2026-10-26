import { NextRequest, NextResponse } from 'next/server';
import {
  executeAdminModeration,
  getAdminMarketplaceOverview,
} from '@/lib/marketplace/repository';
import { adminModerationActionSchema } from '@/lib/marketplace/validation';
import { requireModerator } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireModerator();
    const overview = getAdminMarketplaceOverview();
    return NextResponse.json(overview);
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireModerator();
    const body = await req.json();

    const parsed = adminModerationActionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || 'Invalid moderation action request',
      );
    }

    const result = await executeAdminModeration(admin.id, parsed.data);

    await createAuditLog({
      actorId: admin.id,
      actorRole: admin.roles?.[0] ?? 'ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: parsed.data.resourceType,
      resourceId: parsed.data.resourceId,
      after: {
        action: parsed.data.action,
        verificationLevel: parsed.data.verificationLevel,
        note: parsed.data.note,
      },
    });

    return NextResponse.json({ result });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

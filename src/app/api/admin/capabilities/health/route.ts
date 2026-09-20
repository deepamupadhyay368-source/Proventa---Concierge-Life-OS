import { NextRequest, NextResponse } from 'next/server';
import { requireConcierge, requireSuperAdmin } from '@/lib/auth/session';
import { ExecutionRouter } from '@/lib/capabilities/execution-router';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let sessionUser: any;
    try {
      sessionUser = await requireConcierge();
    } catch {
      // ignore
    }
    if (!sessionUser) {
      sessionUser = await requireSuperAdmin();
    }

    const capabilitiesHealth = ExecutionRouter.getCapabilitiesHealth();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      capabilities: capabilitiesHealth,
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 403 });
  }
}

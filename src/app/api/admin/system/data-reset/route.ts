import { NextRequest, NextResponse } from 'next/server';
import { requireFounder, requireSuperAdmin } from '@/lib/auth/session';
import { OperationalResetService } from '@/lib/admin/operational-reset-service';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const preview = await OperationalResetService.generatePreview();
    return NextResponse.json({ success: true, preview });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireFounder();
    const body = await req.json();
    const { confirmationText } = body;

    if (!confirmationText) {
      return NextResponse.json({ error: 'confirmationText is required' }, { status: 400 });
    }

    const result = await OperationalResetService.executeReset({
      confirmationText,
      actorId: admin.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Failed to execute reset' }, { status: 500 });
  }
}

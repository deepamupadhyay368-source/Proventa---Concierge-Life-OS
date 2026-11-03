import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { executeCascadeAccountClosure } from '@/lib/privacy/privacy-engine';
import { csrfProtection } from '@/lib/security/csrf';

export async function POST(req: NextRequest) {
  const csrfErr = csrfProtection(req);
  if (csrfErr) return csrfErr;

  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const confirmation = body.confirmation;

    if (!confirmation) {
      return NextResponse.json(
        { success: false, error: 'Confirmation phrase "PERMANENT_ERASURE" required.' },
        { status: 400 },
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const result = await executeCascadeAccountClosure({
      userId: user.id,
      confirmation,
      ipAddress,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Account closure request failed' },
      { status: 500 },
    );
  }
}

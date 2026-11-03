import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { listUserConsents, recordConsent, withdrawConsent } from '@/lib/privacy/privacy-engine';
import { csrfProtection } from '@/lib/security/csrf';

export async function GET() {
  try {
    const user = await requireAuth();
    const consents = await listUserConsents(user.id);
    return NextResponse.json({ success: true, data: consents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const csrfErr = csrfProtection(req);
  if (csrfErr) return csrfErr;

  try {
    const user = await requireAuth();
    const body = await req.json();
    const { consentType, accepted, version } = body;

    if (!consentType) {
      return NextResponse.json({ success: false, error: 'consentType is required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') || undefined;

    const ok = await recordConsent({
      userId: user.id,
      consentType,
      version: version || '2026.1',
      accepted: Boolean(accepted),
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unauthorized' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const csrfErr = csrfProtection(req);
  if (csrfErr) return csrfErr;

  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const consentType = searchParams.get('consentType');

    if (!consentType) {
      return NextResponse.json({ success: false, error: 'consentType is required' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') || undefined;

    const ok = await withdrawConsent({
      userId: user.id,
      consentType: consentType as any,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: ok, message: 'Consent successfully withdrawn.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unauthorized' }, { status: 500 });
  }
}

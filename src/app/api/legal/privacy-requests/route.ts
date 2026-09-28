import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitPrivacyRequest } from '@/lib/legal/consent';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { getSession } from '@/lib/auth/session';

const privacyRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  name: z.string().max(100).optional(),
  requestType: z.enum([
    'DATA_ACCESS',
    'DATA_CORRECTION',
    'DATA_DELETION',
    'WITHDRAW_CONSENT',
    'PRIVACY_COMPLAINT',
    'OTHER',
  ]),
  details: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 60_000, keyPrefix: 'privacy-req' });
  if (rl) return rl;

  try {
    const session = await getSession();
    const body = await req.json();
    const parsed = privacyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email, name, requestType, details } = parsed.data;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    const request = await submitPrivacyRequest({
      email,
      name,
      requestType,
      details,
      userId: session?.user?.id,
      ipAddress,
    });

    return NextResponse.json(
      {
        success: true,
        requestId: request.id,
        message:
          'Your privacy request has been securely recorded. Our data protection desk will review and respond to the provided email address.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/legal/privacy-requests]', error);
    return NextResponse.json(
      { error: 'Failed to submit privacy request. Please try again or contact privacy@proventa.in.' },
      { status: 500 }
    );
  }
}

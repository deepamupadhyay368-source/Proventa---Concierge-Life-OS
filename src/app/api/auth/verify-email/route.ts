import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/tokens';
import { trackEvent } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in?error=invalid_token', req.url));
  }

  const tokenHash = hashToken(token);
  const verification = await db.emailVerification.findFirst({
    where: { token: tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
  });

  if (!verification) {
    return NextResponse.redirect(new URL('/sign-in?error=invalid_or_expired_token', req.url));
  }

  await db.$transaction([
    db.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date(), status: 'ACTIVE' },
    }),
  ]);

  void trackEvent({ event: 'verification_completed', userId: verification.userId });

  return NextResponse.redirect(new URL('/sign-in?verified=true', req.url));
}

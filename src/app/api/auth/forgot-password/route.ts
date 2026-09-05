import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePasswordResetToken, hashToken } from '@/lib/auth/tokens';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email/sender';
import { createSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 3, windowMs: 15 * 60_000, keyPrefix: 'forgot-pw' });
  if (rl) return rl;

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase(), deletedAt: null } });

    // Always return same response (enumeration protection)
    if (user && user.status === 'ACTIVE') {
      const token = generatePasswordResetToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate existing reset tokens
      await db.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await db.passwordReset.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      void sendPasswordResetEmail({ email: user.email, name: user.name ?? 'there', token });
      void createSecurityEvent('PASSWORD_RESET_REQUESTED', { userId: user.id });
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgot-password]', error);
    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
  }
}

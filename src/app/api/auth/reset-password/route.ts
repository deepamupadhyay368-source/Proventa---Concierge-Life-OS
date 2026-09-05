import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/tokens';
import { hashPassword } from '@/lib/auth/password';
import { passwordResetSchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 15 * 60_000, keyPrefix: 'reset-pw' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = passwordResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 422 });
    }

    const { token, password } = parsed.data;
    const tokenHash = hashToken(token);

    const reset = await db.passwordReset.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!reset) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    const newHash = await hashPassword(password);

    await db.$transaction([
      db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      db.user.update({ where: { id: reset.userId }, data: { passwordHash: newHash } }),
    ]);

    void createSecurityEvent('PASSWORD_RESET_COMPLETED', { userId: reset.userId });

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('[reset-password]', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}

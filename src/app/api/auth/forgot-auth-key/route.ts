import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAuthKeyRecoveryToken, hashToken } from '@/lib/auth/tokens';
import { forgotAuthenticationKeySchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 3, windowMs: 15 * 60_000, keyPrefix: 'forgot-auth-key' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = forgotAuthenticationKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        message: 'If an account exists with that email, an Authentication Key recovery link has been dispatched.',
      });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail, deletedAt: null },
    });

    // Always return uniform message to prevent account enumeration
    if (user && user.status === 'ACTIVE') {
      const recoveryToken = generateAuthKeyRecoveryToken();
      const tokenHash = hashToken(recoveryToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      // Invalidate existing active recovery tokens
      await db.authKeyReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await db.authKeyReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined,
        },
      });

      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;

      void createSecurityEvent('AUTH_KEY_RECOVERY_STARTED', {
        userId: user.id,
        ipAddress,
        userAgent,
      });

      void createAuditLog({
        actorId: user.id,
        action: 'UPDATE',
        resourceType: 'AuthKeyRecovery',
        resourceId: user.id,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({
      message: 'If an account exists with that email, an Authentication Key recovery link has been dispatched.',
    });
  } catch (error) {
    console.error('[forgot-auth-key]', error);
    return NextResponse.json({
      message: 'If an account exists with that email, an Authentication Key recovery link has been dispatched.',
    });
  }
}

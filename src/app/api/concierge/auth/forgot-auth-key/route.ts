import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAuthKeyRecoveryToken, hashToken } from '@/lib/auth/tokens';
import { forgotAuthenticationKeySchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 3, windowMs: 15 * 60_000, keyPrefix: 'concierge-forgot-auth-key' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = forgotAuthenticationKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        message: 'If a valid Concierge employee account exists, an Authentication Key recovery token has been dispatched.',
      });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail, deletedAt: null },
      include: { userRoles: true },
    });

    const roles = user?.userRoles?.map((r) => r.role) || [];
    const isConcierge = roles.some((r) =>
      ['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN', 'FOUNDER', 'SUPER_ADMIN'].includes(r)
    );

    if (user && isConcierge && user.status === 'ACTIVE') {
      const recoveryToken = generateAuthKeyRecoveryToken();
      const tokenHash = hashToken(recoveryToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

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
        data: { portal: 'concierge_ops' },
      });

      void createAuditLog({
        actorId: user.id,
        action: 'UPDATE',
        resourceType: 'ConciergeAuthKeyRecovery',
        resourceId: user.id,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({
      message: 'If a valid Concierge employee account exists, an Authentication Key recovery token has been dispatched.',
    });
  } catch (error) {
    console.error('[concierge-forgot-auth-key]', error);
    return NextResponse.json({
      message: 'If a valid Concierge employee account exists, an Authentication Key recovery token has been dispatched.',
    });
  }
}

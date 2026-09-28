import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/tokens';
import { hashAuthKey } from '@/lib/auth/password';
import { resetAuthenticationKeySchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 15 * 60_000, keyPrefix: 'concierge-reset-auth-key' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = resetAuthenticationKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reset request', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { token, newAuthenticationKey } = parsed.data;
    const tokenHash = hashToken(token);

    const resetRecord = await db.authKeyReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired Authentication Key recovery link.' },
        { status: 400 }
      );
    }

    const newKeyHash = await hashAuthKey(newAuthenticationKey);

    await db.$transaction([
      db.authKeyReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: resetRecord.userId },
        data: {
          securityKeyHash: newKeyHash,
          authKeyUpdatedAt: new Date(),
        },
      }),
    ]);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    void createSecurityEvent('AUTH_KEY_RESET', {
      userId: resetRecord.userId,
      ipAddress,
      userAgent,
      data: { portal: 'concierge_ops' },
    });

    void createAuditLog({
      actorId: resetRecord.userId,
      action: 'UPDATE',
      resourceType: 'ConciergeSecurityCredentials',
      resourceId: resetRecord.userId,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Your Concierge Authentication Key has been reset successfully. You may now sign in.',
    });
  } catch (error) {
    console.error('[concierge-reset-auth-key]', error);
    return NextResponse.json(
      { error: 'Failed to reset Authentication Key. Please try again.' },
      { status: 500 }
    );
  }
}

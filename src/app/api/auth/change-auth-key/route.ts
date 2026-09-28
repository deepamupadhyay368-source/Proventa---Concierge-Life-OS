import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { verifyAuthKey, hashAuthKey } from '@/lib/auth/password';
import { changeAuthenticationKeySchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 15 * 60_000, keyPrefix: 'change-auth-key' });
  if (rl) return rl;

  try {
    const userSession = await requireAuth();
    const body = await req.json();

    const parsed = changeAuthenticationKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { currentAuthenticationKey, newAuthenticationKey } = parsed.data;

    const user = await db.user.findUnique({
      where: { id: userSession.id, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // If user already has an Authentication Key, verify current key
    if (user.securityKeyHash) {
      const isCurrentValid = await verifyAuthKey(currentAuthenticationKey, user.securityKeyHash);
      if (!isCurrentValid) {
        void createSecurityEvent('AUTH_KEY_FAILED', {
          userId: user.id,
          data: { action: 'change_key', reason: 'current_key_invalid' },
        });
        return NextResponse.json(
          { error: 'Current Proventa Authentication Key is incorrect.' },
          { status: 400 }
        );
      }
    }

    const newKeyHash = await hashAuthKey(newAuthenticationKey);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          securityKeyHash: newKeyHash,
          authKeyUpdatedAt: new Date(),
        },
      }),
      // Invalidate existing sessions to force fresh login with new key
      db.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    void createSecurityEvent('AUTH_KEY_CHANGED', {
      userId: user.id,
      ipAddress,
      userAgent,
      data: { method: 'self_service_change' },
    });

    void createAuditLog({
      actorId: user.id,
      actorRole: userSession.roles[0] || 'CUSTOMER',
      action: 'UPDATE',
      resourceType: 'UserSecurityCredentials',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Your Proventa Authentication Key has been updated successfully. Please sign in again.',
    });
  } catch (error: any) {
    if (error?.code === 'AUTHENTICATION_REQUIRED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('[change-auth-key]', error);
    return NextResponse.json(
      { error: 'Failed to update Authentication Key. Please try again.' },
      { status: 500 }
    );
  }
}

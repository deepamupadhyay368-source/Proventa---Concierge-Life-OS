import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getConciergeSession } from '@/lib/auth/concierge-session';
import { verifyAuthKey, hashAuthKey } from '@/lib/auth/password';
import { changeAuthenticationKeySchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 15 * 60_000, keyPrefix: 'concierge-change-auth-key' });
  if (rl) return rl;

  try {
    const session = await getConciergeSession(req);
    if (!session?.id) {
      return NextResponse.json({ error: 'Concierge authentication required' }, { status: 401 });
    }

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
      where: { id: session.id, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({ error: 'Employee account not found' }, { status: 404 });
    }

    if (user.securityKeyHash) {
      const isCurrentValid = await verifyAuthKey(currentAuthenticationKey, user.securityKeyHash);
      if (!isCurrentValid) {
        void createSecurityEvent('AUTH_KEY_FAILED', {
          userId: user.id,
          data: { context: 'concierge_change_key', reason: 'current_key_invalid' },
        });
        return NextResponse.json(
          { error: 'Current Proventa Authentication Key is incorrect.' },
          { status: 400 }
        );
      }
    }

    const newKeyHash = await hashAuthKey(newAuthenticationKey);

    await db.user.update({
      where: { id: user.id },
      data: {
        securityKeyHash: newKeyHash,
        authKeyUpdatedAt: new Date(),
      },
    });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    void createSecurityEvent('AUTH_KEY_CHANGED', {
      userId: user.id,
      ipAddress,
      userAgent,
      data: { portal: 'concierge_ops' },
    });

    void createAuditLog({
      actorId: user.id,
      actorRole: session.roles[0] || 'CONCIERGE',
      action: 'UPDATE',
      resourceType: 'ConciergeSecurityCredentials',
      resourceId: user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Your Concierge Authentication Key has been updated successfully.',
    });
  } catch (error) {
    console.error('[concierge-change-auth-key]', error);
    return NextResponse.json(
      { error: 'Failed to update Authentication Key. Please try again.' },
      { status: 500 }
    );
  }
}

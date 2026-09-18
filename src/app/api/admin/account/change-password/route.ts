import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { checkRateLimitAsync } from '@/lib/security/rate-limit';
import { createAuditLog, createSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireSuperAdmin();

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Strict rate limiting: max 5 attempts per 15 minutes per user/IP
    const rateLimitKey = `rl:admin:change-password:${sessionUser.id}:${ip}`;
    const rl = await checkRateLimitAsync(rateLimitKey, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });

    if (!rl.allowed) {
      void createSecurityEvent('RATE_LIMIT_HIT', {
        userId: sessionUser.id,
        ipAddress: ip,
        userAgent,
        data: { endpoint: '/api/admin/account/change-password' },
      });

      return NextResponse.json(
        { error: 'Security threshold reached: too many attempts. Please try again after 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid password payload';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch user from DB
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'User account not found or has no local credentials' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      void createSecurityEvent('LOGIN_FAILED', {
        userId: user.id,
        ipAddress: ip,
        userAgent,
        data: { reason: 'invalid_current_password_during_change' },
      });

      return NextResponse.json(
        { error: 'Current password does not match.' },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in DB
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // Invalidate existing sessions
    await db.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Log the security event and audit trail (NEVER log plaintext passwords or hashes)
    await createAuditLog({
      actorId: user.id,
      actorRole: 'SUPER_ADMIN',
      action: 'ADMIN_ACTION',
      resourceType: 'USER_CREDENTIALS',
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
    });

    await createSecurityEvent('PASSWORD_RESET_COMPLETED', {
      userId: user.id,
      ipAddress: ip,
      userAgent,
      data: { reason: 'founder_password_changed' },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. Existing sessions have been revoked.',
    });
  } catch (error: any) {
    if (error?.name === 'AuthorizationError' || error?.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized: SUPER_ADMIN required' }, { status: 403 });
    }
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSecurityEvent } from '@/lib/audit';
import { checkRateLimitAsync, getRateLimitKey } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(req, 'passkey-recovery');
    const rateLimit = await checkRateLimitAsync(rateLimitKey, {
      max: 5,
      windowMs: 15 * 60 * 1000, // 5 requests per 15 minutes
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many recovery requests. Please wait 15 minutes before retrying.' },
        { status: 429, headers: { 'Retry-After': '900' } },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Google identity verification required to recover pass key' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { newPassKey, confirmPassKey } = body;

    const cleanNew = typeof newPassKey === 'string' ? newPassKey.replace(/[^0-9]/g, '') : '';
    const cleanConfirm = typeof confirmPassKey === 'string' ? confirmPassKey.replace(/[^0-9]/g, '') : '';

    if (!/^\d{12}$/.test(cleanNew)) {
      return NextResponse.json(
        { success: false, error: 'New PROVENTA Pass Key must be exactly 12 numeric digits.' },
        { status: 400 },
      );
    }

    if (cleanNew !== cleanConfirm) {
      return NextResponse.json(
        { success: false, error: 'Pass Key confirmation does not match.' },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // Hash the customer's chosen 12-digit pass key using salted bcrypt (cost factor 12)
    const passKeyHash = await bcrypt.hash(cleanNew, 12);

    // Rotate the user's security key hash
    await db.user.update({
      where: { id: userId },
      data: {
        securityKeyHash: passKeyHash,
        authKeyUpdatedAt: new Date(),
      },
    });

    void createSecurityEvent('AUTH_KEY_ROTATED', {
      userId,
      data: { source: 'customer_created_recovery' },
    });

    return NextResponse.json({
      success: true,
      message: 'PROVENTA Pass Key updated successfully. Please sign in with your new key.',
      userId,
    });
  } catch (error) {
    console.error('[API /api/auth/recover-passkey] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to rotate pass key' },
      { status: 500 },
    );
  }
}

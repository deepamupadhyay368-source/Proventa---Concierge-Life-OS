import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { generateProventaAccessKey } from '@/lib/auth/access-key';
import { createSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication with Google required to recover pass key' },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Generate brand-new 12-digit numeric PROVENTA Pass Key
    const { plaintextKey, formattedKey, hash: passKeyHash } = await generateProventaAccessKey();

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
      data: { source: 'google_identity_recovery' },
    });

    return NextResponse.json({
      success: true,
      passKey: formattedKey,
      rawDigits: plaintextKey,
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

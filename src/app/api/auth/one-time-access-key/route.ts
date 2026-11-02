import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { consumeOneTimeAccessKey, generateProventaAccessKey } from '@/lib/auth/access-key';
import { db } from '@/lib/db';
import { createSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * GET: Consumes a staged one-time access key for a newly registered user.
 * Returns the plaintext key once, then immediately destroys it from memory.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = consumeOneTimeAccessKey(session.user.id);
  return NextResponse.json({
    hasKey: Boolean(key),
    accessKey: key,
  });
}

/**
 * POST: Rotates the user's PROVENTA Access Key.
 * Generates a new key, saves its hash, and returns the new plaintext key once.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plaintextKey, hash } = await generateProventaAccessKey();

  await db.user.update({
    where: { id: session.user.id },
    data: {
      securityKeyHash: hash,
      authKeyUpdatedAt: new Date(),
    },
  });

  void createSecurityEvent('AUTH_KEY_ROTATED', {
    userId: session.user.id,
    data: { reason: 'user_requested_rotation' },
  });

  return NextResponse.json({
    success: true,
    newAccessKey: plaintextKey,
    updatedAt: new Date().toISOString(),
  });
}

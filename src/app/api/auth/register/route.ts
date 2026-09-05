import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateVerificationToken, hashToken } from '@/lib/auth/tokens';
import { registerSchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';
import { ConflictError, ValidationError } from '@/lib/errors';
import { sendVerificationEmail } from '@/lib/email/sender';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 5, windowMs: 60_000, keyPrefix: 'auth-register' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    const { name, email, password } = parsed.data;

    // Check for existing user — timing-safe (don't reveal if email exists)
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      // Return success-like response to prevent email enumeration
      return NextResponse.json({ message: 'If this email is not already registered, you will receive a verification email.' });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const tokenHash = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        status: 'PENDING_VERIFICATION',
        userRoles: { create: [{ role: 'CUSTOMER' }] },
        emailVerifications: {
          create: { token: tokenHash, expiresAt },
        },
      },
    });

    // Create customer profile
    await db.customerProfile.create({ data: { userId: user.id } });

    // Send verification email (non-blocking)
    void sendVerificationEmail({ email, name, token: verificationToken });

    void trackEvent({ event: 'account_created', userId: user.id });
    void createAuditLog({ actorId: user.id, action: 'CREATE', resourceType: 'User', resourceId: user.id });

    return NextResponse.json(
      { message: 'Account created. Please check your email to verify your account.' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

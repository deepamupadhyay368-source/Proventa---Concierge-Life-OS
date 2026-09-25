import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { UserRole } from '@prisma/client';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 10, windowMs: 60_000, keyPrefix: 'concierge-signup' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      employeeId,
      role = 'CONCIERGE',
      department = 'National Concierge Desk',
      city = 'Ahmedabad',
      inviteCode,
    } = body;

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Full legal/display name is required (min 2 characters)' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid work email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
      include: { userRoles: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Check if auto-activation applies (e.g. correct invite code or specific dev setting)
    const validInviteCode = process.env.CONCIERGE_INVITE_CODE || 'PROVENTA-CONCIERGE-2026';
    const isAutoActive = inviteCode === validInviteCode;

    const initialStatus = isAutoActive ? 'ACTIVE' : 'PENDING_VERIFICATION';

    // Validate requested role — only operational roles allowed during signup
    const requestedRole = (
      role === 'SENIOR_CONCIERGE' ? 'SENIOR_CONCIERGE' : 'CONCIERGE'
    ) as UserRole;

    // Create user with transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : null,
          passwordHash,
          status: initialStatus,
          emailVerified: isAutoActive ? new Date() : null,
          userRoles: {
            create: [
              {
                role: requestedRole,
                grantedBy: isAutoActive ? 'SYSTEM_INVITE' : 'SELF_REGISTRATION',
              },
            ],
          },
        },
      });

      // Create linked ConciergeAgent profile
      await tx.conciergeAgent.create({
        data: {
          userId: user.id,
          isOnline: false,
          maxConcurrentRequests: requestedRole === 'SENIOR_CONCIERGE' ? 15 : 10,
          timezone: 'Asia/Kolkata',
          shiftStart: '09:00',
          shiftEnd: '21:00',
          active: isAutoActive,
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      status: initialStatus,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: requestedRole,
        department,
        city,
      },
      message: isAutoActive
        ? 'Employee account created and activated. You may now sign in to Concierge Desk.'
        : 'Employee registration submitted successfully. Your account is pending manager verification and operational role activation.',
    });
  } catch (error: any) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[Concierge Signup Error]', error);
    return NextResponse.json({ error: 'Failed to create employee account. Please try again.' }, { status: 500 });
  }
}

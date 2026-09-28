import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, hashAuthKey } from '@/lib/auth/password';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { createSecurityEvent, createAuditLog } from '@/lib/audit';
import { conciergeSignUpSchema } from '@/lib/validation/schemas';
import { UserRole } from '@prisma/client';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 10, windowMs: 60_000, keyPrefix: 'concierge-signup' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = conciergeSignUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      authenticationKey,
      employeeId,
      role = 'CONCIERGE',
      department = 'National Concierge Desk',
      city = 'Ahmedabad',
      inviteCode,
    } = parsed.data;

    const cleanEmail = email.trim().toLowerCase();

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
    const securityKeyHash = await hashAuthKey(authenticationKey);

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
          securityKeyHash,
          authKeyUpdatedAt: new Date(),
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

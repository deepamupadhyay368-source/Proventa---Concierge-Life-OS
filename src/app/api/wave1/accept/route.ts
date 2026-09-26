import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/tokens';
import { hashPassword } from '@/lib/auth/password';
import { passwordSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog, createSecurityEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const acceptSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
  securityKey: z.string().min(4, 'Security Key must be at least 4 characters').max(32).optional(),
  confirmSecurityKey: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => !data.securityKey || !data.confirmSecurityKey || data.securityKey === data.confirmSecurityKey, {
  message: 'Security keys do not match',
  path: ['confirmSecurityKey'],
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No invitation token provided' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const invitation = await db.invitation.findFirst({
      where: {
        tokenHash,
      },
      include: { registration: true },
    });

    if (!invitation) {
      return NextResponse.json({ valid: false, error: 'Invitation link is invalid.' }, { status: 404 });
    }

    if (invitation.revokedAt) {
      return NextResponse.json({ valid: false, error: 'This invitation has been revoked.' }, { status: 410 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ valid: false, error: 'This invitation has already been accepted. Please sign in.' }, { status: 409 });
    }

    if (invitation.expiresAt <= new Date()) {
      return NextResponse.json({ valid: false, error: 'This invitation has expired. Contact your concierge.' }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      name: invitation.registration.name,
      email: invitation.registration.email,
      city: invitation.registration.city,
      expiresAt: invitation.expiresAt.toISOString(),
      status: 'PENDING_ACCEPTANCE',
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: 'Failed to verify invitation' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = acceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { token, password, securityKey } = parsed.data;
    const tokenHash = hashToken(token);

    const invitation = await db.invitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { registration: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'This invitation is invalid, expired, or already used.' }, { status: 400 });
    }

    const { registration } = invitation;

    let user = await db.user.findUnique({ where: { email: registration.email } });
    const passwordHash = await hashPassword(password);
    const securityKeyHash = securityKey ? await hashPassword(securityKey) : null;

    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          securityKeyHash: securityKeyHash || user.securityKeyHash,
          status: 'ACTIVE',
          emailVerified: new Date(),
        },
      });
    } else {
      user = await db.user.create({
        data: {
          email: registration.email,
          name: registration.name,
          phone: registration.phone,
          passwordHash,
          securityKeyHash,
          status: 'ACTIVE',
          emailVerified: new Date(),
          userRoles: {
            create: [{ role: 'CUSTOMER' }],
          },
        },
      });
    }

    await db.customerProfile.upsert({
      where: { userId: user.id },
      update: {
        city: registration.city,
      },
      create: {
        userId: user.id,
        city: registration.city,
        preferredComm: (registration.communicationPref as any) || 'IN_APP',
      },
    });

    await db.$transaction([
      db.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
      db.earlyAccessRegistration.update({
        where: { id: registration.id },
        data: {
          status: 'REGISTERED',
          convertedUserId: user.id,
          onboardedAt: new Date(),
        },
      }),
    ]);

    void trackEvent({ event: 'invitation_sent', userId: user.id, properties: { email: user.email } });
    void createAuditLog({ actorId: user.id, action: 'INVITE_ACCEPTED', resourceType: 'Invitation', resourceId: invitation.id });
    void createSecurityEvent('LOGIN_SUCCESS', { userId: user.id, data: { source: 'wave1_acceptance' } });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Invitation accepted. Welcome to Proventa Private Beta Wave 1!',
    });
  } catch (error) {
    console.error('[wave1/accept]', error);
    return NextResponse.json({ error: 'Failed to accept invitation. Please try again.' }, { status: 500 });
  }
}

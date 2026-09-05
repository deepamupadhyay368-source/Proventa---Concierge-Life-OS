import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/auth/tokens';
import { hashPassword } from '@/lib/auth/password';
import { passwordSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog, createSecurityEvent } from '@/lib/audit';

const acceptSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = acceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { token, password } = parsed.data;
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
      return NextResponse.json({ error: 'This invitation is invalid or has expired.' }, { status: 400 });
    }

    const { registration } = invitation;

    let user = await db.user.findUnique({ where: { email: registration.email } });
    const passwordHash = await hashPassword(password);

    if (user) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
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
        },
      }),
    ]);

    void trackEvent({ event: 'invitation_sent', userId: user.id, properties: { email: user.email } });
    void createAuditLog({ actorId: user.id, action: 'INVITE_ACCEPTED', resourceType: 'Invitation', resourceId: invitation.id });
    void createSecurityEvent('LOGIN_SUCCESS', { userId: user.id, data: { source: 'wave1_acceptance' } });

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted. Welcome to Proventa Wave 1!',
    });
  } catch (error) {
    console.error('[wave1/accept]', error);
    return NextResponse.json({ error: 'Failed to accept invitation. Please try again.' }, { status: 500 });
  }
}

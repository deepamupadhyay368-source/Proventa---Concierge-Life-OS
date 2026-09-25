import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { generateInvitationToken, hashToken } from '@/lib/auth/tokens';
import { sendWave1InvitationEmail } from '@/lib/email/sender';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const [registrations, invitations] = await Promise.all([
      db.earlyAccessRegistration.findMany({
        orderBy: { registeredAt: 'desc' },
        include: { invitations: { orderBy: { sentAt: 'desc' } } },
      }),
      db.invitation.findMany({
        orderBy: { sentAt: 'desc' },
        include: { registration: true },
      }),
    ]);

    const stats = {
      totalRegistrations: registrations.length,
      waitlisted: registrations.filter((r) => r.status === 'WAITLISTED').length,
      invited: registrations.filter((r) => r.status === 'INVITED').length,
      registered: registrations.filter((r) => r.status === 'REGISTERED').length,
      active: registrations.filter((r) => r.status === 'ACTIVE').length,
      totalInvitations: invitations.length,
      activeInvitations: invitations.filter((i) => !i.acceptedAt && !i.revokedAt && i.expiresAt > new Date()).length,
      acceptedInvitations: invitations.filter((i) => i.acceptedAt).length,
      revokedInvitations: invitations.filter((i) => i.revokedAt).length,
      expiredInvitations: invitations.filter((i) => !i.acceptedAt && !i.revokedAt && i.expiresAt <= new Date()).length,
    };

    return NextResponse.json({
      registrations,
      invitations,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { action = 'CREATE', registrationId, name, email, phone, city = 'Ahmedabad', notes, invitationId } = body;

    // Action 1: Revoke Invitation
    if (action === 'REVOKE') {
      if (!invitationId) {
        return NextResponse.json({ error: 'invitationId is required for revocation' }, { status: 400 });
      }

      const inv = await db.invitation.findUnique({
        where: { id: invitationId },
        include: { registration: true },
      });

      if (!inv) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }

      await db.invitation.update({
        where: { id: invitationId },
        data: {
          revokedAt: new Date(),
          revokedBy: admin.id,
        },
      });

      if (inv.registration && inv.registration.status === 'INVITED') {
        await db.earlyAccessRegistration.update({
          where: { id: inv.registrationId },
          data: { status: 'WAITLISTED' },
        });
      }

      void createAuditLog({
        actorId: admin.id,
        action: 'ADMIN_ACTION',
        resourceType: 'Invitation',
        resourceId: invitationId,
        after: { action: 'REVOKE' },
      });

      return NextResponse.json({ success: true, message: 'Invitation revoked successfully' });
    }

    // Action 2: Resend Invitation (Revokes prior token & issues fresh cryptographic token)
    if (action === 'RESEND') {
      const regId = registrationId || (invitationId ? (await db.invitation.findUnique({ where: { id: invitationId } }))?.registrationId : null);
      if (!regId) {
        return NextResponse.json({ error: 'Valid registrationId or invitationId required for resend' }, { status: 400 });
      }

      const registration = await db.earlyAccessRegistration.findUnique({
        where: { id: regId },
      });

      if (!registration) {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
      }

      // Revoke all existing unaccepted tokens for this registration
      await db.invitation.updateMany({
        where: { registrationId: regId, acceptedAt: null, revokedAt: null },
        data: { revokedAt: new Date(), revokedBy: admin.id },
      });

      // Generate new secure invitation token
      const token = generateInvitationToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const newInv = await db.invitation.create({
        data: {
          registrationId: regId,
          tokenHash,
          expiresAt,
          sentBy: admin.id,
        },
      });

      await db.earlyAccessRegistration.update({
        where: { id: regId },
        data: {
          status: 'INVITED',
          invitedAt: new Date(),
        },
      });

      void sendWave1InvitationEmail({
        email: registration.email,
        name: registration.name,
        token,
      });

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.proventa.in'}/wave1/accept?token=${token}`;

      return NextResponse.json({
        success: true,
        invitationId: newInv.id,
        inviteUrl,
        message: 'New invitation link generated and email dispatched.',
      });
    }

    // Action 3: Create Direct Invitation (on the fly or from waitlist)
    let targetRegistrationId = registrationId;

    if (!targetRegistrationId) {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
      }
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'Customer name is required (min 2 characters)' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Upsert registration record
      const reg = await db.earlyAccessRegistration.upsert({
        where: { email: cleanEmail },
        update: {
          name: name.trim(),
          phone: phone ? phone.trim() : undefined,
          city: city || 'Ahmedabad',
          internalNotes: notes || undefined,
        },
        create: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : null,
          city: city || 'Ahmedabad',
          status: 'WAITLISTED',
          internalNotes: notes || 'Direct Founder Invitation',
          consentGiven: true,
        },
      });

      targetRegistrationId = reg.id;
    }

    const registration = await db.earlyAccessRegistration.findUnique({
      where: { id: targetRegistrationId },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    // Revoke any prior pending tokens to avoid duplicates
    await db.invitation.updateMany({
      where: { registrationId: targetRegistrationId, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date(), revokedBy: admin.id },
    });

    // Generate secure invitation token
    const token = generateInvitationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await db.invitation.create({
      data: {
        registrationId: targetRegistrationId,
        tokenHash,
        expiresAt,
        sentBy: admin.id,
      },
    });

    await db.earlyAccessRegistration.update({
      where: { id: targetRegistrationId },
      data: {
        status: 'INVITED',
        invitedAt: new Date(),
      },
    });

    // Send the email (non-blocking)
    void sendWave1InvitationEmail({
      email: registration.email,
      name: registration.name,
      token,
    });

    void trackEvent({
      event: 'invitation_sent',
      properties: { registrationId: targetRegistrationId, email: registration.email },
    });

    void createAuditLog({
      actorId: admin.id,
      action: 'INVITE_SENT',
      resourceType: 'EarlyAccessRegistration',
      resourceId: targetRegistrationId,
      after: { invitationId: invitation.id, email: registration.email },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.proventa.in'}/wave1/accept?token=${token}`;

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      inviteUrl,
      registration: {
        id: registration.id,
        name: registration.name,
        email: registration.email,
      },
      message: `Invitation generated for ${registration.name}. Link is ready to share.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

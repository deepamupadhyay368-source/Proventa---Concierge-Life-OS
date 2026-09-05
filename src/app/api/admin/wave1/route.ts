import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { generateInvitationToken, hashToken } from '@/lib/auth/tokens';
import { sendWave1InvitationEmail } from '@/lib/email/sender';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const registrations = await db.earlyAccessRegistration.findMany({
      orderBy: { registeredAt: 'desc' },
      include: { invitations: true },
    });
    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { registrationId } = await req.json();

    const registration = await db.earlyAccessRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Generate secure invitation token
    const token = generateInvitationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await db.invitation.create({
      data: {
        registrationId,
        tokenHash,
        expiresAt,
        sentBy: admin.id,
      },
    });

    await db.earlyAccessRegistration.update({
      where: { id: registrationId },
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
      properties: { registrationId, email: registration.email },
    });

    void createAuditLog({
      actorId: admin.id,
      action: 'INVITE_SENT',
      resourceType: 'EarlyAccessRegistration',
      resourceId: registrationId,
    });

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wave1/accept?token=${token}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

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

    const { name, email, password, phone, city, preferredComm, dob, address } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;
    const passwordHash = await hashPassword(password);

    // Check for existing user
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { userRoles: true, customerProfile: true },
    });

    if (existing) {
      // If the user already has a password set, guide them to sign in
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in or reset your password.' },
          { status: 409 },
        );
      }

      // Existing user without a password (e.g. founder, early access, or OAuth user)
      // Attach the new password credentials and activate immediately
      const updatedUser = await db.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          name: existing.name || name,
          phone: cleanPhone || existing.phone,
          status: 'ACTIVE',
          emailVerified: existing.emailVerified ?? new Date(),
        },
        include: { userRoles: true },
      });

      // Ensure customer profile exists
      await db.customerProfile.upsert({
        where: { userId: existing.id },
        update: {
          city: city || existing.customerProfile?.city || 'Ahmedabad',
          preferredComm: preferredComm || existing.customerProfile?.preferredComm || 'IN_APP',
        },
        create: {
          userId: existing.id,
          city: city || 'Ahmedabad',
          preferredComm: preferredComm || 'IN_APP',
        },
      });

      void trackEvent({ event: 'account_created', userId: existing.id });
      void createAuditLog({ actorId: existing.id, action: 'UPDATE', resourceType: 'User', resourceId: existing.id });

      const roles = updatedUser.userRoles.map((r) => r.role);
      const isAdmin = roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(r));

      return NextResponse.json({
        message: 'Credentials configured successfully. Your account is active.',
        email: updatedUser.email,
        name: updatedUser.name,
        isAdmin,
      });
    }

    // Completely new registration: Create active account with credentials
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        phone: cleanPhone,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: new Date(),
        userRoles: { create: [{ role: 'CUSTOMER' }] },
      },
      include: { userRoles: true },
    });

    // Create customer profile
    const profile = await db.customerProfile.create({
      data: {
        userId: user.id,
        city: city || 'Ahmedabad',
        preferredComm: preferredComm || 'IN_APP',
      },
    });

    // If initial address or dob provided, record as initial preferences
    if (address) {
      await db.customerPreference.create({
        data: {
          customerId: profile.id,
          category: 'general',
          key: 'residence_address',
          value: { address },
          source: 'explicit',
        },
      });
    }

    if (dob) {
      await db.customerPreference.create({
        data: {
          customerId: profile.id,
          category: 'personal',
          key: 'date_of_birth',
          value: { dob },
          source: 'explicit',
        },
      });
    }

    void trackEvent({ event: 'account_created', userId: user.id });
    void createAuditLog({ actorId: user.id, action: 'CREATE', resourceType: 'User', resourceId: user.id });

    return NextResponse.json(
      {
        message: 'Account created and activated successfully.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
        isAdmin: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateVerificationToken, hashToken } from '@/lib/auth/tokens';
import {
  generateProventaAccessKey,
  normalizePassKey,
  format12DigitPassKey,
  resetPassKeyRateLimit,
} from '@/lib/auth/access-key';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validation/schemas';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog, createSecurityEvent } from '@/lib/audit';
import { recordPolicyAcceptances } from '@/lib/legal/consent';
import { getOrCreateUserBusiness } from '@/lib/business/service';

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

    const {
      name,
      email,
      password,
      passKey,
      authenticationKey,
      securityKey,
      phone,
      city,
      preferredComm,
      dob,
      address,
      accountType,
    } = parsed.data;

    const rawAuthKey = passKey || authenticationKey || securityKey;

    let effectiveAuthKey: string;
    let formattedAuthKey: string;
    let securityKeyHash: string;

    if (rawAuthKey && rawAuthKey.trim()) {
      const normalized = normalizePassKey(rawAuthKey);
      effectiveAuthKey = normalized;
      formattedAuthKey = normalized.length === 12 ? format12DigitPassKey(normalized) : rawAuthKey.trim();
      securityKeyHash = await bcrypt.hash(normalized, 12);
    } else {
      const generated = await generateProventaAccessKey();
      effectiveAuthKey = generated.plaintextKey;
      formattedAuthKey = generated.formattedKey;
      securityKeyHash = generated.hash;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;
    const passwordHash = await hashPassword(password);
    const authKeyUpdatedAt = new Date();

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
      // Attach the new password credentials and preserve existing 12-digit pass key unless explicitly replaced
      const shouldUpdateKey = Boolean(rawAuthKey);
      const targetSecurityKeyHash = shouldUpdateKey
        ? securityKeyHash
        : (existing.securityKeyHash || securityKeyHash);
      const targetAuthKeyUpdatedAt = (shouldUpdateKey || !existing.securityKeyHash)
        ? new Date()
        : (existing.authKeyUpdatedAt || new Date());

      const updatedUser = await db.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          securityKeyHash: targetSecurityKeyHash,
          authKeyUpdatedAt: targetAuthKeyUpdatedAt,
          name: existing.name || name,
          phone: cleanPhone || existing.phone,
          status: 'ACTIVE',
          emailVerified: existing.emailVerified ?? new Date(),
        },
        include: { userRoles: true },
      });

      if (shouldUpdateKey || !existing.securityKeyHash) {
        void createSecurityEvent('AUTH_KEY_CREATED', { userId: existing.id });
      }

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

      resetPassKeyRateLimit(`passkey:${normalizedEmail}`);

      return NextResponse.json({
        message: 'Credentials configured successfully. Your account is active.',
        email: updatedUser.email,
        name: updatedUser.name,
        authenticationKey: formattedAuthKey,
        passKey: formattedAuthKey,
        isAdmin,
      });
    }

    // Completely new registration: Create active account with credentials
    // Assign specific platform roles based on selected account type
    const initialRoles: Array<{ role: 'CUSTOMER' | 'BUYER' | 'SUPPLIER' | 'BUSINESS_OWNER' }> = [{ role: 'CUSTOMER' }];
    if (accountType === 'SUPPLIER') {
      initialRoles.push({ role: 'SUPPLIER' }, { role: 'BUSINESS_OWNER' });
    } else if (accountType === 'BOTH') {
      initialRoles.push({ role: 'BUYER' }, { role: 'SUPPLIER' }, { role: 'BUSINESS_OWNER' });
    } else {
      initialRoles.push({ role: 'BUYER' }, { role: 'BUSINESS_OWNER' });
    }

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        phone: cleanPhone,
        passwordHash,
        securityKeyHash,
        authKeyUpdatedAt,
        status: 'ACTIVE',
        emailVerified: new Date(),
        userRoles: { create: initialRoles },
      },
      include: { userRoles: true },
    });

    if (securityKeyHash) {
      void createSecurityEvent('AUTH_KEY_CREATED', { userId: user.id });
    }

    // Initialize business draft with selected platform role
    try {
      const business = await getOrCreateUserBusiness(user.id);
      if (business && accountType) {
        await db.business.update({
          where: { id: business.id },
          data: {
            platformRole: accountType as any,
          },
        });
      }
    } catch (bizErr) {
      console.warn('[register] Failed to initialize business profile:', bizErr);
    }

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

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    // Record formal policy acceptances
    await recordPolicyAcceptances({
      userId: user.id,
      policyTypes: ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'PRIVATE_BETA_TERMS'],
      context: 'SIGNUP',
      ipAddress,
      userAgent,
    });

    void trackEvent({ event: 'account_created', userId: user.id });
    void createAuditLog({ actorId: user.id, action: 'CREATE', resourceType: 'User', resourceId: user.id, ipAddress, userAgent });

    resetPassKeyRateLimit(`passkey:${normalizedEmail}`);

    return NextResponse.json(
      {
        message: 'Account created and activated successfully.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
        authenticationKey: formattedAuthKey,
        passKey: formattedAuthKey,
        isAdmin: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}

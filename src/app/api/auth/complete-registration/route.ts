import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSecurityEvent } from '@/lib/audit';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { sendEmail } from '@/lib/email/sender';
import { resetPassKeyRateLimit } from '@/lib/auth/access-key';

export async function POST(req: NextRequest) {
  const rl = rateLimitMiddleware(req, { max: 10, windowMs: 60_000, keyPrefix: 'auth-complete-reg' });
  if (rl) return rl;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, phone, country, termsAccepted, passKey, confirmPassKey } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full legal name is required' },
        { status: 400 },
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Valid mobile number is required' },
        { status: 400 },
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: 'Terms of Service and Privacy Policy acceptance is required' },
        { status: 400 },
      );
    }

    // Validate customer-created 12-digit numeric Pass Key
    const cleanPassKey = typeof passKey === 'string' ? passKey.replace(/[^0-9]/g, '') : '';
    const cleanConfirmPassKey = typeof confirmPassKey === 'string' ? confirmPassKey.replace(/[^0-9]/g, '') : '';

    if (!/^\d{12}$/.test(cleanPassKey)) {
      return NextResponse.json(
        { success: false, error: 'PROVENTA Pass Key must be exactly 12 numeric digits.' },
        { status: 400 },
      );
    }

    if (cleanPassKey !== cleanConfirmPassKey) {
      return NextResponse.json(
        { success: false, error: '12-digit Pass Key confirmation does not match.' },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanCountry = (country || 'India').trim();

    // Hash customer-chosen 12-digit Pass Key with salted bcrypt (cost factor 12)
    const passKeyHash = await bcrypt.hash(cleanPassKey, 12);

    // 1. Update user record with salted hash (never store plaintext)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: cleanName,
        phone: cleanPhone,
        phoneVerified: new Date(),
        securityKeyHash: passKeyHash,
        authKeyUpdatedAt: new Date(),
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // 2. Update or create CustomerProfile
    await db.customerProfile.upsert({
      where: { userId },
      update: {
        city: cleanCountry,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
      create: {
        userId,
        city: cleanCountry,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    // 3. Record statutory policy acceptances
    try {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Browser';
      await db.policyAcceptance.createMany({
        data: [
          {
            userId,
            policyType: 'TERMS_OF_SERVICE',
            policyVersion: '2026.1',
            ipAddress: clientIp,
            userAgent,
          },
          {
            userId,
            policyType: 'PRIVACY_POLICY',
            policyVersion: '2026.1',
            ipAddress: clientIp,
            userAgent,
          },
        ],
        skipDuplicates: true,
      });
    } catch {
      // Non-fatal if audit table differs in migration
    }

    if (updatedUser.email) {
      resetPassKeyRateLimit(`passkey:${updatedUser.email.toLowerCase().trim()}`);
    }
    void createSecurityEvent('AUTH_KEY_CREATED', {
      userId,
      data: { source: 'customer_created_registration' },
    });

    // 4. Send registration confirmation email (NEVER email the pass key)
    if (updatedUser.email) {
      void sendEmail({
        to: updatedUser.email,
        subject: 'Welcome to PROVENTA — Account & Pass Key Established',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090B10; color: #F4F6FA; padding: 36px 24px; border-radius: 4px; max-width: 580px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #252C38; padding-bottom: 20px; margin-bottom: 24px;">
              <span style="font-size: 18px; font-weight: 900; letter-spacing: 0.1em; color: #2457FF; text-transform: uppercase;">PROVENTA</span>
              <p style="font-size: 11px; color: #858D9B; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.15em;">Industrial Procurement Platform</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #F4F6FA;">Hello ${cleanName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #C5CAD3;">
              Your PROVENTA sovereign account and customer-created 12-digit Pass Key have been successfully established.
            </p>
            <div style="background: #171C26; border-left: 3px solid #2457FF; padding: 16px; margin: 24px 0; font-size: 12px; color: #C5CAD3; line-height: 1.6;">
              <strong style="color: #F4F6FA; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Security &amp; Privacy Notice</strong>
              In accordance with our institutional zero-knowledge posture and DPDP statutory standards, your 12-digit Pass Key is protected by salted one-way hashing and is <strong>never transmitted over email or accessible to PROVENTA staff</strong>.
            </div>
            <p style="font-size: 13px; color: #C5CAD3; line-height: 1.6;">
              To access your procurement portal, sign in using your registered email and your chosen 12-digit Pass Key.
            </p>
            <div style="margin-top: 28px; text-align: center;">
              <a href="https://proventa.in/sign-in" style="display: inline-block; background: #2457FF; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 14px 28px; border-radius: 2px;">
                Sign In to PROVENTA
              </a>
            </div>
          </div>
        `,
      });
    }

    // Return success without leaking the pass key
    return NextResponse.json({
      success: true,
      message: 'Account and 12-digit Pass Key established successfully. Please sign in.',
      userId,
      workspaceId: `ind_${userId}`,
    });
  } catch (error) {
    console.error('[API /api/auth/complete-registration] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to complete registration' },
      { status: 500 },
    );
  }
}

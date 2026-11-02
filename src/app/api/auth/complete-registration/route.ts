import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { generateProventaAccessKey } from '@/lib/auth/access-key';
import { createSecurityEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, phone, country, termsAccepted } = body;

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

    const userId = session.user.id;
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanCountry = (country || 'India').trim();

    // Generate unique 12-digit numeric PROVENTA Pass Key
    const { plaintextKey, formattedKey, hash: passKeyHash } = await generateProventaAccessKey();

    // 1. Update user record
    await db.user.update({
      where: { id: userId },
      data: {
        name: cleanName,
        phone: cleanPhone,
        phoneVerified: new Date(),
        securityKeyHash: passKeyHash,
        authKeyUpdatedAt: new Date(),
        status: 'ACTIVE',
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

    void createSecurityEvent('AUTH_KEY_CREATED', {
      userId,
      data: { source: 'google_registration_complete' },
    });

    // Return the formatted 12-digit pass key to the client for single-view mandatory confirmation
    return NextResponse.json({
      success: true,
      passKey: formattedKey,
      rawDigits: plaintextKey,
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

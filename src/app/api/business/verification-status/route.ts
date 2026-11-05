import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const business = await db.business.findFirst({
      where: { ownerId: user.id },
      include: {
        documents: true,
        buyerProfile: true,
        supplierProfile: true,
      },
    });

    if (!business) {
      return NextResponse.json({
        success: true,
        data: {
          hasBusiness: false,
          verificationStatus: 'DRAFT',
          onboardingStep: 1,
        },
      });
    }

    // Check completeness
    const missing: string[] = [];
    if (!business.legalName) missing.push('Legal Business Name');
    if (!business.gstNumber) missing.push('GSTIN Registration Number');
    if (!business.pan) missing.push('Company PAN');
    if (business.documents.length === 0) missing.push('At least one verification document');

    return NextResponse.json({
      success: true,
      data: {
        hasBusiness: true,
        businessId: business.id,
        businessName: business.name,
        legalName: business.legalName,
        platformRole: business.platformRole,
        verificationStatus: business.verificationStatus,
        verificationLevel: business.verificationLevel,
        verificationSubmittedAt: business.verificationSubmittedAt,
        verificationReviewedAt: business.verificationReviewedAt,
        verificationNotes: business.verificationNotes,
        onboardingStep: business.onboardingStep,
        onboardingComplete: business.onboardingComplete,
        documentsCount: business.documents.length,
        missingRequirements: missing,
        isVerified: business.verificationStatus === 'VERIFIED',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';
import { PaymentIntelligenceService } from '@/lib/payment-intelligence/service';

/**
 * GET /api/payment-intelligence/score
 * Retrieve the payment score for a business.
 * Query params:
 *   businessId (required) — business to fetch score for
 *   scoreType  (optional) — BUYER | SUPPLIER | DUAL (defaults to DUAL)
 *
 * POST /api/payment-intelligence/score
 * Trigger a score recalculation for a business.
 * Body: { businessId, scoreType }
 * Requires authentication.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const scoreType = (searchParams.get('scoreType') as 'BUYER' | 'SUPPLIER' | 'DUAL') || 'DUAL';

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId is required' },
        { status: 400 }
      );
    }

    const score = await PaymentIntelligenceRepository.getPaymentScore(businessId);

    if (!score) {
      // Return a "NOT_YET_RATED" response
      return NextResponse.json({
        success: true,
        data: {
          businessId,
          isRated: false,
          buyerScore: null,
          supplierScore: null,
          buyerClassification: 'NOT_YET_RATED',
          supplierClassification: 'NOT_YET_RATED',
          unratedReason: 'Insufficient verified payment history to calculate a score.',
        },
      });
    }

    // Filter to requested scoreType
    const responseData = scoreType === 'BUYER'
      ? { ...score, supplierScore: undefined, supplierClassification: undefined, supplierConfidence: undefined }
      : scoreType === 'SUPPLIER'
      ? { ...score, buyerScore: undefined, buyerClassification: undefined, buyerConfidence: undefined }
      : score;

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('[API payment-intelligence/score GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve payment score' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessId, scoreType } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'businessId is required' },
        { status: 400 }
      );
    }

    const score = await PaymentIntelligenceService.calculateAndRefreshScore({
      businessId,
      businessName: body.businessName || 'Enterprise Partner',
      scoreType: scoreType === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER',
    });

    return NextResponse.json({ success: true, data: score });
  } catch (error: any) {
    console.error('[API payment-intelligence/score POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to recalculate payment score' },
      { status: 500 }
    );
  }
}

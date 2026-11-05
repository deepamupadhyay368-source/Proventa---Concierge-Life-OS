import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { matchSuppliersForRfq } from '@/lib/supplier-intelligence/service';
import { getConstructionRfqById } from '@/lib/procurement/repository';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const rfqId = searchParams.get('rfqId');

    if (!rfqId) {
      return NextResponse.json(
        { success: false, error: 'rfqId parameter is required' },
        { status: 400 }
      );
    }

    const rfq = getConstructionRfqById(rfqId);
    if (!rfq) {
      return NextResponse.json(
        { success: false, error: 'RFQ not found' },
        { status: 404 }
      );
    }

    // Run matching engine
    const matches = await matchSuppliersForRfq(rfqId);

    return NextResponse.json({
      success: true,
      data: {
        rfqId: rfq.id,
        rfqTitle: rfq.title,
        matchedCount: matches.length,
        matches,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

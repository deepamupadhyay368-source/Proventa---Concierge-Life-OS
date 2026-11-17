import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';

/**
 * GET /api/payment-intelligence/summary
 * Returns the LedgerFinancialSummary for a business.
 *
 * Query params:
 *   buyerBusinessId    — summarise as buyer (invoices payable)
 *   supplierBusinessId — summarise as supplier (invoices receivable)
 *
 * At least one of the two params must be supplied.
 * Both can be supplied for a combined view.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerBusinessId = searchParams.get('buyerBusinessId') || undefined;
    const supplierBusinessId = searchParams.get('supplierBusinessId') || undefined;

    if (!buyerBusinessId && !supplierBusinessId) {
      return NextResponse.json(
        { success: false, error: 'At least one of buyerBusinessId or supplierBusinessId is required' },
        { status: 400 }
      );
    }

    const summary = await PaymentIntelligenceRepository.getFinancialSummary({
      buyerBusinessId,
      supplierBusinessId,
    });

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('[API payment-intelligence/summary GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve financial summary' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

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
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to access financial summary', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const buyerBusinessId = searchParams.get('buyerBusinessId') || undefined;
    const supplierBusinessId = searchParams.get('supplierBusinessId') || undefined;

    if (!buyerBusinessId && !supplierBusinessId) {
      return NextResponse.json(
        { success: false, error: 'At least one of buyerBusinessId or supplierBusinessId is required' },
        { status: 400 }
      );
    }

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'FINANCE'].includes(r));

    if (!isAdmin) {
      const authorized = await getUserAuthorizedBusinesses(user.id);
      const authorizedIds = new Set([user.id, ...authorized.map((b) => b.id)]);

      if (buyerBusinessId && !authorizedIds.has(buyerBusinessId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view financial ledgers for this buyer business', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      if (supplierBusinessId && !authorizedIds.has(supplierBusinessId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not authorized to view financial ledgers for this supplier business', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
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

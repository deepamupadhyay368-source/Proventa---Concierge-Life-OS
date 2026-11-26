import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to inspect ledger audit logs', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId') || undefined;
    const businessId = searchParams.get('businessId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const user = session.user;
    const userRoles = (user.roles as string[]) || [];
    const isAdmin = userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'FINANCE'].includes(r));

    if (!isAdmin) {
      const authorized = await getUserAuthorizedBusinesses(user.id);
      const authorizedIds = new Set([user.id, ...authorized.map((b) => b.id)]);

      if (!businessId || !authorizedIds.has(businessId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Administrator privileges required to access global audit trail', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    const logs = await PaymentIntelligenceRepository.listAuditLogs({
      invoiceId,
      businessId,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('[API payment-intelligence/audit GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list audit logs' },
      { status: 500 }
    );
  }
}

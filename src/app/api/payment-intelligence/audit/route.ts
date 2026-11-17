import { NextRequest, NextResponse } from 'next/server';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId') || undefined;
    const businessId = searchParams.get('businessId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

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

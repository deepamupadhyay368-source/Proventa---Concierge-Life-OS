import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { PaymentIntelligenceRepository } from '@/lib/payment-intelligence/repository';
import { PaymentIntelligenceService } from '@/lib/payment-intelligence/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await PaymentIntelligenceRepository.getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const payments = await PaymentIntelligenceRepository.listPaymentsForInvoice(id);
    const auditLogs = await PaymentIntelligenceRepository.listAuditLogs({ invoiceId: id });

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        payments,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error('[API payment-intelligence/invoices/[id] GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, revisedDueDate, reason, notes } = body;
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    if (action === 'REVISE_DUE_DATE') {
      if (!revisedDueDate || !reason) {
        return NextResponse.json(
          { success: false, error: 'revisedDueDate and documented reason are required' },
          { status: 400 }
        );
      }

      const updated = await PaymentIntelligenceService.reviseDueDate({
        invoiceId: id,
        revisedDueDate,
        reason,
        approvedByUserId: session.user.id,
        actorRole: (session.user as any)?.roles?.includes('ADMIN') ? 'ADMIN' : 'SUPPLIER',
        ipAddress,
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid update action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API payment-intelligence/invoices/[id] PATCH]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

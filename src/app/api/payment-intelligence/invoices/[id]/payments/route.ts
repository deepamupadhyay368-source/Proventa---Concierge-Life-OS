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
    const payments = await PaymentIntelligenceRepository.listPaymentsForInvoice(id);
    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list payments' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const {
      payerBusinessId,
      amount,
      paymentMethod,
      paymentDate,
      utrNumber,
      bankReference,
      receiptUrl,
      receiptFileName,
      notes,
    } = body;

    if (!payerBusinessId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'payerBusinessId, amount, and paymentMethod are required' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than zero' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

    const result = await PaymentIntelligenceService.recordPayment({
      invoiceId: id,
      recordedByUserId: session.user.id,
      payerBusinessId,
      amount: parsedAmount,
      paymentMethod,
      paymentDate,
      utrNumber,
      bankReference,
      receiptUrl,
      receiptFileName,
      notes,
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API payment-intelligence/invoices/[id]/payments POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}

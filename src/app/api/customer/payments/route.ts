import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    let customerProfile = await db.customerProfile.findFirst({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      customerProfile = await db.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Retrieve payment profile & mandate info
    const paymentProfile = await db.customerPaymentProfile.findUnique({
      where: { customerId: customerProfile.id },
    });

    // Retrieve transaction history
    const payments = await db.payment.findMany({
      where: {
        OR: [
          { customerId: customerProfile.id },
          { customerId: user.id },
        ],
      },
      include: {
        task: {
          select: {
            id: true,
            publicId: true,
            intent: true,
            category: true,
            status: true,
            vendorName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Retrieve pending tasks that require upfront payment
    const pendingTasks = await db.task.findMany({
      where: {
        customerId: customerProfile.id,
        paymentStatus: 'PENDING',
        status: { in: ['AWAITING_APPROVAL', 'APPROVED', 'OPTIONS_READY'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      profile: paymentProfile || {
        customerId: customerProfile.id,
        paymentProvider: 'RAZORPAY',
        preferredPaymentMethod: 'UPI',
        mandateStatus: 'NOT_CONFIGURED',
        mandateMaxAmount: 5000000,
        mandateVpa: null,
      },
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        amountRupees: Math.round(p.amount / 100),
        currency: p.currency,
        status: p.status,
        method: p.method,
        providerRef: p.providerRef,
        providerOrderId: p.providerOrderId,
        refundStatus: p.refundStatus,
        refundAmount: p.refundAmount ? Math.round(p.refundAmount / 100) : null,
        createdAt: p.createdAt,
        task: p.task,
      })),
      pendingTasks: pendingTasks.map((t) => ({
        id: t.id,
        publicId: t.publicId,
        intent: t.intent,
        category: t.category,
        status: t.status,
        budgetAmount: t.budgetAmount,
        proposedOptions: t.proposedOptions,
      })),
    });
  } catch (error: any) {
    console.error('[GET /api/customer/payments]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer payments' },
      { status: 500 }
    );
  }
}

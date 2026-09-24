import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { processPaymentRefund } from '@/lib/payments/razorpay';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const schema = z.object({
  amountPaise: z.number().int().positive().optional(),
  reason: z.string().min(3).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    const { id: paymentId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { amountPaise, reason } = parsed.data;

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { task: true, customer: { include: { user: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const result = await processPaymentRefund({
      paymentId,
      amountPaise,
      reason,
    });

    // Record timeline event if linked to task
    if (payment.taskId) {
      await appendTaskEvent({
        taskId: payment.taskId,
        eventType: 'PAYMENT_REFUNDED',
        actorRole: 'CONCIERGE',
        message: `Refund of ₹${Math.round((result.refundAmount || 0) / 100).toLocaleString('en-IN')} processed by ${adminUser.name || 'Admin'}. Reason: ${reason || 'Customer request'}`,
        data: {
          refundId: result.refundId,
          refundAmount: result.refundAmount,
          reason,
          adminId: adminUser.id,
        },
      });
    }

    // Record audit log
    await createAuditLog({
      actorId: adminUser.id,
      actorRole: adminUser.roles?.[0] || 'ADMIN',
      action: 'PAYMENT_REFUNDED',
      resourceType: 'Payment',
      resourceId: paymentId,
      after: {
        paymentId,
        refundId: result.refundId,
        refundAmount: result.refundAmount,
        originalAmount: payment.amount,
        reason: reason || 'Staff initiated refund',
      },
    });

    return NextResponse.json({
      success: true,
      result,
      message: 'Refund successfully executed.',
    });
  } catch (error: any) {
    console.error('[POST /api/admin/payments/[id]/refund]', error);
    return NextResponse.json(
      { error: error.message || 'Refund processing failed' },
      { status: 500 }
    );
  }
}

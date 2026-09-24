import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { PaymentAutomationEngine } from '@/lib/payments/engine';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  taskId: z.string().optional(),
  optionId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { orderId, paymentId, signature, taskId, optionId } = parsed.data;

    // 1. Authoritative Signature Verification
    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // 2. Locate payment record
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { providerOrderId: orderId },
          { id: orderId },
        ],
      },
      include: { task: true },
    });

    const targetTaskId = taskId || payment?.taskId;

    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CAPTURED',
          providerRef: paymentId,
        },
      });
    }

    // 3. Confirm task payment if linked to a task
    if (targetTaskId) {
      const task = await db.task.findUnique({
        where: { id: targetTaskId },
        include: { customer: true },
      });

      if (task) {
        // Confirm task payment status
        if (payment) {
          await PaymentAutomationEngine.confirmTaskPayment({
            taskId: targetTaskId,
            paymentId: payment.id,
            providerRef: paymentId,
            amountPaise: payment.amount,
            method: payment.method || 'RAZORPAY_CHECKOUT',
          });
        } else {
          await db.task.update({
            where: { id: targetTaskId },
            data: {
              paymentStatus: 'CAPTURED',
              paymentId,
            },
          });
        }

        // 4. Trigger automated task execution now that payment is confirmed
        let executionResult = null;
        try {
          executionResult = await RequestOrchestrator.executeApprovedTask({
            taskId: targetTaskId,
            optionId,
            userId: user.id,
          });
        } catch (execErr: any) {
          console.error('[POST /api/payments/verify] Auto-execution error:', execErr);
        }

        return NextResponse.json({
          success: true,
          verified: true,
          taskId: targetTaskId,
          paymentId,
          executionResult,
          message: 'Payment verified and task execution dispatched.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId,
      message: 'Payment verified successfully.',
    });
  } catch (error: any) {
    console.error('[POST /api/payments/verify]', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

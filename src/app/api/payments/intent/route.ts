import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  taskId: z.string().optional(),
  approvedOptionId: z.string().optional(),
  amountPaise: z.number().int().positive(),
  idempotencyKey: z.string().min(6),
  currency: z.string().default('INR'),
  notes: z.record(z.string()).optional(),
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

    const { taskId, approvedOptionId, amountPaise, idempotencyKey, currency, notes } = parsed.data;

    let customerProfileId = user.id;
    const customerProfile = await db.customerProfile.findFirst({
      where: { userId: user.id },
    });
    if (customerProfile) {
      customerProfileId = customerProfile.id;
    }

    // Verify task ownership if taskId provided
    if (taskId) {
      const task = await db.task.findUnique({
        where: { id: taskId },
        include: { customer: true },
      });
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      if (task.customer?.userId !== user.id && !user.roles.includes('SUPER_ADMIN') && !user.roles.includes('ADMIN')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const order = await createRazorpayOrder({
      amountPaise,
      currency,
      receipt: `RCPT-${(taskId || 'ORD').slice(0, 14)}-${Date.now().toString(36).slice(-4)}`,
      notes: {
        ...(notes || {}),
        userId: user.id,
        taskId: taskId || '',
        customerProfileId,
      },
      customerId: customerProfileId,
      taskId: taskId || undefined,
      approvedOptionId: approvedOptionId || undefined,
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('[POST /api/payments/intent]', error);
    return NextResponse.json(
      { error: error.message || 'Payment intent generation failed' },
      { status: 500 }
    );
  }
}

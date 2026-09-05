import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createPaymentIntent } from '@/lib/payments/razorpay';
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string(),
  amountPaise: z.number().int().positive(),
  idempotencyKey: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const result = await createPaymentIntent({
      bookingId: parsed.data.bookingId,
      customerId: user.id,
      amountPaise: parsed.data.amountPaise,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment intent failed' }, { status: 500 });
  }
}

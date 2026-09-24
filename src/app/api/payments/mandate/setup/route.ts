import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createUpiMandateSetup } from '@/lib/payments/razorpay';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  maxAmountPaise: z.number().int().positive().optional(),
  vpaHandle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

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

    const result = await createUpiMandateSetup({
      customerId: customerProfile.id,
      maxAmountPaise: parsed.data.maxAmountPaise,
      vpaHandle: parsed.data.vpaHandle,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/payments/mandate/setup]', error);
    return NextResponse.json(
      { error: error.message || 'Mandate setup failed' },
      { status: 500 }
    );
  }
}

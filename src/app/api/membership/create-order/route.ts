import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { getPlanById, isValidPlanId } from '@/lib/membership/plans';
import { getOrCreateCustomerProfile } from '@/lib/membership/entitlement';
import { z } from 'zod';

const createOrderSchema = z.object({
  planId: z.string().min(1),
  idempotencyKey: z.string().min(8).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { planId, idempotencyKey: customIdempotencyKey } = parsed.data;

    // 1. Authoritative Server-Side Plan Resolution (never trust client amounts)
    const canonicalPlan = getPlanById(planId);
    if (!canonicalPlan) {
      return NextResponse.json(
        { error: 'Invalid membership plan selected. Must be select, private, or reserve.' },
        { status: 400 }
      );
    }

    // 2. Fetch or create Customer Profile
    const customerProfile = await getOrCreateCustomerProfile(sessionUser);

    // 3. Prevent duplicate active purchase of identical plan
    if (
      customerProfile.membershipPlan === canonicalPlan.name &&
      customerProfile.membershipStatus === 'ACTIVE'
    ) {
      return NextResponse.json({
        success: false,
        alreadyActive: true,
        message: `You already have an active ${canonicalPlan.name} membership.`,
        membership: {
          plan: customerProfile.membershipPlan,
          status: customerProfile.membershipStatus,
          renewsAt: customerProfile.membershipRenewsAt,
        },
      });
    }

    // 4. Generate Idempotency Key
    const idempotencyKey =
      customIdempotencyKey ||
      `mem_order_${sessionUser.id}_${canonicalPlan.id}_${Date.now()}`;

    // 5. Create Razorpay order for the exact canonical paise amount
    const orderResult = await createRazorpayOrder({
      amountPaise: canonicalPlan.pricePaise,
      currency: 'INR',
      receipt: `RCPT-MEM-${Date.now().toString().slice(-8)}`,
      customerId: customerProfile.id,
      notes: {
        type: 'MEMBERSHIP_SUBSCRIPTION',
        planId: canonicalPlan.id,
        planName: canonicalPlan.name,
        userId: sessionUser.id,
        customerId: customerProfile.id,
      },
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      amount: canonicalPlan.pricePaise,
      currency: 'INR',
      keyId: orderResult.keyId,
      plan: {
        id: canonicalPlan.id,
        name: canonicalPlan.name,
        formattedPrice: canonicalPlan.formattedPrice,
        priceInr: canonicalPlan.priceInr,
        positioning: canonicalPlan.positioning,
        cadence: canonicalPlan.cadence,
      },
    });
  } catch (error: any) {
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    console.error('[POST /api/membership/create-order]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create membership checkout order' },
      { status: 500 }
    );
  }
}

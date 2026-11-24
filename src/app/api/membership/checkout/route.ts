import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getCheckoutAmount, getPlan } from '@/lib/pricing';
import { db } from '@/lib/db';
import { allocateSubscriptionEntitlements } from '@/lib/entitlements';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    // Always fetch authoritative server-side calculation in integer paise
    const checkoutCalculation = getCheckoutAmount(planId);
    const plan = await getPlan(planId);

    // In production, integrate Stripe/Razorpay order generation here.
    // Return order details and public key for client checkout.
    return NextResponse.json({
      success: true,
      calculation: checkoutCalculation,
      plan: {
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        visitEntitlement: plan.visitEntitlement,
        bookingPriority: plan.bookingPriority,
      },
      // Provide sandbox/production order id
      orderId: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      currency: 'INR',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process checkout' },
      { status: 400 }
    );
  }
}

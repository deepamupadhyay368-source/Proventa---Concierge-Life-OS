import { NextRequest, NextResponse } from 'next/server';
import { upgradeBusinessSubscriptionPlan } from '@/lib/marketplace/repository';
import { verifyRazorpayPaymentSignature } from '@/lib/marketplace/entitlements';
import { BUSINESS_SUBSCRIPTION_PLANS } from '@/lib/brand';
import type { SubscriptionPlanTier } from '@/lib/marketplace/types';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    plans: Object.values(BUSINESS_SUBSCRIPTION_PLANS),
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const businessId = String(body.businessId || '');
    const planTier = String(body.planTier || 'FREE') as SubscriptionPlanTier;
    const billingCycle = body.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';

    if (!['FREE', 'PRO', 'PREMIUM'].includes(planTier)) {
      throw new ValidationError('Invalid subscription plan tier');
    }

    const isAdmin = isAdminOrModerator(user);
    let paymentVerified = planTier === 'FREE' || isAdmin;

    // If Razorpay payment credentials are provided, verify cryptographic signature server-side
    if (body.razorpayOrderId && body.razorpayPaymentId && body.razorpaySignature) {
      paymentVerified = verifyRazorpayPaymentSignature({
        orderId: String(body.razorpayOrderId),
        paymentId: String(body.razorpayPaymentId),
        signature: String(body.razorpaySignature),
      });
      if (!paymentVerified) {
        throw new ValidationError('Invalid payment verification signature');
      }
    } else if (
      planTier !== 'FREE' &&
      !isAdmin &&
      process.env.FEATURE_PAYMENTS_ENABLED === 'true'
    ) {
      throw new ValidationError(
        'Payment verification is required to activate paid subscription tiers',
      );
    } else if (process.env.FEATURE_PAYMENTS_ENABLED !== 'true') {
      // In pre-gateway/sandbox mode when FEATURE_PAYMENTS_ENABLED is false, allow plan selection with audit log
      paymentVerified = true;
    }

    const subscription = upgradeBusinessSubscriptionPlan(
      user.id,
      businessId,
      planTier,
      billingCycle,
      paymentVerified,
      isAdmin,
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'UPDATE',
      resourceType: 'BusinessSubscription',
      resourceId: subscription.id,
      after: {
        businessId,
        planTier: subscription.planTier,
        billingCycle: subscription.billingCycle,
        amountInr: subscription.amountInr,
      },
    });

    return NextResponse.json({ subscription });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

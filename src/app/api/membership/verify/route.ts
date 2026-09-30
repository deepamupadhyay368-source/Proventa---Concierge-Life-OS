import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { getPlanById } from '@/lib/membership/plans';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const verifyMembershipSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
  planId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const parsed = verifyMembershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { orderId, paymentId, signature, planId } = parsed.data;

    // 1. Resolve Canonical Server-Side Plan
    const canonicalPlan = getPlanById(planId);
    if (!canonicalPlan) {
      return NextResponse.json(
        { error: 'Invalid membership plan specified' },
        { status: 400 }
      );
    }

    // 2. Authoritative Signature Verification
    const isValidSignature = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // 3. Locate and Validate Payment Record
    const payment = await db.payment.findFirst({
      where: {
        OR: [
          { providerOrderId: orderId },
          { providerRef: paymentId },
        ],
      },
    });

    // Validate expected currency and amount if payment record exists
    if (payment) {
      if (payment.currency !== 'INR') {
        return NextResponse.json(
          { error: `Invalid payment currency. Expected INR, got ${payment.currency}` },
          { status: 400 }
        );
      }
      if (payment.amount !== canonicalPlan.pricePaise) {
        return NextResponse.json(
          { error: `Payment amount mismatch. Expected ${canonicalPlan.pricePaise} paise, got ${payment.amount} paise` },
          { status: 400 }
        );
      }
    }

    // 4. Update Payment Record to CAPTURED
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CAPTURED',
          providerRef: paymentId,
          method: 'RAZORPAY_CHECKOUT',
        },
      });
    }

    // 5. Activate Membership on Customer Profile
    const now = new Date();
    const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day monthly cycle

    const updatedProfile = await db.customerProfile.upsert({
      where: { userId: sessionUser.id },
      update: {
        membershipPlan: canonicalPlan.name,
        membershipStatus: 'ACTIVE',
        membershipStartedAt: now,
        membershipRenewsAt: renewsAt,
      },
      create: {
        userId: sessionUser.id,
        city: 'Ahmedabad',
        preferredComm: 'IN_APP',
        membershipPlan: canonicalPlan.name,
        membershipStatus: 'ACTIVE',
        membershipStartedAt: now,
        membershipRenewsAt: renewsAt,
      },
    });

    // 6. Security Audit Trail
    await createAuditLog({
      actorId: sessionUser.id,
      action: 'PAYMENT_CAPTURED',
      resourceType: 'MembershipSubscription',
      resourceId: updatedProfile.id,
      after: {
        plan: canonicalPlan.name,
        amountInr: canonicalPlan.priceInr,
        amountPaise: canonicalPlan.pricePaise,
        orderId,
        paymentId,
        renewsAt,
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      membership: {
        plan: canonicalPlan.name,
        status: 'ACTIVE',
        price: canonicalPlan.formattedPrice,
        priceInr: canonicalPlan.priceInr,
        startedAt: now.toISOString(),
        renewsAt: renewsAt.toISOString(),
      },
      message: 'Payment verified and membership activated successfully.',
    });
  } catch (error: any) {
    if (error?.name === 'AuthenticationError' || error?.message?.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('[POST /api/membership/verify]', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

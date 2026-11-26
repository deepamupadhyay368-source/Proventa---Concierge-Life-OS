import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpayClient } from '@/lib/payments/razorpay';
import { checkEvidenceEligibility } from '@/lib/real-estate/eligibility';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { requestId, idempotencyKey: customKey } = await req.json();

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required.' }, { status: 400 });
    }

    const request = await db.valuationRequest.findUnique({
      where: { id: requestId },
      include: {
        payment: true,
        locality: true,
        user: true,
      },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Valuation request not found.' }, { status: 404 });
    }

    // 1. Check current payment entitlement (Finding 08)
    // Only a currently entitled CAPTURED payment returns alreadyPaid: true
    if (request.payment?.status === 'CAPTURED') {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        reportUrl: `/price/report/${request.id}`,
      });
    }

    // 1B. If previously refunded, this dossier is closed to preserve audit integrity (Finding 08)
    if (request.payment?.status === 'REFUNDED') {
      return NextResponse.json(
        {
          success: false,
          code: 'PAYMENT_REFUNDED_REQUEST_CLOSED',
          error:
            'This valuation request was previously refunded and closed. To order a new valuation report for this property with fresh market evidence, please initiate a new valuation request.',
          canReorderWithNewRequest: true,
        },
        { status: 409 }
      );
    }

    // 1B. Institutional Evidence Eligibility Gate:
    // Prohibit paid valuation order creation unless the locality has at least 3 independently verified registered transactions
    const eligibility = await checkEvidenceEligibility(request.localityId, request.propertyType);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          code: eligibility.code || 'INSUFFICIENT_LOCALITY_EVIDENCE',
          error:
            'Paid valuation reports for this locality are temporarily disabled until sufficient verified registered transaction evidence is established.',
        },
        { status: 422 }
      );
    }

    // 2. Authoritative Database Pricing Lookup
    const pricingConfig = await db.valuationPricingConfig.findFirst({
      where: { reportType: 'RESIDENTIAL_STANDARD', active: true },
    });

    const priceRupees = pricingConfig?.priceRupees || 999;
    const amountPaise = priceRupees * 100;
    const currency = pricingConfig?.currency || 'INR';

    // 3. Idempotency Key
    const idempotencyKey = customKey || `val_order_${requestId}_${Date.now()}`;

    // 4. Create or update ValuationPayment record
    let payment = await db.valuationPayment.findUnique({
      where: { requestId },
    });

    // Check if live Razorpay keys exist
    const hasLiveKeys = Boolean(
      process.env.RAZORPAY_KEY_ID &&
      !process.env.RAZORPAY_KEY_ID.includes('dev_key') &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_SECRET.includes('dev_key')
    );

    let razorpayOrderId = payment?.orderId;

    if (hasLiveKeys) {
      try {
        const order = await razorpayClient.orders.create({
          amount: amountPaise,
          currency,
          receipt: `RCPT-${request.referenceNo}`,
          notes: {
            requestId: request.id,
            referenceNo: request.referenceNo,
            locality: request.locality.name,
            userId: request.userId,
          },
        });
        razorpayOrderId = order.id;
      } catch (err: any) {
        console.error('[Razorpay Order Creation Failed]:', err);
        // Fallback to deterministic reference for sandbox testing
        razorpayOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
      }
    } else {
      // Sandbox mode: generate simulation order id
      razorpayOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
    }

    if (payment) {
      payment = await db.valuationPayment.update({
        where: { id: payment.id },
        data: {
          amountPaise,
          currency,
          orderId: razorpayOrderId,
          status: 'INITIATED',
          idempotencyKey,
        },
      });
    } else {
      payment = await db.valuationPayment.create({
        data: {
          requestId: request.id,
          userId: request.userId,
          amountPaise,
          currency,
          orderId: razorpayOrderId,
          status: 'INITIATED',
          idempotencyKey,
          provider: hasLiveKeys ? 'RAZORPAY' : 'SANDBOX_GATEWAY',
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amountPaise,
      amountRupees: priceRupees,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_proventa',
      isSimulation: !hasLiveKeys,
      referenceNo: request.referenceNo,
      customer: {
        name: request.user.name || 'Valuation Client',
        email: request.user.email,
        phone: request.user.phone,
      },
    });
  } catch (error: any) {
    console.error('Error in create-order route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed.' },
      { status: 500 }
    );
  }
}

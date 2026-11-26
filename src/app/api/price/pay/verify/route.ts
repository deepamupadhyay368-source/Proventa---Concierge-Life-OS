import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateValuationForRequest } from '@/lib/valuation/engine';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulation,
    } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required.' }, { status: 400 });
    }

    const request = await db.valuationRequest.findUnique({
      where: { id: requestId },
      include: {
        payment: true,
        report: true,
      },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Valuation request not found.' }, { status: 404 });
    }

    // 1. Idempotency Check: if already completed and report ready, return immediately
    if (request.status === 'COMPLETED' && request.report?.status === 'READY') {
      return NextResponse.json({
        success: true,
        reportUrl: `/price/report/${request.id}`,
        reportReference: request.report.reportReference,
        alreadyProcessed: true,
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasLiveKeys = Boolean(keySecret && !keySecret.includes('dev_key'));

    // 2. Server-side Payment Verification
    if (hasLiveKeys && !isSimulation) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, error: 'Missing Razorpay verification parameters.' },
          { status: 400 }
        );
      }

      // Compute expected signature: hmac_sha256(order_id + "|" + payment_id, secret)
      const expectedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        // Mark payment as FAILED
        if (request.payment) {
          await db.valuationPayment.update({
            where: { id: request.payment.id },
            data: { status: 'FAILED' },
          });
        }
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature. Payment verification rejected.' },
          { status: 400 }
        );
      }
    } else {
      // Sandbox / Simulation Verification Protocol
      // Must match stored orderId
      if (request.payment?.orderId && razorpay_order_id && request.payment.orderId !== razorpay_order_id) {
        return NextResponse.json(
          { success: false, error: 'Order ID mismatch during payment verification.' },
          { status: 400 }
        );
      }
    }

    // 3. Mark ValuationPayment as CAPTURED
    const paymentId = razorpay_payment_id || `pay_sim_${crypto.randomBytes(8).toString('hex')}`;
    const signature = razorpay_signature || `sig_sim_${crypto.randomBytes(16).toString('hex')}`;

    if (request.payment) {
      await db.valuationPayment.update({
        where: { id: request.payment.id },
        data: {
          status: 'CAPTURED',
          paymentId,
          signature,
          paidAt: new Date(),
        },
      });
    }

    // 4. Mark ValuationRequest as PAID
    await db.valuationRequest.update({
      where: { id: request.id },
      data: { status: 'PAID' },
    });

    // 5. Trigger Valuation Calculation Engine Asynchronously
    // The engine automatically generates comps, adjustments, confidence score, Valuation, and ValuationReport
    const valuationResult = await calculateValuationForRequest(request.id, {
      bypassPaymentCheck: false,
    });

    return NextResponse.json({
      success: true,
      reportUrl: `/price/report/${request.id}`,
      reportReference: valuationResult.reportReference,
      estimatedMidpointLakhs: valuationResult.valuation.estimatedMidpointLakhs,
      calculatedAt: valuationResult.valuation.calculatedAt,
    });
  } catch (error: any) {
    console.error('Error during payment verification and valuation execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment verification or valuation calculation failed.',
      },
      { status: 500 }
    );
  }
}

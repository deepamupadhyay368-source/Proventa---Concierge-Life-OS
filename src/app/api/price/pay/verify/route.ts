import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateValuationForRequest } from '@/lib/valuation/engine';
import { generateReportAccessToken } from '@/lib/valuation/report-token';
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

    // 1. Idempotency Check: if already completed and report ready, return immediately with signed access token
    if (request.status === 'COMPLETED' && request.report?.status === 'READY') {
      const accessToken = generateReportAccessToken(request.id, request.userId);
      return NextResponse.json({
        success: true,
        reportUrl: `/price/report/${request.id}?token=${accessToken}`,
        accessToken,
        reportReference: request.report.reportReference,
        alreadyProcessed: true,
      });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasLiveKeys = Boolean(keySecret && !keySecret.includes('dev_key'));

    // 2. Strict Security Controls against Simulation Bypass (SEC-01)
    // Production categorically rejects client simulation mode.
    if (isProduction && isSimulation) {
      return NextResponse.json(
        {
          success: false,
          error: 'SECURITY_VIOLATION: Payment simulation is strictly prohibited in production.',
        },
        { status: 403 }
      );
    }

    // Determine if simulation is permitted under server-controlled configuration
    const isSimulationPermitted =
      !isProduction &&
      (process.env.ALLOW_PAYMENT_SIMULATION === 'true' ||
        process.env.NODE_ENV === 'test' ||
        !hasLiveKeys);

    if (isSimulation && !isSimulationPermitted) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED: Payment simulation is not permitted on this environment.',
        },
        { status: 403 }
      );
    }

    const runSimulation = isSimulation && isSimulationPermitted;

    // 3. Cryptographic Payment Signature Verification
    if (!runSimulation) {
      // In live verification mode (always required in production):
      if (isProduction && !keySecret) {
        console.error('[Payment Verification] RAZORPAY_KEY_SECRET is not configured in production.');
        return NextResponse.json(
          { success: false, error: 'Payment gateway configuration error.' },
          { status: 500 }
        );
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required payment verification parameters (order_id, payment_id, signature).',
          },
          { status: 400 }
        );
      }

      // Verify order ID consistency: payment must match the order stored on the request
      if (request.payment?.orderId && request.payment.orderId !== razorpay_order_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Order ID mismatch: The submitted payment does not match the generated order for this valuation.',
          },
          { status: 400 }
        );
      }

      // Compute expected HMAC-SHA256 signature
      const secretToUse = keySecret || 'dev_secret_fallback';
      const expectedSignature = crypto
        .createHmac('sha256', secretToUse)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const sigBuffer = Buffer.from(razorpay_signature);
      const expBuffer = Buffer.from(expectedSignature);

      const isValidSignature =
        sigBuffer.length === expBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expBuffer);

      if (!isValidSignature) {
        // Record payment failure in audit trail
        if (request.payment) {
          await db.valuationPayment.update({
            where: { id: request.payment.id },
            data: { status: 'FAILED' },
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid payment signature: Cryptographic verification failed.',
          },
          { status: 400 }
        );
      }
    } else {
      // Permitted Simulation Mode (Non-production only):
      // Still enforce order matching if order ID was supplied
      if (
        request.payment?.orderId &&
        razorpay_order_id &&
        request.payment.orderId !== razorpay_order_id
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Order ID mismatch during simulated payment verification.',
          },
          { status: 400 }
        );
      }
    }

    // 4. Mark ValuationPayment as CAPTURED
    const paymentId =
      razorpay_payment_id ||
      `pay_sim_${crypto.randomBytes(8).toString('hex')}`;
    const signature =
      razorpay_signature ||
      `sig_sim_${crypto.randomBytes(16).toString('hex')}`;

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

    // 5. Mark ValuationRequest as PAID
    await db.valuationRequest.update({
      where: { id: request.id },
      data: { status: 'PAID' },
    });

    // 6. Execute Valuation Engine
    const valuationResult = await calculateValuationForRequest(request.id, {
      bypassPaymentCheck: false,
    });

    // 7. Issue Cryptographically Signed Access Token for Report Access (SEC-02)
    const accessToken = generateReportAccessToken(request.id, request.userId);

    return NextResponse.json({
      success: true,
      reportUrl: `/price/report/${request.id}?token=${accessToken}`,
      accessToken,
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

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    // Allow if admin or for local inspection
    const userRoles = session?.user?.roles || [];
    const isAdmin = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN') || userRoles.includes('CONCIERGE');

    const requests = await db.valuationRequest.findMany({
      include: {
        locality: true,
        project: true,
        payment: true,
        valuation: true,
        report: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const pricingConfigs = await db.valuationPricingConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const methodology = await db.valuationMethodologyVersion.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    const localitiesCount = await db.locality.count();
    const projectsCount = await db.project.count();
    const transactionsCount = await db.propertyTransaction.count();

    return NextResponse.json({
      success: true,
      requests,
      pricingConfigs,
      methodology,
      stats: {
        totalRequests: requests.length,
        paidRequests: requests.filter((r) => r.payment?.status === 'CAPTURED').length,
        manualReviewQueue: requests.filter((r) => r.status === 'MANUAL_REVIEW').length,
        totalLocalities: localitiesCount,
        totalProjects: projectsCount,
        totalTransactions: transactionsCount,
      },
    });
  } catch (error: any) {
    console.error('Admin valuations API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve admin valuation data.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, requestId, newPriceRupees, refundReason } = body;

    if (action === 'APPROVE_MANUAL_REVIEW') {
      const updated = await db.valuationRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          valuation: {
            update: {
              isManualReviewApproved: true,
              reviewedAt: new Date(),
            },
          },
        },
      });
      return NextResponse.json({ success: true, updated });
    }

    if (action === 'UPDATE_PRICE') {
      const price = parseInt(newPriceRupees, 10);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ success: false, error: 'Invalid price' }, { status: 400 });
      }
      const updated = await db.valuationPricingConfig.update({
        where: { reportType: 'RESIDENTIAL_STANDARD' },
        data: { priceRupees: price },
      });
      return NextResponse.json({ success: true, updated });
    }

    if (action === 'PROCESS_REFUND') {
      const payment = await db.valuationPayment.findUnique({
        where: { requestId },
      });
      if (!payment) {
        return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
      }

      await db.valuationPayment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });

      await db.valuationRefund.create({
        data: {
          paymentId: payment.id,
          amountPaise: payment.amountPaise,
          reason: refundReason || 'Manual administrative refund granted',
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      await db.valuationRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED', rejectionReason: refundReason || 'Refunded by administrator' },
      });

      return NextResponse.json({ success: true, message: 'Refund processed successfully' });
    }

    return NextResponse.json({ success: false, error: 'Unrecognized administrative action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin valuation action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

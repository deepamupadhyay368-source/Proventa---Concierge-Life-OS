import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { providerRef: { contains: search, mode: 'insensitive' } },
        { providerOrderId: { contains: search, mode: 'insensitive' } },
        { idempotencyKey: { contains: search, mode: 'insensitive' } },
        { customer: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { customer: { user: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          task: {
            select: {
              id: true,
              publicId: true,
              intent: true,
              category: true,
              status: true,
              vendorName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    // Financial aggregation stats
    const totalVolumeResult = await db.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CAPTURED' },
    });

    const totalRefundResult = await db.payment.aggregate({
      _sum: { refundAmount: true },
      where: { refundStatus: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        amountRupees: Math.round(p.amount / 100),
        currency: p.currency,
        status: p.status,
        method: p.method,
        providerRef: p.providerRef,
        providerOrderId: p.providerOrderId,
        idempotencyKey: p.idempotencyKey,
        refundStatus: p.refundStatus,
        refundAmount: p.refundAmount ? Math.round(p.refundAmount / 100) : null,
        refundRef: p.refundRef,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        customer: p.customer ? {
          id: p.customer.id,
          name: p.customer.user?.name || 'Anonymous Member',
          email: p.customer.user?.email,
          phone: p.customer.user?.phone,
        } : null,
        task: p.task,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalCapturedVolumePaise: totalVolumeResult._sum.amount || 0,
        totalCapturedVolumeRupees: Math.round((totalVolumeResult._sum.amount || 0) / 100),
        totalRefundVolumePaise: totalRefundResult._sum.refundAmount || 0,
        totalRefundVolumeRupees: Math.round((totalRefundResult._sum.refundAmount || 0) / 100),
      },
    });
  } catch (error: any) {
    console.error('[GET /api/admin/payments]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment ledger' },
      { status: error.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, isAdminOrModerator } from '@/lib/auth/session';
import { adminReviewBusiness } from '@/lib/business/service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!isAdminOrModerator(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.verificationStatus = status;
    }

    const applications = await db.business.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        documents: true,
        buyerProfile: true,
        supplierProfile: true,
        businessAuditLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!isAdminOrModerator(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { businessId, status, notes, rejectionReason } = body;

    if (!businessId || !status) {
      return NextResponse.json(
        { success: false, error: 'businessId and status are required' },
        { status: 400 }
      );
    }

    if (!['VERIFIED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification action status' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined;

    const updated = await adminReviewBusiness({
      adminUserId: user.id,
      businessId,
      status,
      notes,
      rejectionReason,
      ipAddress,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[admin/verification POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Review failed' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requestId } = await params;

    const request = await db.valuationRequest.findUnique({
      where: { id: requestId },
      include: {
        payment: true,
        report: true,
        locality: true,
        project: true,
      },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Valuation report not found.' }, { status: 404 });
    }

    // 1. Strict Paywall Enforcement
    const isPaid = request.payment?.status === 'CAPTURED' || request.status === 'COMPLETED';
    if (!isPaid) {
      return NextResponse.json(
        {
          success: false,
          error: 'ACCESS_RESTRICTED: Valuation report is inaccessible until payment has been successfully captured.',
          redirectUrl: `/price/preview/${request.id}`,
        },
        { status: 403 }
      );
    }

    // 2. Ownership & Authorization Check
    const session = await getSession();
    if (session?.user?.id) {
      const isOwner = session.user.id === request.userId;
      const isAdmin = session.user.roles?.includes('SUPER_ADMIN') || session.user.roles?.includes('CONCIERGE');
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'UNAUTHORIZED: You do not have permission to view another customer’s private valuation report.',
          },
          { status: 403 }
        );
      }
    }

    if (!request.report || request.report.status !== 'READY') {
      return NextResponse.json(
        { success: false, error: 'Report is currently processing. Please refresh in a moment.' },
        { status: 202 }
      );
    }

    // Increment download counter
    await db.valuationReport.update({
      where: { id: request.report.id },
      data: { downloadedCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      reportReference: request.report.reportReference,
      status: request.report.status,
      generatedAt: request.report.generatedAt,
      reportData: request.report.reportDataJson,
    });
  } catch (error: any) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve valuation report.' },
      { status: 500 }
    );
  }
}

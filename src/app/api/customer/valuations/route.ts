import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await db.valuationRequest.findMany({
      where: { userId: session.user.id },
      include: {
        locality: true,
        project: true,
        payment: true,
        report: true,
        valuation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = requests.map((req) => ({
      id: req.id,
      referenceNo: req.referenceNo,
      locality: req.locality.name,
      projectName: req.project?.name,
      address: req.address,
      bhk: req.bhk,
      carpetAreaSqFt: req.carpetAreaSqFt,
      status: req.status,
      paymentStatus: req.payment?.status || 'PENDING',
      createdAt: req.createdAt,
      reportUrl: req.status === 'COMPLETED' ? `/price/report/${req.id}` : `/price/preview/${req.id}`,
      estimatedMidpointLakhs: req.valuation?.estimatedMidpointLakhs,
      estimatedRange: req.valuation
        ? `₹${req.valuation.estimatedValueMinLakhs}L - ₹${req.valuation.estimatedValueMaxLakhs}L`
        : null,
      confidenceScore: req.valuation?.confidenceScore,
      confidenceLevel: req.valuation?.confidenceLevel,
      downloadCount: req.report?.downloadedCount || 0,
      generatedAt: req.report?.generatedAt,
    }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: any) {
    console.error('Error in customer valuations API:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer valuations.' }, { status: 500 });
  }
}

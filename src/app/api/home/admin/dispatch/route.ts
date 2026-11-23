import { NextRequest, NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';
import { HomeAllocationEngine } from '@/lib/home/allocation-engine';

export async function GET() {
  const allRequests = homeDataStore.getAllRequests();
  const unassigned = allRequests.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW');

  const dispatchQueue = unassigned.map(req => {
    const recommendations = HomeAllocationEngine.recommendTechniciansForRequest(req);
    return {
      request: req,
      recommendations: recommendations.slice(0, 3) // Top 3
    };
  });

  return NextResponse.json({
    success: true,
    totalUnassigned: unassigned.length,
    dispatchQueue
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, technicianId, autoAssign } = body;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    if (autoAssign) {
      const result = HomeAllocationEngine.autoDispatchIfEligible(requestId);
      return NextResponse.json({ success: true, result });
    }

    if (!technicianId) {
      return NextResponse.json({ success: false, error: 'technicianId is required for manual assignment' }, { status: 400 });
    }

    const updated = homeDataStore.assignTechnician(requestId, technicianId);
    return NextResponse.json({ success: true, request: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

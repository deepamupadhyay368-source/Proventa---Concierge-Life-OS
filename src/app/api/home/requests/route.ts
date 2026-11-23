import { NextRequest, NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';
import { HomeAllocationEngine } from '@/lib/home/allocation-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || undefined;
  const technicianId = searchParams.get('technicianId') || undefined;
  const status = (searchParams.get('status') as any) || undefined;

  const requests = homeDataStore.getAllRequests({ customerId, technicianId, status });
  return NextResponse.json({
    success: true,
    count: requests.length,
    requests
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      categoryKey,
      serviceCode,
      serviceName,
      issueDescription,
      preferredDate,
      preferredTimeSlot,
      urgency,
      photoUrls,
      autoDispatch
    } = body;

    if (!customerId || !categoryKey || !serviceCode || !serviceName || !issueDescription || !preferredDate || !preferredTimeSlot) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters.' },
        { status: 400 }
      );
    }

    const newRequest = homeDataStore.createServiceRequest({
      customerId,
      categoryKey,
      serviceCode,
      serviceName,
      issueDescription,
      preferredDate,
      preferredTimeSlot,
      urgency: urgency || 'STANDARD',
      photoUrls: photoUrls || []
    });

    // Optionally run immediate auto-allocation if requested
    if (autoDispatch) {
      HomeAllocationEngine.autoDispatchIfEligible(newRequest.id);
    }

    const updated = homeDataStore.getRequestById(newRequest.id);

    return NextResponse.json({
      success: true,
      request: updated
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error creating service request.' },
      { status: 500 }
    );
  }
}

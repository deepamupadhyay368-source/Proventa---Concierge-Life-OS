import { NextRequest, NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';
import { HomeAllocationEngine } from '@/lib/home/allocation-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const req = homeDataStore.getRequestById(id);
  if (!req) {
    return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
  }

  // Also include recommendations if unassigned
  const recommendations = req.status === 'SUBMITTED' 
    ? HomeAllocationEngine.recommendTechniciansForRequest(req)
    : [];

  return NextResponse.json({
    success: true,
    request: req,
    recommendations
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const req = homeDataStore.getRequestById(id);
    if (!req) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (action === 'ASSIGN_TECHNICIAN') {
      const { technicianId } = body;
      if (!technicianId) {
        return NextResponse.json({ success: false, error: 'technicianId is required' }, { status: 400 });
      }
      const updated = homeDataStore.assignTechnician(id, technicianId);
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'UPDATE_STATUS') {
      const { status, metadata } = body;
      if (!status) {
        return NextResponse.json({ success: false, error: 'status is required' }, { status: 400 });
      }
      const updated = homeDataStore.updateRequestStatus(id, status, metadata);
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'ADD_ADDITIONAL_CHARGE') {
      const { description, materialCost, labourExtraCost } = body;
      if (!description || materialCost === undefined) {
        return NextResponse.json({ success: false, error: 'description and materialCost are required' }, { status: 400 });
      }
      const updated = homeDataStore.addAdditionalCharge(id, {
        description,
        materialCost: Number(materialCost),
        labourExtraCost: Number(labourExtraCost || 0)
      });
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'RESPOND_ADDITIONAL_CHARGE') {
      const { chargeId, approved } = body;
      if (!chargeId || approved === undefined) {
        return NextResponse.json({ success: false, error: 'chargeId and approved (boolean) are required' }, { status: 400 });
      }
      const updated = homeDataStore.respondToAdditionalCharge(id, chargeId, Boolean(approved));
      return NextResponse.json({ success: true, request: updated });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

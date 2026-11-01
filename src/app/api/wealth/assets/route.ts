import { NextRequest, NextResponse } from 'next/server';
import { listAssets, createAsset, deleteAsset, updateAssetValuation } from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'fam_sharma_heritage';
    const category = searchParams.get('category') || undefined;

    const assets = listAssets({ workspaceId, category });
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'UPDATE_VALUATION') {
      const updated = updateAssetValuation({
        assetId: body.assetId,
        newValuePaise: body.newValuePaise || rupeesToPaise(body.newValueRupees),
        valuationStatus: body.valuationStatus || 'USER_REPORTED',
        sourceNote: body.sourceNote,
        documentId: body.documentId,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const valuePaise = body.currentValuePaise || rupeesToPaise(body.currentValueRupees || 0);
    const newAsset = createAsset({
      workspaceId: body.workspaceId || 'fam_sharma_heritage',
      workspaceType: body.workspaceType || 'FAMILY',
      familyId: body.familyId || 'fam_sharma_heritage',
      name: body.name,
      category: body.category,
      subcategory: body.subcategory,
      description: body.description,
      acquisitionDate: body.acquisitionDate,
      acquisitionValuePaise: body.acquisitionValueRupees ? rupeesToPaise(body.acquisitionValueRupees) : null,
      currentValuePaise: valuePaise,
      currency: body.currency || 'INR',
      legalOwnerId: body.legalOwnerId || 'usr_rajesh_sharma',
      legalOwnerName: body.legalOwnerName || 'Rajesh Sharma',
      ownershipPercentage: body.ownershipPercentage !== undefined ? Number(body.ownershipPercentage) : 100,
      coOwners: body.coOwners || [],
      valuationStatus: body.valuationStatus || 'USER_REPORTED',
      lastValuationDate: body.lastValuationDate || new Date().toISOString().split('T')[0],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
    }
    const deleted = deleteAsset(id);
    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

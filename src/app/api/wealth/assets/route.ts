import { NextRequest, NextResponse } from 'next/server';
import {
  listAssets,
  createAsset,
  deleteAsset,
  getAssetById,
  updateAssetValuation,
  syncWorkspaceAssets,
} from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedAssets, savePersistedAssets } from '@/lib/wealth/persistence';
import { assertAuthorizedWorkspace } from '@/lib/wealth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization
    const authResult = await assertAuthorizedWorkspace(workspaceId);
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    // Hydrate persisted assets from database
    const persisted = await loadPersistedAssets(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspaceAssets(workspaceId, persisted);
    }

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
    const workspaceId = body.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    if (body.action === 'UPDATE_VALUATION') {
      const existing = getAssetById(body.assetId);
      if (!existing || existing.workspaceId !== workspaceId) {
        return NextResponse.json(
          { success: false, error: 'Asset not found or does not belong to specified workspace' },
          { status: 404 },
        );
      }

      const updated = updateAssetValuation({
        assetId: body.assetId,
        newValuePaise: body.newValuePaise || rupeesToPaise(body.newValueRupees),
        valuationStatus: body.valuationStatus || 'USER_REPORTED',
        sourceNote: body.sourceNote,
        documentId: body.documentId,
      });

      const all = listAssets({ workspaceId });
      await savePersistedAssets(workspaceId, userId, all);

      return NextResponse.json({ success: true, data: updated });
    }

    const valuePaise = body.currentValuePaise || rupeesToPaise(body.currentValueRupees || 0);
    const newAsset = createAsset({
      workspaceId,
      workspaceType: body.workspaceType || (workspaceId.startsWith('ind_') ? 'INDIVIDUAL' : 'FAMILY'),
      familyId: body.familyId || workspaceId,
      name: body.name || 'Untitled Asset',
      category: body.category || 'FINANCIAL',
      subcategory: body.subcategory,
      description: body.description,
      acquisitionDate: body.acquisitionDate,
      acquisitionValuePaise: body.acquisitionValueRupees ? rupeesToPaise(body.acquisitionValueRupees) : null,
      currentValuePaise: valuePaise,
      currency: body.currency || 'INR',
      legalOwnerId: userId,
      legalOwnerName: authResult.session?.userName || body.legalOwnerName || 'Primary Owner',
      ownershipPercentage: body.ownershipPercentage !== undefined ? Number(body.ownershipPercentage) : 100,
      coOwners: body.coOwners || [],
      valuationStatus: body.valuationStatus || 'USER_REPORTED',
      lastValuationDate: body.lastValuationDate || new Date().toISOString().split('T')[0],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    // Persist to database for this user
    const all = listAssets({ workspaceId });
    await savePersistedAssets(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const workspaceId = searchParams.get('workspaceId');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    // Verify asset ownership and workspace binding
    const existing = getAssetById(id);
    if (existing && existing.workspaceId !== workspaceId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Asset belongs to a different workspace' },
        { status: 403 },
      );
    }

    const deleted = deleteAsset(id);
    const all = listAssets({ workspaceId });
    await savePersistedAssets(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

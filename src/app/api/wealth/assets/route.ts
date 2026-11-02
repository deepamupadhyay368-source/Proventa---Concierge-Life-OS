import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listAssets,
  createAsset,
  deleteAsset,
  updateAssetValuation,
  syncWorkspaceAssets,
} from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedAssets, savePersistedAssets } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Account isolation check: If requesting personal workspace, must match authenticated user
    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user workspace' },
        { status: 403 },
      );
    }

    // If authenticated user, hydrate persisted assets from database
    if (userId) {
      const persisted = await loadPersistedAssets(workspaceId, userId);
      if (persisted.length > 0) {
        syncWorkspaceAssets(workspaceId, persisted);
      }
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
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();

    if (body.action === 'UPDATE_VALUATION') {
      const updated = updateAssetValuation({
        assetId: body.assetId,
        newValuePaise: body.newValuePaise || rupeesToPaise(body.newValueRupees),
        valuationStatus: body.valuationStatus || 'USER_REPORTED',
        sourceNote: body.sourceNote,
        documentId: body.documentId,
      });

      if (userId && body.workspaceId) {
        const all = listAssets({ workspaceId: body.workspaceId });
        await savePersistedAssets(body.workspaceId, userId, all);
      }

      return NextResponse.json({ success: true, data: updated });
    }

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Account isolation: enforce user owns this workspace
    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot record assets in another user workspace' },
        { status: 403 },
      );
    }

    const valuePaise = body.currentValuePaise || rupeesToPaise(body.currentValueRupees || 0);
    const newAsset = createAsset({
      workspaceId: body.workspaceId,
      workspaceType: body.workspaceType || (body.workspaceId.startsWith('ind_') ? 'INDIVIDUAL' : 'FAMILY'),
      familyId: body.familyId || body.workspaceId,
      name: body.name || 'Untitled Asset',
      category: body.category || 'FINANCIAL',
      subcategory: body.subcategory,
      description: body.description,
      acquisitionDate: body.acquisitionDate,
      acquisitionValuePaise: body.acquisitionValueRupees ? rupeesToPaise(body.acquisitionValueRupees) : null,
      currentValuePaise: valuePaise,
      currency: body.currency || 'INR',
      legalOwnerId: userId || body.legalOwnerId || 'usr_owner',
      legalOwnerName: session?.user?.name || body.legalOwnerName || 'Primary Owner',
      ownershipPercentage: body.ownershipPercentage !== undefined ? Number(body.ownershipPercentage) : 100,
      coOwners: body.coOwners || [],
      valuationStatus: body.valuationStatus || 'USER_REPORTED',
      lastValuationDate: body.lastValuationDate || new Date().toISOString().split('T')[0],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    // Persist to database for this user
    if (userId) {
      const all = listAssets({ workspaceId: body.workspaceId });
      await savePersistedAssets(body.workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const workspaceId = searchParams.get('workspaceId');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset ID required' }, { status: 400 });
    }

    const deleted = deleteAsset(id);

    if (userId && workspaceId) {
      const all = listAssets({ workspaceId });
      await savePersistedAssets(workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

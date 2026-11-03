import { NextRequest, NextResponse } from 'next/server';
import {
  listLiabilities,
  createLiability,
  deleteLiability,
  getLiabilityById,
  syncWorkspaceLiabilities,
} from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedLiabilities, savePersistedLiabilities } from '@/lib/wealth/persistence';
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

    // Hydrate persisted liabilities from database
    const persisted = await loadPersistedLiabilities(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspaceLiabilities(workspaceId, persisted);
    }

    const liabilities = listLiabilities({ workspaceId });
    return NextResponse.json({ success: true, data: liabilities });
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

    const originalPaise = body.originalPrincipalPaise || rupeesToPaise(body.originalPrincipalRupees || 0);
    const balancePaise = body.outstandingBalancePaise || rupeesToPaise(body.outstandingBalanceRupees || 0);
    const emiPaise = body.emiRupees ? rupeesToPaise(body.emiRupees) : null;

    const newLiability = createLiability({
      workspaceId,
      workspaceType: body.workspaceType || (workspaceId.startsWith('ind_') ? 'INDIVIDUAL' : 'FAMILY'),
      familyId: body.familyId || workspaceId,
      name: body.name || 'Debt Facility',
      lenderName: body.lenderName || 'Lending Institution',
      liabilityType: body.liabilityType || 'HOME_LOAN',
      originalPrincipalPaise: originalPaise,
      outstandingBalancePaise: balancePaise,
      currency: body.currency || 'INR',
      interestRateAnnual: Number(body.interestRateAnnual || 0),
      emiPaise,
      startDate: body.startDate,
      maturityDate: body.maturityDate,
      repaymentFrequency: body.repaymentFrequency || 'MONTHLY',
      primaryBorrowerId: userId,
      primaryBorrowerName: authResult.session?.userName || body.primaryBorrowerName || 'Primary Borrower',
      borrowerOwnershipPercentage: body.borrowerOwnershipPercentage !== undefined ? Number(body.borrowerOwnershipPercentage) : 100,
      coBorrowers: body.coBorrowers || [],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    // Persist to database for this user
    const all = listLiabilities({ workspaceId });
    await savePersistedLiabilities(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: newLiability }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Liability ID required' }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    // Verify liability ownership and workspace binding
    const existing = getLiabilityById(id);
    if (existing && existing.workspaceId !== workspaceId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Liability belongs to a different workspace' },
        { status: 403 },
      );
    }

    const deleted = deleteLiability(id);
    const all = listLiabilities({ workspaceId });
    await savePersistedLiabilities(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

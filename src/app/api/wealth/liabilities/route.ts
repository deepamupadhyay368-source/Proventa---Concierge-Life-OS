import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listLiabilities,
  createLiability,
  deleteLiability,
  syncWorkspaceLiabilities,
} from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedLiabilities, savePersistedLiabilities } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Account isolation check
    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user workspace' },
        { status: 403 },
      );
    }

    // Hydrate persisted liabilities from database
    if (userId) {
      const persisted = await loadPersistedLiabilities(workspaceId, userId);
      if (persisted.length > 0) {
        syncWorkspaceLiabilities(workspaceId, persisted);
      }
    }

    const liabilities = listLiabilities({ workspaceId });
    return NextResponse.json({ success: true, data: liabilities });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Account isolation: enforce user owns this workspace
    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot record liabilities in another user workspace' },
        { status: 403 },
      );
    }

    const originalPaise = body.originalPrincipalPaise || rupeesToPaise(body.originalPrincipalRupees || 0);
    const balancePaise = body.outstandingBalancePaise || rupeesToPaise(body.outstandingBalanceRupees || 0);
    const emiPaise = body.emiRupees ? rupeesToPaise(body.emiRupees) : null;

    const newLiability = createLiability({
      workspaceId: body.workspaceId,
      workspaceType: body.workspaceType || (body.workspaceId.startsWith('ind_') ? 'INDIVIDUAL' : 'FAMILY'),
      familyId: body.familyId || body.workspaceId,
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
      primaryBorrowerId: userId || body.primaryBorrowerId || 'usr_borrower',
      primaryBorrowerName: session?.user?.name || body.primaryBorrowerName || 'Primary Borrower',
      borrowerOwnershipPercentage: body.borrowerOwnershipPercentage !== undefined ? Number(body.borrowerOwnershipPercentage) : 100,
      coBorrowers: body.coBorrowers || [],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    // Persist to database for this user
    if (userId) {
      const all = listLiabilities({ workspaceId: body.workspaceId });
      await savePersistedLiabilities(body.workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: newLiability }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'Liability ID required' }, { status: 400 });
    }

    const deleted = deleteLiability(id);

    if (userId && workspaceId) {
      const all = listLiabilities({ workspaceId });
      await savePersistedLiabilities(workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

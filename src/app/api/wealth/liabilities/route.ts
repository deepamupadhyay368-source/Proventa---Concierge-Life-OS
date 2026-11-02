import { NextRequest, NextResponse } from 'next/server';
import { listLiabilities, createLiability, deleteLiability } from '@/lib/wealth/service';
import { rupeesToPaise } from '@/lib/wealth/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
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

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
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
      primaryBorrowerId: body.primaryBorrowerId || 'usr_borrower',
      primaryBorrowerName: body.primaryBorrowerName || 'Primary Borrower',
      borrowerOwnershipPercentage: body.borrowerOwnershipPercentage !== undefined ? Number(body.borrowerOwnershipPercentage) : 100,
      coBorrowers: body.coBorrowers || [],
      supportingDocumentIds: body.supportingDocumentIds || [],
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: newLiability }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Liability ID required' }, { status: 400 });
    }
    const deleted = deleteLiability(id);
    return NextResponse.json({ success: true, data: { deleted } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

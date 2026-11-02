import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listCashflows,
  createCashflowTransaction,
  getCashflowSummary,
  syncWorkspaceCashflows,
} from '@/lib/wealth/cashflow';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedCashflows, savePersistedCashflows } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user cashflows' },
        { status: 403 },
      );
    }

    if (userId) {
      const persisted = await loadPersistedCashflows(workspaceId, userId);
      if (persisted.length > 0) {
        syncWorkspaceCashflows(workspaceId, persisted);
      }
    }

    const periodMonth = searchParams.get('periodMonth') || undefined;
    const summary = getCashflowSummary(workspaceId, periodMonth);
    const transactions = listCashflows({ workspaceId });

    return NextResponse.json({
      success: true,
      data: {
        summary,
        transactions,
      },
    });
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

    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot create cashflow entries in another workspace' },
        { status: 403 },
      );
    }

    const amountPaise = body.amountPaise || rupeesToPaise(body.amountRupees || 0);

    const tx = createCashflowTransaction({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      userId: userId || body.userId || 'usr_member',
      userName: session?.user?.name || body.userName || 'Account Member',
      title: body.title || 'Cashflow Entry',
      type: body.type || 'INCOME',
      category: body.category || 'OTHER_INCOME',
      amountPaise,
      transactionDate: body.transactionDate || new Date().toISOString().split('T')[0],
      isRecurring: Boolean(body.isRecurring),
      isInternalTransfer: Boolean(body.isInternalTransfer),
      sourceAccountId: body.sourceAccountId,
      destinationAccountId: body.destinationAccountId,
      notes: body.notes,
    });

    if (userId) {
      const all = listCashflows({ workspaceId: body.workspaceId });
      await savePersistedCashflows(body.workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

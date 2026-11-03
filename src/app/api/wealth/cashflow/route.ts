import { NextRequest, NextResponse } from 'next/server';
import {
  listCashflows,
  createCashflowTransaction,
  getCashflowSummary,
  syncWorkspaceCashflows,
} from '@/lib/wealth/cashflow';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedCashflows, savePersistedCashflows } from '@/lib/wealth/persistence';
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

    const persisted = await loadPersistedCashflows(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspaceCashflows(workspaceId, persisted);
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
    const body = await req.json();
    const workspaceId = body.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const amountPaise = body.amountPaise || rupeesToPaise(body.amountRupees || 0);

    const tx = createCashflowTransaction({
      workspaceId,
      familyId: body.familyId || workspaceId,
      userId,
      userName: authResult.session?.userName || body.userName || 'Account Member',
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

    const all = listCashflows({ workspaceId });
    await savePersistedCashflows(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

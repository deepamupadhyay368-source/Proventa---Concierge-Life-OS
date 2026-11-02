import { NextRequest, NextResponse } from 'next/server';
import {
  listCashflows,
  createCashflowTransaction,
  getCashflowSummary,
} from '@/lib/wealth/cashflow';
import { rupeesToPaise } from '@/lib/wealth/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
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
    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }
    const amountPaise = body.amountPaise || rupeesToPaise(body.amountRupees || 0);

    const tx = createCashflowTransaction({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      userId: body.userId || 'usr_member',
      userName: body.userName || 'Account Member',
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

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

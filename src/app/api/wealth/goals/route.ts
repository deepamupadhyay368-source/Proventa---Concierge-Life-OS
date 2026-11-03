import { NextRequest, NextResponse } from 'next/server';
import {
  listGoals,
  createGoal,
  simulateScenario,
  syncWorkspaceGoals,
} from '@/lib/wealth/goals';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedGoals, savePersistedGoals } from '@/lib/wealth/persistence';
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

    const persisted = await loadPersistedGoals(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspaceGoals(workspaceId, persisted);
    }

    const goals = listGoals(workspaceId);
    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'SIMULATE_SCENARIO') {
      const workspaceId = body.workspaceId;
      if (workspaceId) {
        const authResult = await assertAuthorizedWorkspace(workspaceId);
        if (authResult.errorResponse) return authResult.errorResponse;
      }

      const baseNetWorthPaise = body.baseNetWorthPaise || rupeesToPaise(body.baseNetWorthRupees || 25000000);
      const monthlySavingsPaise = body.monthlyAdditionalSavingsRupees ? rupeesToPaise(body.monthlyAdditionalSavingsRupees) : 0;
      const loanPrepayPaise = body.loanPrepaymentRupees ? rupeesToPaise(body.loanPrepaymentRupees) : 0;

      const simulation = simulateScenario({
        baseNetWorthPaise,
        monthlyAdditionalSavingsPaise: monthlySavingsPaise,
        expectedAnnualReturnRate: Number(body.expectedAnnualReturnRate || 8.0),
        inflationRate: Number(body.inflationRate || 6.0),
        propertyValueAdjustmentPercentage: Number(body.propertyValueAdjustmentPercentage || 0),
        loanPrepaymentLumpSumPaise: loanPrepayPaise,
        projectionYears: Number(body.projectionYears || 5),
      });

      return NextResponse.json({ success: true, data: simulation });
    }

    const workspaceId = body.workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const targetPaise = body.targetAmountPaise || rupeesToPaise(body.targetAmountRupees || 0);
    const currentPaise = body.currentAmountPaise || rupeesToPaise(body.currentAmountRupees || 0);

    const goal = createGoal({
      workspaceId,
      familyId: body.familyId || workspaceId,
      title: body.title || 'Milestone Goal',
      category: body.category || 'RETIREMENT',
      targetAmountPaise: targetPaise,
      currentAmountPaise: currentPaise,
      targetDate: body.targetDate || new Date().toISOString().split('T')[0],
      contributors: body.contributors || [],
      status: body.status || 'ON_TRACK',
      notes: body.notes,
    });

    const all = listGoals(workspaceId);
    await savePersistedGoals(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { listGoals, createGoal, simulateScenario } from '@/lib/wealth/goals';
import { rupeesToPaise } from '@/lib/wealth/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
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

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    const targetPaise = body.targetAmountPaise || rupeesToPaise(body.targetAmountRupees || 0);
    const currentPaise = body.currentAmountPaise || rupeesToPaise(body.currentAmountRupees || 0);

    const goal = createGoal({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      title: body.title || 'Milestone Goal',
      category: body.category || 'RETIREMENT',
      targetAmountPaise: targetPaise,
      currentAmountPaise: currentPaise,
      targetDate: body.targetDate || new Date().toISOString().split('T')[0],
      contributors: body.contributors || [],
      status: body.status || 'ON_TRACK',
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

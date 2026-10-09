import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { runAgentEvaluationSuite, EVAL_DATASET_100 } from '@/lib/orchestration/eval/comprehensive-eval-suite';
import { AGENT_BEHAVIOR_CONTRACTS } from '@/lib/orchestration/agents/agent-behavior-contracts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    // Execute evaluation suite across all 100+ scenarios
    const summary = await runAgentEvaluationSuite(EVAL_DATASET_100);

    return NextResponse.json({
      success: true,
      summary,
      contracts: AGENT_BEHAVIOR_CONTRACTS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute evaluation suite' },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json().catch(() => ({}));
    const categoryFilter = body.category;

    const filteredDataset = categoryFilter
      ? EVAL_DATASET_100.filter((s) => s.category === categoryFilter)
      : EVAL_DATASET_100;

    const summary = await runAgentEvaluationSuite(filteredDataset);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute filtered evaluation' },
      { status: error?.statusCode || 500 }
    );
  }
}

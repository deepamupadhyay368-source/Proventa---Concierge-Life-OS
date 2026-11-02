import { NextRequest, NextResponse } from 'next/server';
import { executeAIAssistantQuery, getProactiveLivingObservations } from '@/lib/wealth/ai-agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }
    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    const response = await executeAIAssistantQuery({
      workspaceId: body.workspaceId,
      userId: body.userId || 'usr_member',
      query: body.query,
      requestedAgent: body.agentRole,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    const observations = getProactiveLivingObservations(workspaceId);
    return NextResponse.json({ success: true, data: observations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { executeAIAssistantQuery, getProactiveLivingObservations } from '@/lib/wealth/ai-agents';
import { loadPersistedAssets, loadPersistedLiabilities } from '@/lib/wealth/persistence';
import { syncWorkspaceAssets, syncWorkspaceLiabilities } from '@/lib/wealth/service';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();

    if (!body.query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }
    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot query AI assistant for another workspace' },
        { status: 403 },
      );
    }

    if (userId) {
      const [assets, liabilities] = await Promise.all([
        loadPersistedAssets(body.workspaceId, userId),
        loadPersistedLiabilities(body.workspaceId, userId),
      ]);
      if (assets.length > 0) syncWorkspaceAssets(body.workspaceId, assets);
      if (liabilities.length > 0) syncWorkspaceLiabilities(body.workspaceId, liabilities);
    }

    const response = await executeAIAssistantQuery({
      workspaceId: body.workspaceId,
      userId: userId || body.userId || 'usr_member',
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
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access observations for another workspace' },
        { status: 403 },
      );
    }

    const observations = getProactiveLivingObservations(workspaceId);
    return NextResponse.json({ success: true, data: observations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getWealthDashboardTelemetry,
  syncWorkspaceAssets,
  syncWorkspaceLiabilities,
} from '@/lib/wealth/service';
import { getProactiveLivingObservations } from '@/lib/wealth/ai-agents';
import { loadPersistedAssets, loadPersistedLiabilities } from '@/lib/wealth/persistence';
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

    // Hydrate persisted records from database
    const [persistedAssets, persistedLiabilities] = await Promise.all([
      loadPersistedAssets(workspaceId, userId),
      loadPersistedLiabilities(workspaceId, userId),
    ]);
    if (persistedAssets.length > 0) {
      syncWorkspaceAssets(workspaceId, persistedAssets);
    }
    if (persistedLiabilities.length > 0) {
      syncWorkspaceLiabilities(workspaceId, persistedLiabilities);
    }

    const targetUserId = searchParams.get('userId') || undefined;

    const telemetry = getWealthDashboardTelemetry({
      workspaceId,
      targetUserId,
    });

    const observations = getProactiveLivingObservations(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        telemetry,
        observations,
      },
    });
  } catch (error) {
    console.error('[API /api/wealth/telemetry] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

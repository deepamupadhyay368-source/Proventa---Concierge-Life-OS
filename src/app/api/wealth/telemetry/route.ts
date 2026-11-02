import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  getWealthDashboardTelemetry,
  syncWorkspaceAssets,
  syncWorkspaceLiabilities,
} from '@/lib/wealth/service';
import { getProactiveLivingObservations } from '@/lib/wealth/ai-agents';
import { loadPersistedAssets, loadPersistedLiabilities } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Account isolation check
    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user telemetry' },
        { status: 403 },
      );
    }

    // Hydrate persisted records from database
    if (userId) {
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

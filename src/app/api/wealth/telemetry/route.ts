import { NextRequest, NextResponse } from 'next/server';
import { getWealthDashboardTelemetry } from '@/lib/wealth/service';
import { getProactiveLivingObservations } from '@/lib/wealth/ai-agents';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'fam_sharma_heritage';
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

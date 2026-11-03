import { NextRequest, NextResponse } from 'next/server';
import {
  getFamilyBusinessOwnershipGraph,
  syncWorkspaceBusinessMap,
} from '@/lib/wealth/business-ownership';
import { loadPersistedBusinessMap, savePersistedBusinessMap } from '@/lib/wealth/persistence';
import { assertAuthorizedWorkspace } from '@/lib/wealth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId') || searchParams.get('workspaceId');

    if (!familyId) {
      return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
    }

    // Centralized workspace authorization
    const authResult = await assertAuthorizedWorkspace(familyId);
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const persisted = await loadPersistedBusinessMap(familyId, userId);
    if (persisted) {
      syncWorkspaceBusinessMap(familyId, persisted);
    }

    const graph = getFamilyBusinessOwnershipGraph(familyId);
    return NextResponse.json({ success: true, data: graph });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.familyId || body.workspaceId;

    if (!familyId) {
      return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(familyId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    if (body.graph) {
      syncWorkspaceBusinessMap(familyId, body.graph);
      await savePersistedBusinessMap(familyId, userId, body.graph);
      return NextResponse.json({ success: true, data: body.graph });
    }

    return NextResponse.json({ success: false, error: 'Missing graph payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

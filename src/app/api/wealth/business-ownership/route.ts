import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  getFamilyBusinessOwnershipGraph,
  syncWorkspaceBusinessMap,
} from '@/lib/wealth/business-ownership';
import { loadPersistedBusinessMap, savePersistedBusinessMap } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId') || searchParams.get('workspaceId');

    if (!familyId) {
      return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
    }

    if (userId && familyId.startsWith('ind_') && familyId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user business graph' },
        { status: 403 },
      );
    }

    if (userId) {
      const persisted = await loadPersistedBusinessMap(familyId, userId);
      if (persisted) {
        syncWorkspaceBusinessMap(familyId, persisted);
      }
    }

    const graph = getFamilyBusinessOwnershipGraph(familyId);
    return NextResponse.json({ success: true, data: graph });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();
    const familyId = body.familyId || body.workspaceId;

    if (!familyId) {
      return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
    }

    if (userId && familyId.startsWith('ind_') && familyId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot edit another user business graph' },
        { status: 403 },
      );
    }

    if (body.graph) {
      syncWorkspaceBusinessMap(familyId, body.graph);
      if (userId) {
        await savePersistedBusinessMap(familyId, userId, body.graph);
      }
      return NextResponse.json({ success: true, data: body.graph });
    }

    return NextResponse.json({ success: false, error: 'Missing graph payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

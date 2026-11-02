import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  getFamilyContinuity,
  updateEmergencyInstructions,
  addEmergencyContact,
  syncWorkspaceContinuity,
} from '@/lib/wealth/continuity';
import { loadPersistedContinuity, savePersistedContinuity } from '@/lib/wealth/persistence';

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
        { success: false, error: 'Forbidden: Cannot access another user continuity protocols' },
        { status: 403 },
      );
    }

    if (userId) {
      const persisted = await loadPersistedContinuity(familyId, userId);
      if (persisted) {
        syncWorkspaceContinuity(familyId, persisted);
      }
    }

    const continuity = getFamilyContinuity(familyId);
    return NextResponse.json({ success: true, data: continuity });
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
        { success: false, error: 'Forbidden: Cannot alter another user continuity protocol' },
        { status: 403 },
      );
    }

    if (body.action === 'UPDATE_INSTRUCTIONS') {
      const updated = updateEmergencyInstructions(familyId, body.instructions);
      if (userId) {
        await savePersistedContinuity(familyId, userId, updated);
      }
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.action === 'ADD_CONTACT') {
      const contact = addEmergencyContact(familyId, {
        name: body.name,
        role: body.role || 'CHARTERED_ACCOUNTANT',
        phone: body.phone,
        email: body.email,
        organization: body.organization,
        notes: body.notes,
      });

      if (userId) {
        const continuity = getFamilyContinuity(familyId);
        await savePersistedContinuity(familyId, userId, continuity);
      }

      return NextResponse.json({ success: true, data: contact }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

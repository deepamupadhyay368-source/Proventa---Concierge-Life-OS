import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listUserWorkspaces,
  createFamilyWorkspace,
  inviteFamilyMember,
  acceptFamilyInvitation,
} from '@/lib/wealth/service';
import { assertAuthorizedWorkspace } from '@/lib/wealth/auth-guard';
import { savePersistedCategory } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const authenticatedUserId = session?.user?.id;

    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid session required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    // Prevent IDOR: Cannot inspect another user's workspaces
    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot list workspaces for another user' },
        { status: 403 },
      );
    }

    const workspaces = listUserWorkspaces(authenticatedUserId);
    return NextResponse.json({ success: true, data: workspaces });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const callerUserId = session?.user?.id;

    if (!callerUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Valid session required' },
        { status: 401 },
      );
    }

    const body = await req.json();

    if (body.action === 'INVITE_MEMBER') {
      if (!body.familyId) {
        return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
      }

      // Must be at least ADMIN in the family workspace to invite others
      const authResult = await assertAuthorizedWorkspace(body.familyId, { requiredRole: 'ADMIN' });
      if (authResult.errorResponse) return authResult.errorResponse;

      const invitation = inviteFamilyMember({
        familyId: body.familyId,
        invitedByUserId: callerUserId,
        invitedByName: session.user.name || body.invitedByName || 'Family Trustee',
        inviteeEmail: body.inviteeEmail,
        role: body.role || 'MEMBER',
        relationship: body.relationship || 'OTHER',
      });
      return NextResponse.json({ success: true, data: invitation }, { status: 201 });
    }

    if (body.action === 'ACCEPT_INVITATION') {
      if (!body.invitationId) {
        return NextResponse.json({ success: false, error: 'invitationId is required' }, { status: 400 });
      }

      const workspace = acceptFamilyInvitation(body.invitationId, {
        id: callerUserId,
        name: session.user.name || body.userName || 'Family Member',
        email: session.user.email || body.email,
      });

      // Persist workspace reference for user
      await savePersistedCategory('wealth_family_workspaces', workspace.id, callerUserId, workspace);

      return NextResponse.json({ success: true, data: workspace });
    }

    // Default: create new family workspace
    const newWorkspace = createFamilyWorkspace({
      name: body.name || 'Private Family Trust',
      ownerId: callerUserId,
      ownerName: session.user.name || body.ownerName || 'Family Trustee',
      ownerEmail: session.user.email || body.ownerEmail || 'trustee@proventa.internal',
    });

    // Persist workspace in database
    await savePersistedCategory('wealth_family_workspaces', newWorkspace.id, callerUserId, newWorkspace);

    return NextResponse.json({ success: true, data: newWorkspace }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

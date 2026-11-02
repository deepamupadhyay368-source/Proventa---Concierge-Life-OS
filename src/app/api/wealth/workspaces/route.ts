import { NextRequest, NextResponse } from 'next/server';
import {
  listUserWorkspaces,
  createFamilyWorkspace,
  inviteFamilyMember,
  acceptFamilyInvitation,
} from '@/lib/wealth/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr_primary';

    const workspaces = listUserWorkspaces(userId);
    return NextResponse.json({ success: true, data: workspaces });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'INVITE_MEMBER') {
      const invitation = inviteFamilyMember({
        familyId: body.familyId,
        invitedByUserId: body.invitedByUserId || 'usr_primary',
        invitedByName: body.invitedByName || 'Family Owner',
        inviteeEmail: body.inviteeEmail,
        role: body.role || 'MEMBER',
        relationship: body.relationship || 'OTHER',
      });
      return NextResponse.json({ success: true, data: invitation }, { status: 201 });
    }

    if (body.action === 'ACCEPT_INVITATION') {
      const workspace = acceptFamilyInvitation(body.invitationId, {
        id: body.userId || `usr_${Date.now()}`,
        name: body.userName || 'Family Member',
        email: body.email,
      });
      return NextResponse.json({ success: true, data: workspace });
    }

    // Default: create new family workspace
    const newWorkspace = createFamilyWorkspace({
      name: body.name || 'Private Family Trust',
      ownerId: body.ownerId || 'usr_primary',
      ownerName: body.ownerName || 'Family Trustee',
      ownerEmail: body.ownerEmail || 'trustee@proventa.internal',
    });

    return NextResponse.json({ success: true, data: newWorkspace }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

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
    const userId = searchParams.get('userId') || 'usr_rajesh_sharma';

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
        invitedByUserId: body.invitedByUserId || 'usr_rajesh_sharma',
        invitedByName: body.invitedByName || 'Rajesh Sharma',
        inviteeEmail: body.inviteeEmail,
        role: body.role || 'MEMBER',
        relationship: body.relationship || 'OTHER',
      });
      return NextResponse.json({ success: true, data: invitation }, { status: 201 });
    }

    if (body.action === 'ACCEPT_INVITATION') {
      const workspace = acceptFamilyInvitation(body.invitationId, {
        id: body.userId || 'usr_new_member',
        name: body.userName || 'New Member',
        email: body.email,
      });
      return NextResponse.json({ success: true, data: workspace });
    }

    // Default: create new family workspace
    const newWorkspace = createFamilyWorkspace({
      name: body.name || 'New Family Trust',
      ownerId: body.ownerId || 'usr_rajesh_sharma',
      ownerName: body.ownerName || 'Rajesh Sharma',
      ownerEmail: body.ownerEmail || 'rajesh.sharma@proventa.internal',
    });

    return NextResponse.json({ success: true, data: newWorkspace }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

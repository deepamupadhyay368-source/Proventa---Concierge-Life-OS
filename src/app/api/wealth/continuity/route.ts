import { NextRequest, NextResponse } from 'next/server';
import {
  getFamilyContinuity,
  updateEmergencyInstructions,
  addEmergencyContact,
} from '@/lib/wealth/continuity';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId') || 'fam_sharma_heritage';

    const continuity = getFamilyContinuity(familyId);
    return NextResponse.json({ success: true, data: continuity });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const familyId = body.familyId || 'fam_sharma_heritage';

    if (body.action === 'UPDATE_INSTRUCTIONS') {
      const updated = updateEmergencyInstructions(familyId, body.instructions);
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
      return NextResponse.json({ success: true, data: contact }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getFamilyBusinessOwnershipGraph } from '@/lib/wealth/business-ownership';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId') || searchParams.get('workspaceId');
    if (!familyId) {
      return NextResponse.json({ success: false, error: 'familyId is required' }, { status: 400 });
    }

    const graph = getFamilyBusinessOwnershipGraph(familyId);
    return NextResponse.json({ success: true, data: graph });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

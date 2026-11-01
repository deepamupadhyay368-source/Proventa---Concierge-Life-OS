import { NextRequest, NextResponse } from 'next/server';
import { getFamilyBusinessOwnershipGraph } from '@/lib/wealth/business-ownership';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId') || 'fam_sharma_heritage';

    const graph = getFamilyBusinessOwnershipGraph(familyId);
    return NextResponse.json({ success: true, data: graph });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

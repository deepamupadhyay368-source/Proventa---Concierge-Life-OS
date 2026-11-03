import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { getSensitiveAccessHistory } from '@/lib/privacy/privacy-engine';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const history = await getSensitiveAccessHistory(user.id, limit);
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

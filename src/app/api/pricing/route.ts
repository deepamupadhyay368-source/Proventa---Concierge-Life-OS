import { NextResponse } from 'next/server';
import { listPlans, getPlan } from '@/lib/pricing';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('planId');

  try {
    if (planId) {
      const plan = await getPlan(planId);
      return NextResponse.json({ success: true, plan });
    }
    const plans = await listPlans();
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve plans' },
      { status: 400 }
    );
  }
}

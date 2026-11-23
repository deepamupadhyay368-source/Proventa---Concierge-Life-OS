import { NextResponse } from 'next/server';
import { HOME_SUBSCRIPTION_PLANS } from '@/lib/home/constants';

export async function GET() {
  return NextResponse.json({
    success: true,
    plans: HOME_SUBSCRIPTION_PLANS
  });
}

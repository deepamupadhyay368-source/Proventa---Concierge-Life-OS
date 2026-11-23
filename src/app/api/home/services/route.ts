import { NextResponse } from 'next/server';
import { HOME_SERVICE_CATEGORIES, AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: HOME_SERVICE_CATEGORIES,
    localities: AHMEDABAD_LOCALITIES
  });
}

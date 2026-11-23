import { NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';

export async function GET() {
  const societies = homeDataStore.getAllSocieties();
  return NextResponse.json({
    success: true,
    count: societies.length,
    societies
  });
}

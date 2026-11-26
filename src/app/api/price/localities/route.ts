import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const localities = await db.locality.findMany({
      where: { activeStatus: true },
      include: {
        projects: {
          select: {
            id: true,
            slug: true,
            name: true,
            developer: true,
            buildingType: true,
            carpetAreaRangeMin: true,
            carpetAreaRangeMax: true,
            possessionStatus: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const pricingConfig = await db.valuationPricingConfig.findFirst({
      where: { reportType: 'RESIDENTIAL_STANDARD', active: true },
    });

    return NextResponse.json({
      success: true,
      localities,
      pricing: {
        priceRupees: pricingConfig?.priceRupees || 999,
        discountedPriceRupees: pricingConfig?.discountedPriceRupees || 1999,
        currency: pricingConfig?.currency || 'INR',
        gstPercent: pricingConfig?.gstPercent || 18,
      },
    });
  } catch (error: any) {
    console.error('Error fetching localities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load localities and projects.' },
      { status: 500 }
    );
  }
}

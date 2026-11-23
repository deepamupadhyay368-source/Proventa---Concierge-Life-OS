import { NextRequest, NextResponse } from 'next/server';
import { homeDataStore } from '@/lib/home/repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'cust-bopal-01';

  const assets = homeDataStore.getAssetsByCustomerId(customerId);
  const passport = homeDataStore.getPassportEntries(customerId);

  return NextResponse.json({
    success: true,
    customerId,
    assets,
    passport
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, assetType, customName, brand, modelNumber, serialNumber, purchaseDate, installedLocation, notes } = body;

    if (!customerId || !assetType || !customName || !brand || !installedLocation) {
      return NextResponse.json({ success: false, error: 'Missing mandatory asset fields.' }, { status: 400 });
    }

    const asset = homeDataStore.createAsset({
      customerId,
      assetType,
      customName,
      brand,
      modelNumber,
      serialNumber,
      purchaseDate,
      installedLocation,
      notes
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

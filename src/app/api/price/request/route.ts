import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { RealEstateType, PropertyCondition, FurnishingStatus, TransactionContext } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Authentication or Guest Email Resolution
    const session = await getSession();
    let userId = session?.user?.id;

    if (!userId) {
      const email = body.contactEmail?.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'A valid email address is required to receive and access your valuation report.' },
          { status: 400 }
        );
      }

      // Find or create user
      let user = await db.user.findUnique({ where: { email } });
      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name: body.contactName?.trim() || 'Valuation Client',
            phone: body.contactPhone?.trim() || null,
            status: 'ACTIVE',
            userRoles: {
              create: { role: 'CUSTOMER' },
            },
          },
        });
      }
      userId = user.id;
    }

    // 2. Validate Required Fields
    const {
      localityId,
      projectId,
      address,
      pincode,
      propertyType = 'APARTMENT',
      bhk,
      carpetAreaSqFt,
      builtUpAreaSqFt,
      superBuiltUpAreaSqFt,
      floor,
      totalFloors,
      propertyAgeYears,
      condition,
      furnishingStatus,
      parkingSpaces = 1,
      transactionContext = 'BUYING',
      askingPriceLakhs,
      targetOfferLakhs,
      notes,
    } = body;

    if (!localityId) {
      return NextResponse.json({ success: false, error: 'Locality selection is required.' }, { status: 400 });
    }

    const locality = await db.locality.findUnique({ where: { id: localityId } });
    if (!locality || !locality.activeStatus) {
      return NextResponse.json(
        { success: false, error: 'Selected locality is not currently supported or inactive.' },
        { status: 400 }
      );
    }

    const parsedCarpet = parseFloat(carpetAreaSqFt);
    if (isNaN(parsedCarpet) || parsedCarpet < 150 || parsedCarpet > 25000) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid carpet area between 150 and 25,000 sq.ft.' },
        { status: 400 }
      );
    }

    const parsedBhk = parseFloat(bhk);
    if (isNaN(parsedBhk) || parsedBhk <= 0) {
      return NextResponse.json({ success: false, error: 'Valid BHK configuration is required.' }, { status: 400 });
    }

    if (!address || address.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a detailed property address or society location.' },
        { status: 400 }
      );
    }

    // 3. Generate Unique Reference Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referenceNo = `PV-VAL-${year}-${randomSuffix}`;

    // 4. Create ValuationRequest in PENDING_PAYMENT status
    const request = await db.valuationRequest.create({
      data: {
        referenceNo,
        userId,
        status: 'PENDING_PAYMENT',
        propertyType: propertyType as RealEstateType,
        localityId,
        projectId: projectId || null,
        address: address.trim(),
        pincode: pincode?.trim() || locality.pincode,
        bhk: parsedBhk,
        carpetAreaSqFt: parsedCarpet,
        builtUpAreaSqFt: builtUpAreaSqFt ? parseFloat(builtUpAreaSqFt) : null,
        superBuiltUpAreaSqFt: superBuiltUpAreaSqFt ? parseFloat(superBuiltUpAreaSqFt) : null,
        floor: floor ? parseInt(floor, 10) : null,
        totalFloors: totalFloors ? parseInt(totalFloors, 10) : null,
        propertyAgeYears: propertyAgeYears ? parseInt(propertyAgeYears, 10) : null,
        condition: condition ? (condition as PropertyCondition) : null,
        furnishingStatus: furnishingStatus ? (furnishingStatus as FurnishingStatus) : null,
        parkingSpaces: parseInt(parkingSpaces, 10) || 0,
        transactionContext: transactionContext as TransactionContext,
        askingPriceLakhs: askingPriceLakhs ? parseFloat(askingPriceLakhs) : null,
        targetOfferLakhs: targetOfferLakhs ? parseFloat(targetOfferLakhs) : null,
        notes: notes?.trim() || null,
      },
    });

    // 5. Pre-calculate Evidence Coverage Metrics (WITHOUT revealing prices or values)
    const minCarpet = parsedCarpet * 0.7;
    const maxCarpet = parsedCarpet * 1.3;

    const registeredDeedsCount = await db.propertyTransaction.count({
      where: {
        localityId,
        carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
        verificationStatus: 'VERIFIED',
      },
    });

    const activeListingsCount = await db.propertyListing.count({
      where: {
        localityId,
        carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
        listingStatus: 'ACTIVE',
      },
    });

    const pricingConfig = await db.valuationPricingConfig.findFirst({
      where: { reportType: 'RESIDENTIAL_STANDARD', active: true },
    });

    return NextResponse.json({
      success: true,
      requestId: request.id,
      referenceNo: request.referenceNo,
      redirectUrl: `/price/preview/${request.id}`,
      coverage: {
        localityName: locality.name,
        registeredDeedsCount,
        activeListingsCount,
        coverageLevel: locality.coverageLevel,
        valuationReady: locality.valuationReady,
      },
      pricing: {
        priceRupees: pricingConfig?.priceRupees || 999,
        discountedPriceRupees: pricingConfig?.discountedPriceRupees || 1999,
        gstPercent: pricingConfig?.gstPercent || 18,
      },
    });
  } catch (error: any) {
    console.error('Error creating valuation request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred while saving property parameters.' },
      { status: 500 }
    );
  }
}

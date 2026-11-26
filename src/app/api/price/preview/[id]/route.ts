import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: requestId } = await params;

    const request = await db.valuationRequest.findUnique({
      where: { id: requestId },
      include: {
        locality: true,
        project: true,
        payment: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Valuation request not found.' },
        { status: 404 }
      );
    }

    // Pre-calculate Evidence Coverage Metrics (WITHOUT revealing prices or values)
    const minCarpet = request.carpetAreaSqFt * 0.7;
    const maxCarpet = request.carpetAreaSqFt * 1.3;

    const registeredDeedsCount = await db.propertyTransaction.count({
      where: {
        localityId: request.localityId,
        carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
        verificationStatus: 'VERIFIED',
      },
    });

    const activeListingsCount = await db.propertyListing.count({
      where: {
        localityId: request.localityId,
        carpetAreaSqFt: { gte: minCarpet, lte: maxCarpet },
        listingStatus: 'ACTIVE',
      },
    });

    const pricingConfig = await db.valuationPricingConfig.findFirst({
      where: { reportType: 'RESIDENTIAL_STANDARD', active: true },
    });

    // Check payment status
    const isPaid = request.payment?.status === 'CAPTURED' || request.status === 'COMPLETED';

    return NextResponse.json({
      success: true,
      requestId: request.id,
      referenceNo: request.referenceNo,
      isPaid,
      status: request.status,
      propertySummary: {
        address: request.address,
        localityName: request.locality.name,
        projectName: request.project?.name,
        city: request.city,
        state: request.state,
        pincode: request.pincode,
        propertyType: request.propertyType,
        bhk: request.bhk,
        carpetAreaSqFt: request.carpetAreaSqFt,
        builtUpAreaSqFt: request.builtUpAreaSqFt,
        floor: request.floor,
        totalFloors: request.totalFloors,
        propertyAgeYears: request.propertyAgeYears,
        condition: request.condition,
        furnishingStatus: request.furnishingStatus,
        parkingSpaces: request.parkingSpaces,
        transactionContext: request.transactionContext,
        createdAt: request.createdAt,
      },
      coverage: {
        localityName: request.locality.name,
        coverageLevel: request.locality.coverageLevel,
        valuationReady: request.locality.valuationReady,
        registeredDeedsCount,
        activeListingsCount,
        microMarketTotalTransactions: request.locality.totalTransactions,
        dataSources: [
          'Empirical Micro-Market Research & Observed Field Benchmarks',
          'Gujarat Real Estate Regulatory Authority (GujRERA) Public Filings',
          'Secondary Market Asking & Negotiation Spread Observations',
          'Town Planning (AUDA) Infrastructure & Spatial Layout Data',
        ],
      },
      pricing: {
        reportType: 'RESIDENTIAL_STANDARD',
        name: pricingConfig?.name || 'PROVENTA PRICE — Comprehensive Valuation Report',
        priceRupees: pricingConfig?.priceRupees || 999,
        discountedPriceRupees: pricingConfig?.discountedPriceRupees || 1999,
        currency: pricingConfig?.currency || 'INR',
        gstPercent: pricingConfig?.gstPercent || 18,
        totalAmountPaise: (pricingConfig?.priceRupees || 999) * 100,
      },
      deliveryExpectations: {
        deliveryMethod: 'Instant Interactive Dossier + Downloadable Institutional PDF',
        deliveryTime: 'Generated instantly on verified payment confirmation',
        guarantee: 'Full evidence ledger with traceable deed IDs and adjustment matrix',
        cancellationPolicy: 'If evidence is deemed insufficient (< 2 eligible comps), automated full refund or escalated priority manual review.',
      },
    });
  } catch (error: any) {
    console.error('Error fetching preview data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve valuation preview.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { computeMaterialPriceBenchmark } from '@/lib/construction-procurement/price-intelligence';
import { rupeesToPaise, formatInrFromPaise, calculateGstPaise } from '@/lib/construction-procurement/money';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('categorySlug') || 'tmt-steel';
    const grade = searchParams.get('grade') || 'Fe-550D';
    const unit = searchParams.get('unit') || 'MT';
    const city = searchParams.get('city') || undefined;

    const observations = await db.priceObservation.findMany({
      where: {
        OR: [{ organisationId: null }, { organisationId: { in: orgIds } }],
        materialCategorySlug: categorySlug,
      },
      orderBy: { observationDate: 'desc' },
    });

    const benchmark = computeMaterialPriceBenchmark({
      observations,
      materialCategorySlug: categorySlug,
      grade,
      unit,
      city,
    });

    if (searchParams.get('format') === 'csv') {
      const header = 'Date,Category,Material,Brand,Grade,Unit,City,LandedUnitINR,Source,Verification';
      const lines = observations.map((o) =>
        [
          o.observationDate.toISOString().split('T')[0],
          o.materialCategorySlug,
          `"${o.materialName.replace(/"/g, '""')}"`,
          `"${o.brand.replace(/"/g, '""')}"`,
          o.grade,
          o.unit,
          o.city,
          (Number(o.landedPriceUnitPaise) / 100).toFixed(2),
          o.sourceType,
          o.verificationStatus,
        ].join(',')
      );
      return new NextResponse([header, ...lines].join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="proventa-price-intelligence-${categorySlug}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        benchmark: {
          ...benchmark,
          lowestUnitPaise: benchmark.lowestUnitPaise?.toString() ?? null,
          highestUnitPaise: benchmark.highestUnitPaise?.toString() ?? null,
          medianUnitPaise: benchmark.medianUnitPaise?.toString() ?? null,
        },
        observations: observations.map((o) => ({
          ...o,
          basePriceUnitPaise: o.basePriceUnitPaise.toString(),
          gstUnitPaise: o.gstUnitPaise.toString(),
          freightUnitPaise: o.freightUnitPaise.toString(),
          loadingUnloadingPaise: o.loadingUnloadingPaise.toString(),
          otherChargesUnitPaise: o.otherChargesUnitPaise.toString(),
          landedPriceUnitPaise: o.landedPriceUnitPaise.toString(),
          landedPriceFormatted: formatInrFromPaise(o.landedPriceUnitPaise),
        })),
      },
    });
  } catch (error) {
    console.error('[Price Intelligence GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load material price intelligence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.materialCategorySlug || !body.materialName || !body.brand || !body.grade || !body.unit || !body.basePriceUnitRupees || !body.sourceType) {
      return NextResponse.json(
        { success: false, error: 'materialCategorySlug, materialName, brand, grade, unit, basePriceUnitRupees, and sourceType are required.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;

    const baseUnitPaise = rupeesToPaise(body.basePriceUnitRupees);
    const gstRate = Number(body.gstRatePercent ?? 18);
    const gstUnitPaise = calculateGstPaise(baseUnitPaise, gstRate);
    const freightUnitPaise = body.freightUnitRupees ? rupeesToPaise(body.freightUnitRupees) : BigInt(0);
    const loadingUnloadingPaise = body.loadingUnloadingRupees ? rupeesToPaise(body.loadingUnloadingRupees) : BigInt(0);
    const otherChargesUnitPaise = body.otherChargesUnitRupees ? rupeesToPaise(body.otherChargesUnitRupees) : BigInt(0);
    const landedPriceUnitPaise = baseUnitPaise + gstUnitPaise + freightUnitPaise + loadingUnloadingPaise + otherChargesUnitPaise;

    const created = await db.priceObservation.create({
      data: {
        organisationId,
        materialCategorySlug: body.materialCategorySlug,
        materialName: body.materialName,
        brand: body.brand,
        grade: body.grade,
        specificationsJson: body.specifications || {},
        unit: body.unit,
        quantity: Number(body.quantity || 1),
        supplierName: body.supplierName || null,
        city: body.city || 'Ahmedabad',
        locality: body.locality || null,
        basePriceUnitPaise: baseUnitPaise,
        gstRatePercent: gstRate,
        gstUnitPaise,
        freightUnitPaise,
        loadingUnloadingPaise,
        otherChargesUnitPaise,
        landedPriceUnitPaise,
        currency: 'INR',
        observationDate: body.observationDate ? new Date(body.observationDate) : new Date(),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        sourceType: body.sourceType,
        verificationStatus: body.sourceType === 'MANUAL_OBSERVATION' ? 'PENDING' : 'VERIFIED',
        supportingDocumentRef: body.supportingDocumentRef || null,
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...created,
          basePriceUnitPaise: created.basePriceUnitPaise.toString(),
          gstUnitPaise: created.gstUnitPaise.toString(),
          freightUnitPaise: created.freightUnitPaise.toString(),
          loadingUnloadingPaise: created.loadingUnloadingPaise.toString(),
          otherChargesUnitPaise: created.otherChargesUnitPaise.toString(),
          landedPriceUnitPaise: created.landedPriceUnitPaise.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Price Intelligence POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to record price observation' }, { status: 400 });
  }
}

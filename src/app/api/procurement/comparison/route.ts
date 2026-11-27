import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { buildComparisonMatrix } from '@/lib/construction-procurement/comparison-engine';
import { rupeesToPaise } from '@/lib/construction-procurement/money';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.rfqId || !body.categorySlug || !Array.isArray(body.quotations)) {
      return NextResponse.json(
        { success: false, error: 'rfqId, categorySlug, and quotations array are required.' },
        { status: 400 }
      );
    }

    const matrix = buildComparisonMatrix({
      rfqId: body.rfqId,
      categorySlug: body.categorySlug,
      requestedSpecs: body.requestedSpecs || {},
      acceptableAlternativeBrands: body.acceptableAlternativeBrands || [],
      quotations: body.quotations.map((q: any) => ({
        quotationId: q.quotationId,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        verificationStatus: q.verificationStatus || 'REGISTERED',
        brandQuoted: q.brandQuoted || '',
        quotedSpecs: q.quotedSpecs || {},
        quantity: Number(q.quantity),
        unit: q.unit || 'MT',
        baseMaterialPaise: q.baseMaterialPaise ? BigInt(q.baseMaterialPaise) : rupeesToPaise(q.baseMaterialRupees || 0),
        gstPaise: q.gstPaise ? BigInt(q.gstPaise) : rupeesToPaise(q.gstRupees || 0),
        freightPaise: q.freightPaise ? BigInt(q.freightPaise) : rupeesToPaise(q.freightRupees || 0),
        loadingPaise: q.loadingPaise ? BigInt(q.loadingPaise) : rupeesToPaise(q.loadingRupees || 0),
        unloadingPaise: q.unloadingPaise ? BigInt(q.unloadingPaise) : rupeesToPaise(q.unloadingRupees || 0),
        insurancePaise: q.insurancePaise ? BigInt(q.insurancePaise) : rupeesToPaise(q.insuranceRupees || 0),
        otherChargesPaise: q.otherChargesPaise ? BigInt(q.otherChargesPaise) : rupeesToPaise(q.otherChargesRupees || 0),
        discountPaise: q.discountPaise ? BigInt(q.discountPaise) : rupeesToPaise(q.discountRupees || 0),
        deliveryDays: Number(q.deliveryDays || 5),
        paymentTerms: q.paymentTerms || '30 Days Credit',
        paymentCreditDays: Number(q.paymentCreditDays || 0),
        validUntilIso: q.validUntilIso || new Date(Date.now() + 7 * 86400_000).toISOString(),
        historicalOnTimeRatePercent: q.historicalOnTimeRatePercent ?? null,
        documentedOrderCount: Number(q.documentedOrderCount || 0),
      })),
    });

    // Serialize BigInt paise fields as strings for JSON safety
    const serialized = {
      ...matrix,
      rows: matrix.rows.map((r) => ({
        ...r,
        baseMaterialPaise: r.baseMaterialPaise.toString(),
        gstPaise: r.gstPaise.toString(),
        freightPaise: r.freightPaise.toString(),
        loadingPaise: r.loadingPaise.toString(),
        unloadingPaise: r.unloadingPaise.toString(),
        insurancePaise: r.insurancePaise.toString(),
        otherChargesPaise: r.otherChargesPaise.toString(),
        discountPaise: r.discountPaise.toString(),
        totalLandedCostPaise: r.totalLandedCostPaise.toString(),
        unitLandedCostPaise: r.unitLandedCostPaise.toString(),
      })),
    };

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error('[Procurement Comparison POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to compute comparison matrix' }, { status: 400 });
  }
}

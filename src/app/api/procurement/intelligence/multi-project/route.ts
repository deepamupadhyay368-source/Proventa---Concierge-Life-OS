import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import {
  evaluateConsolidationCompatibility,
  computeSupplierConcentration,
  evaluateCrossProjectRateVariance,
} from '@/lib/construction-procurement/multi-project-intelligence';
import { formatInrFromPaise } from '@/lib/construction-procurement/money';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const [projects, requirements, orders, opportunities] = await Promise.all([
      db.constructionProject.findMany({ where: { organisationId: { in: orgIds }, deletedAt: null } }),
      db.procurementRequirement.findMany({ where: { organisationId: { in: orgIds }, deletedAt: null } }),
      db.procurementOrder.findMany({ where: { buyerBusinessId: { in: orgIds } } }),
      db.consolidationOpportunity.findMany({
        where: { organisationId: { in: orgIds } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalSpendPaise = orders.reduce(
      (acc, o) => acc + BigInt(Math.round((o.totalAmount || 0) * 100)),
      BigInt(0)
    );

    const purchaseRecords = orders.map((o) => ({
      projectId: projects[0]?.id || 'ORG',
      projectName: projects[0]?.name || 'Organisation Project',
      city: projects[0]?.city || 'Ahmedabad',
      materialCategorySlug: 'general',
      materialName: `PO ${o.id}`,
      specificationSignature: o.rfqId,
      unit: 'LOT',
      quantity: 1,
      baseUnitPaise: BigInt(Math.round((o.totalAmount || 0) * 100)),
      freightUnitPaise: BigInt(0),
      gstRatePercent: 18,
      landedUnitPaise: BigInt(Math.round((o.totalAmount || 0) * 100)),
      totalLandedPaise: BigInt(Math.round((o.totalAmount || 0) * 100)),
      paymentCreditDays: 30,
      supplierBusinessId: o.supplierBusinessId || o.supplierId,
      supplierName: o.supplierName,
    }));

    const supplierConcentration = computeSupplierConcentration(purchaseRecords).map((s) => ({
      ...s,
      totalSpendPaise: s.totalSpendPaise.toString(),
    }));
    const rateComparisons = evaluateCrossProjectRateVariance(purchaseRecords).map((c) => ({
      ...c,
      unitDifferencePaise: c.unitDifferencePaise.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        activeProjectsCount: projects.length,
        openRequirementsCount: requirements.filter((r) => ['DRAFT', 'SUBMITTED', 'APPROVED'].includes(r.status)).length,
        totalExpenditureFormatted: formatInrFromPaise(totalSpendPaise),
        supplierConcentration,
        rateComparisons,
        consolidationOpportunities: opportunities,
      },
    });
  } catch (error) {
    console.error('[Multi-Project Intelligence GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load multi-project intelligence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!Array.isArray(body.candidates) || body.candidates.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 project requirement candidates are required to evaluate consolidation.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;

    const evaluation = evaluateConsolidationCompatibility(body.candidates);
    const opportunityCode = `CON-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const saved = await db.consolidationOpportunity.create({
      data: {
        organisationId,
        opportunityCode,
        materialCategorySlug: body.candidates[0].materialCategorySlug,
        materialName: body.candidates[0].materialName,
        specificationSignature: body.candidates[0].specificationSignature,
        projectIds: evaluation.projectIds,
        combinedQuantity: evaluation.combinedQuantity,
        unit: evaluation.unit,
        supplierOverlapIds: evaluation.overlappingSupplierIds,
        compatibilityVerified: evaluation.canConsolidate,
        incompatibilityReasons: evaluation.incompatibilityReasons,
        status: evaluation.canConsolidate ? 'IDENTIFIED' : 'DISMISSED',
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: { evaluation, saved } }, { status: 201 });
  } catch (error: any) {
    console.error('[Multi-Project Intelligence POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Consolidation evaluation failed' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { computeProcurementTimingForecast } from '@/lib/construction-procurement/timing-intelligence';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const [projects, milestones, inventory, deliveries] = await Promise.all([
      db.constructionProject.findMany({ where: { organisationId: { in: orgIds }, deletedAt: null } }),
      db.projectMilestone.findMany({ where: { organisationId: { in: orgIds } }, orderBy: { plannedStartDate: 'asc' } }),
      db.inventoryRecord.findMany({ where: { organisationId: { in: orgIds } } }),
      db.procurementDelivery.findMany({ where: { organisationId: { in: orgIds } } }),
    ]);

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));

    const forecasts = milestones.map((m) => {
      const inv = inventory.find(
        (i) => i.projectId === m.projectId && i.materialCategorySlug === m.materialCategorySlug
      );
      const received = deliveries
        .filter((d) => d.unit === m.unit)
        .reduce((acc, d) => acc + d.receivedQuantity, 0);
      const openOrdered = deliveries
        .filter((d) => d.unit === m.unit && !['DELIVERED', 'CANCELLED'].includes(d.status))
        .reduce((acc, d) => acc + Math.max(0, d.orderedQuantity - d.receivedQuantity), 0);

      return computeProcurementTimingForecast({
        projectId: m.projectId,
        projectName: projectMap.get(m.projectId) || 'Construction Project',
        milestoneName: m.name,
        materialName: m.materialName,
        unit: m.unit,
        boqRequiredQuantity: m.boqPlannedQuantity,
        availableStockQuantity: inv?.availableQuantity ?? 0,
        openPoOrderedQuantity: openOrdered,
        alreadyReceivedQuantity: received,
        safetyStockQuantity: m.safetyStockQuantity,
        requiredByDateIso: m.plannedStartDate.toISOString().split('T')[0],
        leadTimeDays: m.leadTimeDays,
      });
    });

    return NextResponse.json({ success: true, data: { forecasts, milestonesCount: milestones.length } });
  } catch (error) {
    console.error('[Timing Intelligence GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute timing forecasts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;

    if (body.recordType === 'INVENTORY') {
      if (!body.projectId || !body.materialCategorySlug || !body.materialName) {
        return NextResponse.json({ success: false, error: 'projectId, materialCategorySlug, and materialName are required.' }, { status: 400 });
      }
      const inv = await db.inventoryRecord.upsert({
        where: {
          organisationId_projectId_materialCategorySlug_materialName: {
            organisationId,
            projectId: body.projectId,
            materialCategorySlug: body.materialCategorySlug,
            materialName: body.materialName,
          },
        },
        update: {
          availableQuantity: Number(body.availableQuantity ?? 0),
          reorderThresholdQuantity: Number(body.reorderThresholdQuantity ?? 0),
          lastCountedAt: new Date(),
          updatedByUserId: session.user.id,
        },
        create: {
          organisationId,
          projectId: body.projectId,
          materialCategorySlug: body.materialCategorySlug,
          materialName: body.materialName,
          specificationSummary: body.specificationSummary || 'Standard BIS Spec',
          unit: body.unit || 'MT',
          availableQuantity: Number(body.availableQuantity ?? 0),
          reorderThresholdQuantity: Number(body.reorderThresholdQuantity ?? 0),
          updatedByUserId: session.user.id,
        },
      });
      return NextResponse.json({ success: true, data: inv }, { status: 201 });
    }

    if (!body.projectId || !body.name || !body.materialCategorySlug || !body.materialName || !body.boqPlannedQuantity || !body.plannedStartDate) {
      return NextResponse.json(
        { success: false, error: 'projectId, name, materialCategorySlug, materialName, boqPlannedQuantity, and plannedStartDate are required.' },
        { status: 400 }
      );
    }

    const milestone = await db.projectMilestone.create({
      data: {
        organisationId,
        projectId: body.projectId,
        name: body.name,
        phaseCode: body.phaseCode || null,
        plannedStartDate: new Date(body.plannedStartDate),
        plannedEndDate: body.plannedEndDate ? new Date(body.plannedEndDate) : new Date(body.plannedStartDate),
        materialCategorySlug: body.materialCategorySlug,
        materialName: body.materialName,
        boqPlannedQuantity: Number(body.boqPlannedQuantity),
        unit: body.unit || 'MT',
        leadTimeDays: Number(body.leadTimeDays ?? 14),
        safetyStockQuantity: Number(body.safetyStockQuantity ?? 0),
      },
    });

    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
  } catch (error: any) {
    console.error('[Timing Intelligence POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save planning record' }, { status: 400 });
  }
}

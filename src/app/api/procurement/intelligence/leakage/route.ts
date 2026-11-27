import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { formatInrFromPaise, rupeesToPaise } from '@/lib/construction-procurement/money';
import { runProcurementLeakageScan } from '@/lib/construction-procurement/leakage-detector';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    const alerts = await db.leakageAlert.findMany({
      where: isAdmin ? {} : { organisationId: { in: orgIds } },
      orderBy: { detectedAt: 'desc' },
    });

    const { searchParams } = new URL(request.url);
    if (searchParams.get('format') === 'csv') {
      const header = 'AlertCode,Category,Severity,Material,Supplier,TransactionRef,Status,PotentialExposureINR,ConfirmedLeakageINR,RecoveredSavingsINR,DetectedAt';
      const lines = alerts.map((a) =>
        [
          a.alertCode,
          a.category,
          a.severity,
          `"${a.materialName.replace(/"/g, '""')}"`,
          `"${(a.supplierName || '').replace(/"/g, '""')}"`,
          a.transactionRef,
          a.status,
          (Number(a.potentialExposurePaise) / 100).toFixed(2),
          (Number(a.confirmedLeakagePaise) / 100).toFixed(2),
          (Number(a.recoveredSavingsPaise) / 100).toFixed(2),
          a.detectedAt.toISOString(),
        ].join(',')
      );
      return new NextResponse([header, ...lines].join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="proventa-leakage-audit.csv"',
        },
      });
    }

    const potentialExposurePaise = alerts.reduce((acc, a) => acc + a.potentialExposurePaise, BigInt(0));
    const confirmedLeakagePaise = alerts.reduce((acc, a) => acc + a.confirmedLeakagePaise, BigInt(0));
    const recoveredSavingsPaise = alerts.reduce((acc, a) => acc + a.recoveredSavingsPaise, BigInt(0));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAlerts: alerts.length,
          openInvestigations: alerts.filter((a) => ['OPEN', 'UNDER_INVESTIGATION'].includes(a.status)).length,
          resolvedCases: alerts.filter((a) => ['RESOLVED', 'DISMISSED', 'CONFIRMED_LEAKAGE'].includes(a.status)).length,
          potentialExposurePaise: potentialExposurePaise.toString(),
          potentialExposureFormatted: formatInrFromPaise(potentialExposurePaise),
          confirmedLeakagePaise: confirmedLeakagePaise.toString(),
          confirmedLeakageFormatted: formatInrFromPaise(confirmedLeakagePaise),
          recoveredSavingsPaise: recoveredSavingsPaise.toString(),
          recoveredSavingsFormatted: formatInrFromPaise(recoveredSavingsPaise),
        },
        alerts: alerts.map((a) => ({
          ...a,
          detectedAmountPaise: a.detectedAmountPaise.toString(),
          detectedAmountFormatted: formatInrFromPaise(a.detectedAmountPaise),
          baselineAmountPaise: a.baselineAmountPaise ? a.baselineAmountPaise.toString() : null,
          baselineAmountFormatted: a.baselineAmountPaise ? formatInrFromPaise(a.baselineAmountPaise) : '—',
          potentialExposurePaise: a.potentialExposurePaise.toString(),
          potentialExposureFormatted: formatInrFromPaise(a.potentialExposurePaise),
          confirmedLeakagePaise: a.confirmedLeakagePaise.toString(),
          recoveredSavingsPaise: a.recoveredSavingsPaise.toString(),
        })),
      },
    });
  } catch (error) {
    console.error('[Leakage Detector GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load leakage alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = businesses[0]?.id || session.user.id;
    const body = await request.json().catch(() => ({}));

    // Scan persisted Purchase Orders and Three-Way Match invoices for this organisation
    const [orders, matchRecords] = await Promise.all([
      db.procurementOrder.findMany({ where: { buyerBusinessId: organisationId } }),
      db.threeWayMatchRecord.findMany({ where: { organisationId } }),
    ]);

    const findings = runProcurementLeakageScan({
      organisationId,
      priceDeviationThresholdPct: Number(body.priceDeviationThresholdPct ?? 8),
      purchaseOrders: orders.map((o) => ({
        poId: o.id,
        materialName: 'Procurement Order Material',
        specificationSignature: o.rfqId,
        supplierBusinessId: o.supplierBusinessId || o.supplierId,
        supplierName: o.supplierName,
        quantity: 1,
        unitLandedPaise: BigInt(Math.round((o.totalAmount || 0) * 100)),
        totalAmountPaise: BigInt(Math.round((o.totalAmount || 0) * 100)),
        createdAtIso: o.createdAt.toISOString(),
      })),
      invoices: matchRecords.map((m) => ({
        invoiceNumber: m.invoiceNumber,
        purchaseOrderId: m.purchaseOrderId,
        supplierBusinessId: m.supplierGstin,
        supplierName: m.supplierGstin,
        materialName: `PO ${m.purchaseOrderId}`,
        billedQuantity: 1,
        grnAcceptedQuantity: m.status === 'QUANTITY_DISCREPANCY' ? 0.9 : 1,
        invoiceTotalPaise: m.invoiceTotalPaise,
        poTotalPaise: m.poTotalPaise,
      })),
    });

    const createdAlerts = [];
    for (const f of findings) {
      const alertCode = `LKG-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const created = await db.leakageAlert.create({
        data: {
          organisationId,
          alertCode,
          category: f.category,
          severity: f.severity,
          projectId: f.projectId || null,
          materialName: f.materialName,
          supplierBusinessId: f.supplierBusinessId || null,
          supplierName: f.supplierName || null,
          transactionType: f.transactionType,
          transactionRef: f.transactionRef,
          detectedAmountPaise: f.detectedAmountPaise,
          baselineAmountPaise: f.baselineAmountPaise,
          potentialExposurePaise: f.potentialExposurePaise,
          percentageDeviation: f.percentageDeviation,
          explanation: f.explanation,
          supportingEvidenceJson: f.supportingEvidence as any,
          status: 'OPEN',
          auditTrailJson: [
            {
              timestampIso: new Date().toISOString(),
              actorUserId: session.user.id,
              action: 'DETECTED',
              note: f.explanation,
            },
          ],
        },
      });
      createdAlerts.push(created);
    }

    return NextResponse.json({
      success: true,
      data: {
        scannedOrders: orders.length,
        scannedInvoices: matchRecords.length,
        newAlertsCreated: createdAlerts.length,
      },
    });
  } catch (error: any) {
    console.error('[Leakage Detector POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Leakage scan failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.alertId || !body.status) {
      return NextResponse.json({ success: false, error: 'alertId and status are required.' }, { status: 400 });
    }
    if (body.status === 'DISMISSED' && !body.dismissalReason?.trim()) {
      return NextResponse.json({ success: false, error: 'A mandatory reason is required to dismiss an alert.' }, { status: 400 });
    }

    const existing = await db.leakageAlert.findUnique({ where: { id: body.alertId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Leakage alert not found' }, { status: 404 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));
    if (!isAdmin && !orgIds.includes(existing.organisationId)) {
      return NextResponse.json({ success: false, error: 'Forbidden: Cross-organisation access denied' }, { status: 403 });
    }

    const priorTrail = Array.isArray(existing.auditTrailJson) ? (existing.auditTrailJson as any[]) : [];
    const nextTrail = [
      ...priorTrail,
      {
        timestampIso: new Date().toISOString(),
        actorUserId: session.user.id,
        previousStatus: existing.status,
        newStatus: body.status,
        note: body.resolutionNotes || body.dismissalReason || 'Status updated',
      },
    ];

    const updated = await db.leakageAlert.update({
      where: { id: existing.id },
      data: {
        status: body.status,
        assignedReviewerUserId: body.assignedReviewerUserId || existing.assignedReviewerUserId || session.user.id,
        resolutionNotes: body.resolutionNotes ?? existing.resolutionNotes,
        correctiveAction: body.correctiveAction ?? existing.correctiveAction,
        dismissalReason: body.dismissalReason ?? existing.dismissalReason,
        confirmedLeakagePaise:
          body.confirmedLeakageRupees !== undefined
            ? rupeesToPaise(body.confirmedLeakageRupees)
            : existing.confirmedLeakagePaise,
        recoveredSavingsPaise:
          body.recoveredSavingsRupees !== undefined
            ? rupeesToPaise(body.recoveredSavingsRupees)
            : existing.recoveredSavingsPaise,
        resolvedAt: ['RESOLVED', 'DISMISSED'].includes(body.status) ? new Date() : existing.resolvedAt,
        auditTrailJson: nextTrail,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        detectedAmountPaise: updated.detectedAmountPaise.toString(),
        potentialExposurePaise: updated.potentialExposurePaise.toString(),
        confirmedLeakagePaise: updated.confirmedLeakagePaise.toString(),
        recoveredSavingsPaise: updated.recoveredSavingsPaise.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Leakage Detector PATCH]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update leakage alert' }, { status: 500 });
  }
}

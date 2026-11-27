import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { formatInrFromPaise } from '@/lib/construction-procurement/money';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));
    const orgFilter = isAdmin ? {} : { organisationId: { in: orgIds } };
    const buyerBizFilter = isAdmin ? {} : { buyerBusinessId: { in: orgIds } };

    const [
      projectsCount,
      openRequirementsCount,
      activeRfqsCount,
      pendingApprovalsCount,
      orders,
      deliveries,
      invoices,
      savingsRecords,
    ] = await Promise.all([
      db.constructionProject.count({ where: { ...orgFilter, deletedAt: null } }),
      db.procurementRequirement.count({ where: { ...orgFilter, deletedAt: null, status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } } }),
      db.procurementRfq.count({ where: { ...buyerBizFilter, status: { in: ['OPEN', 'QUOTED'] } } }),
      db.procurementApprovalRecord.count({ where: { ...orgFilter, status: 'PENDING' } }),
      db.procurementOrder.findMany({ where: buyerBizFilter, select: { id: true, totalAmount: true, status: true } }),
      db.procurementDelivery.findMany({ where: orgFilter, select: { id: true, status: true, expectedDeliveryDate: true } }),
      db.threeWayMatchRecord.findMany({ where: orgFilter, select: { id: true, status: true, paymentStatus: true, invoiceTotalPaise: true } }),
      db.procurementSavingsRecord.findMany({ where: orgFilter }),
    ]);

    const now = Date.now();
    const pendingDeliveriesCount = deliveries.filter((d) =>
      ['AWAITING_SUPPLIER_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT', 'PARTIALLY_DELIVERED'].includes(d.status)
    ).length;

    const delayedDeliveriesCount = deliveries.filter(
      (d) =>
        d.expectedDeliveryDate &&
        new Date(d.expectedDeliveryDate).getTime() < now &&
        !['DELIVERED', 'CANCELLED'].includes(d.status)
    ).length;

    const outstandingInvoicesCount = invoices.filter((i) => i.paymentStatus !== 'PAID').length;
    const totalExpenditurePaise = orders.reduce(
      (acc, o) => acc + BigInt(Math.round((o.totalAmount || 0) * 100)),
      BigInt(0)
    );

    const potentialSavingsPaise = savingsRecords
      .filter((s) => s.classification === 'POTENTIAL')
      .reduce((acc, s) => acc + s.savingsTotalPaise, BigInt(0));

    const realisedSavingsPaise = savingsRecords
      .filter((s) => s.classification === 'REALISED')
      .reduce((acc, s) => acc + s.savingsTotalPaise, BigInt(0));

    return NextResponse.json({
      success: true,
      data: {
        projectsCount,
        openRequirementsCount,
        activeRfqsCount,
        pendingApprovalsCount,
        activePurchaseOrdersCount: orders.length,
        pendingDeliveriesCount,
        delayedDeliveriesCount,
        outstandingInvoicesCount,
        totalExpenditurePaise: totalExpenditurePaise.toString(),
        totalExpenditureFormatted: formatInrFromPaise(totalExpenditurePaise),
        potentialSavingsPaise: potentialSavingsPaise.toString(),
        potentialSavingsFormatted: formatInrFromPaise(potentialSavingsPaise),
        realisedSavingsPaise: realisedSavingsPaise.toString(),
        realisedSavingsFormatted: formatInrFromPaise(realisedSavingsPaise),
        dataIntegrityNote:
          'All metrics are computed strictly from authorised database records. Potential and realised savings are tracked separately.',
      },
    });
  } catch (error) {
    console.error('[Procurement Analytics GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to compute procurement analytics' }, { status: 500 });
  }
}

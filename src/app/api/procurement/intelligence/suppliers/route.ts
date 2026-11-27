import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import {
  DEFAULT_RELIABILITY_WEIGHTS,
  validateReliabilityWeights,
  type ReliabilityWeights,
} from '@/lib/construction-procurement/supplier-reliability';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const [config, snapshots] = await Promise.all([
      db.supplierReliabilityConfig.findUnique({ where: { configKey: 'DEFAULT' } }),
      db.supplierReliabilitySnapshot.findMany({
        where: { OR: [{ organisationId: null }, { organisationId: { in: orgIds } }] },
        orderBy: { calculatedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        weights: config || DEFAULT_RELIABILITY_WEIGHTS,
        snapshots,
        governanceNote:
          'Supplier reliability scores are strictly evidence-based with minimum sample-size enforcement. Suppliers cannot purchase or directly modify scores.',
      },
    });
  } catch (error) {
    console.error('[Supplier Reliability GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load supplier reliability intelligence' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    // Action 1: Admin configures reliability scoring weights
    if (body.action === 'UPDATE_WEIGHTS') {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Only Platform Administrators may modify scoring weights.' },
          { status: 403 }
        );
      }
      const weights: ReliabilityWeights = {
        deliveryReliabilityPct: Number(body.deliveryReliabilityPct),
        qualityPerformancePct: Number(body.qualityPerformancePct),
        quantityFulfilmentPct: Number(body.quantityFulfilmentPct),
        quotationResponsePct: Number(body.quotationResponsePct),
        commercialAccuracyPct: Number(body.commercialAccuracyPct),
        disputePerformancePct: Number(body.disputePerformancePct),
        documentationPct: Number(body.documentationPct),
        minSampleTransactions: Number(body.minSampleTransactions ?? 3),
      };
      validateReliabilityWeights(weights);

      const saved = await db.supplierReliabilityConfig.upsert({
        where: { configKey: 'DEFAULT' },
        update: { ...weights, updatedByUserId: session.user.id },
        create: { configKey: 'DEFAULT', ...weights, updatedByUserId: session.user.id },
      });

      return NextResponse.json({ success: true, data: saved });
    }

    // Action 2: Supplier submits factual correction dispute (routed to admin, never directly alters score)
    if (body.action === 'SUBMIT_CORRECTION_DISPUTE') {
      if (!body.supplierBusinessId || !body.reason?.trim()) {
        return NextResponse.json(
          { success: false, error: 'supplierBusinessId and factual correction reason are required.' },
          { status: 400 }
        );
      }
      const dispute = await db.supplierScoreDispute.create({
        data: {
          supplierBusinessId: body.supplierBusinessId,
          submittedByUserId: session.user.id,
          reason: body.reason.trim(),
          supportingEvidenceRef: body.supportingEvidenceRef || null,
          status: 'OPEN',
        },
      });
      return NextResponse.json({ success: true, data: dispute }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Supplier Reliability POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Reliability operation failed' }, { status: 400 });
  }
}

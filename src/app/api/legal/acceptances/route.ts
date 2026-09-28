import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { POLICY_VERSIONS, POLICY_EFFECTIVE_DATES } from '@/lib/legal/versions';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const [totalAcceptances, acceptancesByType, recentAcceptances, privacyRequests] = await Promise.all([
      db.policyAcceptance.count(),
      db.policyAcceptance.groupBy({
        by: ['policyType', 'policyVersion'],
        _count: { id: true },
      }),
      db.policyAcceptance.findMany({
        take: 50,
        orderBy: { acceptedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      }),
      db.privacyRequest.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      currentVersions: POLICY_VERSIONS,
      effectiveDates: POLICY_EFFECTIVE_DATES,
      metrics: {
        totalAcceptances,
        breakdown: acceptancesByType.map((b) => ({
          policyType: b.policyType,
          policyVersion: b.policyVersion,
          count: b._count.id,
        })),
      },
      recentAcceptances,
      privacyRequests,
    });
  } catch (error: any) {
    console.error('[GET /api/legal/acceptances]', error);
    return NextResponse.json({ error: error.message || 'Unauthorized or failed' }, { status: 403 });
  }
}

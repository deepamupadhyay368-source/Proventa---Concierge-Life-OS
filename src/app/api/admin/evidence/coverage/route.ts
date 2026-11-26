import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { assessLocalityCoverage } from '@/lib/real-estate/evidence-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userRoles = (session.user.roles as string[]) || [];
    const isAuthorized = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'MODERATOR'].includes(r)
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin privileges required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const localityId = searchParams.get('localityId');

    if (localityId) {
      const assessment = await assessLocalityCoverage(localityId);
      return NextResponse.json({ success: true, data: assessment });
    }

    // Retrieve all active localities with projects and assess each
    const localities = await db.locality.findMany({
      where: { activeStatus: true },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            valuationEligibility: true,
          },
        },
        transactions: {
          select: { id: true, verificationStatus: true, registrationDate: true },
        },
        listings: {
          select: { id: true, verificationStatus: true, listingDate: true },
        },
        jantriBenchmarks: {
          select: { id: true, verificationStatus: true, residentialApartmentRateSqFt: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const summary = localities.map((loc) => {
      const verifiedTx = loc.transactions.filter((t) => t.verificationStatus === 'VERIFIED').length;
      const pendingTx = loc.transactions.filter((t) => t.verificationStatus === 'PENDING_VERIFICATION').length;
      const verifiedListings = loc.listings.filter((l) => l.verificationStatus === 'VERIFIED').length;
      const pendingListings = loc.listings.filter((l) => l.verificationStatus === 'PENDING_VERIFICATION').length;
      const verifiedJantri = loc.jantriBenchmarks.filter((j) => j.verificationStatus === 'VERIFIED').length;
      const total = loc.transactions.length + loc.listings.length + loc.jantriBenchmarks.length;

      const gaps: string[] = [];
      if (verifiedTx < 3) gaps.push(`Verified transactions: ${verifiedTx}/3 required`);
      if (verifiedJantri === 0) gaps.push('No verified Jantri baseline');
      if (verifiedListings === 0 && verifiedTx === 0) gaps.push('No recent market observations');

      return {
        id: loc.id,
        slug: loc.slug,
        name: loc.name,
        city: loc.city,
        zone: loc.zone,
        totalRecords: total,
        verifiedTransactionsCount: verifiedTx,
        pendingTransactionsCount: pendingTx,
        verifiedListingsCount: verifiedListings,
        pendingListingsCount: pendingListings,
        verifiedJantriCount: verifiedJantri,
        totalProjects: loc.projects.length,
        valuationEligibility: loc.valuationEligibility,
        valuationReady: loc.valuationReady,
        evidenceGaps: gaps,
        projects: loc.projects,
        updatedAt: loc.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: summary,
      count: summary.length,
    });
  } catch (error: any) {
    console.error('[API admin/evidence/coverage GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Coverage assessment failure' },
      { status: 500 }
    );
  }
}

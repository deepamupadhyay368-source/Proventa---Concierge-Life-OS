import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth/session';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';
import { createMission, listCustomerMissions } from '@/lib/marketplace/mission-service';
import type { MissionStage } from '@/lib/marketplace/mission-types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') as MissionStage | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const missions = listCustomerMissions(user.id, {
      stage: stage || undefined,
      limit,
    });

    return NextResponse.json({
      items: missions,
      total: missions.length,
    });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'mission_create',
      max: 20,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    // Support authenticated user or provisional guest
    const session = await getSession();
    const body = await req.json();

    const customerUser = session?.user?.id
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      : {
          id: body.guestId || `guest_${Date.now()}`,
          name: body.customerName || 'Enterprise Guest',
          email: body.customerEmail || null,
          phone: body.customerPhone || null,
        };

    const mission = await createMission(customerUser, {
      naturalLanguagePrompt: body.naturalLanguagePrompt || body.description || '',
      structuredOverrides: {
        city: body.city,
        budgetMin: body.budgetMin ? Number(body.budgetMin) : undefined,
        budgetMax: body.budgetMax ? Number(body.budgetMax) : undefined,
        timeline: body.timeline,
        urgencyLevel: body.urgencyLevel,
        categorySlug: body.categorySlug || body.categoryId,
        deliveryMode: body.deliveryMode,
      },
    });

    if (session?.user?.id) {
      await createAuditLog({
        actorId: session.user.id,
        actorRole: (session.user as { roles?: string[] })?.roles?.[0] ?? 'CUSTOMER',
        action: 'CREATE',
        resourceType: 'Mission',
        resourceId: mission.id,
        after: {
          referenceCode: mission.referenceCode,
          title: mission.title,
          stage: mission.missionStage,
          candidateCount: mission.candidateSuppliers.length,
        },
      });
    }

    return NextResponse.json({ mission }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

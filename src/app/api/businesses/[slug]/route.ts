import { NextRequest, NextResponse } from 'next/server';
import {
  getBusinessBySlug,
  submitBusinessReview,
  updateBusinessProfile,
} from '@/lib/marketplace/repository';
import { getSession, isAdminOrModerator, requireAuth, type SessionUser } from '@/lib/auth/session';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const session = await getSession();
    const viewer = session?.user as SessionUser | undefined;
    const { searchParams } = new URL(req.url);
    const incrementView = searchParams.get('view') !== 'false';

    const result = getBusinessBySlug(slug, {
      viewerUserId: viewer?.id ?? null,
      isAdmin: isAdminOrModerator(viewer),
      incrementView,
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    const updated = updateBusinessProfile(
      user.id,
      slug,
      body,
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'UPDATE',
      resourceType: 'Business',
      resourceId: updated.id,
      after: {
        name: updated.name,
        slug: updated.slug,
        status: updated.status,
      },
    });

    return NextResponse.json({ business: updated });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const user = await requireAuth();
    const body = await req.json();

    const { business } = getBusinessBySlug(slug, {
      viewerUserId: user.id,
      isAdmin: isAdminOrModerator(user),
      incrementView: false,
    });

    const review = submitBusinessReview(user, {
      ...body,
      businessId: business.id,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

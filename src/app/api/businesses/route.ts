import { NextRequest, NextResponse } from 'next/server';
import {
  createBusinessProfile,
  getBusinessesByUser,
  searchBusinesses,
} from '@/lib/marketplace/repository';
import type {
  BusinessType,
  DirectorySearchParams,
  VerificationLevel,
} from '@/lib/marketplace/types';
import { getSession, requireAuth } from '@/lib/auth/session';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine') === 'true';

    if (mine) {
      const user = await requireAuth();
      const businesses = getBusinessesByUser(user.id);
      return NextResponse.json({ items: businesses, total: businesses.length });
    }

    const params: DirectorySearchParams = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      categorySlug: searchParams.get('category') || undefined,
      subcategorySlug: searchParams.get('subcategory') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      businessType: (searchParams.get('type') as BusinessType) || undefined,
      verificationLevel:
        (searchParams.get('verification') as VerificationLevel) || undefined,
      servesPanIndia:
        searchParams.get('panIndia') === 'true' ? true : undefined,
      sortBy:
        (searchParams.get('sort') as DirectorySearchParams['sortBy']) ||
        'relevance',
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 12),
    };

    const result = searchBusinesses(params);
    return NextResponse.json(result);
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = rateLimitMiddleware(req, {
      keyPrefix: 'biz_register',
      max: 15,
      windowMs: 60_000,
    });
    if (rateLimited) return rateLimited;

    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Please sign in or create an account to register your business profile',
          code: 'AUTHENTICATION_REQUIRED',
        },
        { status: 401 },
      );
    }

    const body = await req.json();
    const business = createBusinessProfile(userId, body);

    // Grant BUSINESS_OWNER role in DB if possible (non-blocking)
    await db.userRoleAssignment
      .upsert({
        where: {
          userId_role: {
            userId,
            role: 'BUSINESS_OWNER' as never,
          },
        },
        update: { revokedAt: null },
        create: {
          userId,
          role: 'BUSINESS_OWNER' as never,
          grantedBy: 'SYSTEM_ONBOARDING',
        },
      })
      .catch(() => null);

    await createAuditLog({
      actorId: userId,
      actorRole: 'BUSINESS_OWNER',
      action: 'CREATE',
      resourceType: 'Business',
      resourceId: business.id,
      after: {
        name: business.name,
        slug: business.slug,
        city: business.city,
        status: business.status,
      },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

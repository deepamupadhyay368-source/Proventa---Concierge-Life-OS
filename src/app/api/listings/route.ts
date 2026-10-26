import { NextRequest, NextResponse } from 'next/server';
import {
  createBusinessListing,
  searchListings,
} from '@/lib/marketplace/repository';
import type {
  ListingSearchParams,
  ListingType,
  PriceDisplayType,
} from '@/lib/marketplace/types';
import { isAdminOrModerator, requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: ListingSearchParams = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      categorySlug: searchParams.get('category') || undefined,
      subcategorySlug: searchParams.get('subcategory') || undefined,
      businessId: searchParams.get('businessId') || undefined,
      listingType: (searchParams.get('type') as ListingType) || undefined,
      priceDisplayType:
        (searchParams.get('priceMode') as PriceDisplayType) || undefined,
      city: searchParams.get('city') || undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      sortBy:
        (searchParams.get('sort') as ListingSearchParams['sortBy']) ||
        'relevance',
      page: Number(searchParams.get('page') || 1),
      limit: Number(searchParams.get('limit') || 12),
    };

    const result = searchListings(params);
    return NextResponse.json(result);
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const listing = createBusinessListing(
      user.id,
      body,
      isAdminOrModerator(user),
    );

    await createAuditLog({
      actorId: user.id,
      actorRole: user.roles?.[0] ?? 'BUSINESS_OWNER',
      action: 'CREATE',
      resourceType: 'BusinessListing',
      resourceId: listing.id,
      after: {
        title: listing.title,
        businessId: listing.businessId,
        listingType: listing.listingType,
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

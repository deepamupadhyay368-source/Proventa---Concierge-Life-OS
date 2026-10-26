import { NextRequest, NextResponse } from 'next/server';
import {
  getSavedItemsForUser,
  toggleSavedBusiness,
  toggleSavedListing,
} from '@/lib/marketplace/repository';
import { requireAuth } from '@/lib/auth/session';
import { isAppError, toSafeError, ValidationError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();
    const saved = getSavedItemsForUser(user.id);
    return NextResponse.json(saved);
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.businessId) {
      const result = toggleSavedBusiness(user.id, String(body.businessId));
      return NextResponse.json(result);
    }
    if (body.listingId) {
      const result = toggleSavedListing(user.id, String(body.listingId));
      return NextResponse.json(result);
    }

    throw new ValidationError('Either businessId or listingId is required');
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

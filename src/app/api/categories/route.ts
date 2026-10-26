import { NextRequest, NextResponse } from 'next/server';
import {
  createCategory,
  getCategories,
  getCategoryBySlugOrId,
} from '@/lib/marketplace/repository';
import { requireModerator } from '@/lib/auth/session';
import { isAppError, toSafeError } from '@/lib/errors';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const flat = searchParams.get('flat') === 'true';

    if (slug) {
      const category = getCategoryBySlugOrId(slug);
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }
      return NextResponse.json({ category });
    }

    const categories = getCategories({
      includeInactive,
      onlyTopLevel: !flat,
    });

    return NextResponse.json({ categories, total: categories.length });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireModerator();
    const body = await req.json();

    const category = createCategory(body);

    await createAuditLog({
      actorId: actor.id,
      actorRole: actor.roles?.[0] ?? 'ADMIN',
      action: 'CREATE',
      resourceType: 'MarketplaceCategory',
      resourceId: category.id,
      after: category,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    const status = isAppError(err) ? err.statusCode : 500;
    return NextResponse.json(toSafeError(err), { status });
  }
}

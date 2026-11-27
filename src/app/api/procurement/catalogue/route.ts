import { NextResponse } from 'next/server';
import { CONSTRUCTION_MATERIAL_TAXONOMY } from '@/lib/construction-procurement/taxonomy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division');
  const q = searchParams.get('q')?.trim().toLowerCase();

  let categories = CONSTRUCTION_MATERIAL_TAXONOMY;
  if (division && division !== 'ALL') {
    categories = categories.filter((c) => c.division === division);
  }
  if (q) {
    categories = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.standardReference.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    data: categories,
    totalCount: categories.length,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import {
  detectDuplicateRegistryProperty,
  formatHierarchyBreadcrumbs,
  generateProventaPropertyId,
  normalizePropertyAddressKey,
} from '@/lib/real-estate-intelligence/registry-service';
import {
  buildRateLimitHeaders,
  checkRateLimitAsync,
  getClientIpFromHeaders,
} from '@/lib/real-estate-intelligence/rate-limit';

const createRegistryPropertySchema = z.object({
  title: z.string().trim().min(3).max(160),
  address: z.string().trim().min(5).max(300),
  locality: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80).default('Ahmedabad'),
  state: z.string().trim().min(2).max(80).default('Gujarat'),
  pincode: z.string().trim().max(12).optional().nullable(),
  propertyCategory: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'INDUSTRIAL']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'OFFICE', 'PLOT', 'RETAIL', 'WAREHOUSE', 'BUNGALOW']),
  landParcelCode: z.string().trim().max(80).optional().nullable(),
  projectSlug: z.string().trim().max(120).optional().nullable(),
  buildingName: z.string().trim().max(120).optional().nullable(),
  unitNumber: z.string().trim().max(60).optional().nullable(),
  plotAreaSqFt: z.number().positive().optional().nullable(),
  carpetAreaSqFt: z.number().positive().optional().nullable(),
  builtUpAreaSqFt: z.number().positive().optional().nullable(),
  constructionStatus: z.enum(['READY_TO_MOVE', 'UNDER_CONSTRUCTION', 'NEW_LAUNCH', 'RESALE']).default('READY_TO_MOVE'),
  buildingAgeYears: z.number().int().min(0).max(150).optional().nullable(),
  floorInfo: z.string().trim().max(60).optional().nullable(),
  configuration: z.string().trim().max(60).optional().nullable(),
  developerName: z.string().trim().max(120).optional().nullable(),
  reraNumber: z.string().trim().max(80).optional().nullable(),
  registrationRef: z.string().trim().max(80).optional().nullable(),
  sourceProvenance: z.string().trim().min(3).max(200).default('User-submitted registry record'),
});

/**
 * GET /api/real-estate/registry
 * Public Living Property Registry search.
 * STRICT PRIVACY: Only returns records with isPublicRegistry=true and deletedAt=null.
 * Private Property OS passports are NEVER queried or returned here.
 */
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(req.headers);
    const rl = await checkRateLimitAsync(`registry-get:${ip}`, 90, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for Property Registry search.' },
        { status: 429, headers: buildRateLimitHeaders(rl) }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const locality = searchParams.get('locality')?.trim() || '';
    const propertyType = searchParams.get('propertyType')?.trim() || '';
    const verificationStatus = searchParams.get('verificationStatus')?.trim() || '';
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 25), 1), 100);

    const where: Record<string, unknown> = {
      isPublicRegistry: true,
      deletedAt: null,
    };

    if (locality) {
      where.locality = { equals: locality, mode: 'insensitive' };
    }
    if (propertyType) {
      where.propertyType = { equals: propertyType, mode: 'insensitive' };
    }
    if (
      verificationStatus &&
      ['VERIFIED', 'UNVERIFIED', 'USER_SUBMITTED', 'EXTERNALLY_SOURCED', 'REJECTED'].includes(verificationStatus)
    ) {
      where.verificationStatus = verificationStatus;
    }
    if (q) {
      where.OR = [
        { proventaPropertyId: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { locality: { contains: q, mode: 'insensitive' } },
        { buildingName: { contains: q, mode: 'insensitive' } },
        { projectSlug: { contains: q, mode: 'insensitive' } },
        { reraNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, totalCount] = await Promise.all([
      db.registryProperty.findMany({
        where,
        include: {
          lifecycleEvents: {
            orderBy: { eventDate: 'desc' },
            take: 5,
          },
        },
        orderBy: [{ verificationStatus: 'asc' }, { updatedAt: 'desc' }],
        take: limit,
      }),
      db.registryProperty.count({ where }),
    ]);

    return NextResponse.json({
      totalCount,
      properties: items.map((item) => ({
        id: item.id,
        proventaPropertyId: item.proventaPropertyId,
        hierarchy: formatHierarchyBreadcrumbs(item),
        landParcelCode: item.landParcelCode,
        projectSlug: item.projectSlug,
        buildingName: item.buildingName,
        unitNumber: item.unitNumber,
        propertyCategory: item.propertyCategory,
        propertyType: item.propertyType,
        title: item.title,
        address: item.address,
        locality: item.locality,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        plotAreaSqFt: item.plotAreaSqFt,
        carpetAreaSqFt: item.carpetAreaSqFt,
        builtUpAreaSqFt: item.builtUpAreaSqFt,
        constructionStatus: item.constructionStatus,
        buildingAgeYears: item.buildingAgeYears,
        floorInfo: item.floorInfo,
        configuration: item.configuration,
        developerName: item.developerName,
        reraNumber: item.reraNumber,
        verificationStatus: item.verificationStatus,
        sourceProvenance: item.sourceProvenance,
        verifiedAt: item.verifiedAt,
        createdAt: item.createdAt,
        lifecycleEvents: item.lifecycleEvents,
      })),
      disclosure:
        'Verification badges reflect source provenance. USER_SUBMITTED and UNVERIFIED records have not undergone independent statutory title or Gujarat RERA audit.',
    });
  } catch (err) {
    console.error('[GET /api/real-estate/registry]', err);
    return NextResponse.json({ error: 'Failed to query Property Registry.' }, { status: 500 });
  }
}

/**
 * POST /api/real-estate/registry
 * Authenticated submission of a property into the Living Property Registry.
 * - Enforces duplicate detection (409 Conflict on match).
 * - Assigns permanent unique PV-PROP-... identifier.
 * - Strictly forces verificationStatus = USER_SUBMITTED (never auto-verified).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required to submit a registry property.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createRegistryPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid property submission payload.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedAddressKey = normalizePropertyAddressKey({
      address: data.address,
      locality: data.locality,
      city: data.city,
      buildingName: data.buildingName,
      unitNumber: data.unitNumber,
    });

    const existingCandidates = await db.registryProperty.findMany({
      where: {
        deletedAt: null,
        OR: [
          { normalizedAddressKey },
          ...(data.reraNumber ? [{ reraNumber: { equals: data.reraNumber, mode: 'insensitive' as const } }] : []),
        ],
      },
      select: {
        id: true,
        proventaPropertyId: true,
        title: true,
        normalizedAddressKey: true,
        reraNumber: true,
      },
      take: 25,
    });

    const dup = detectDuplicateRegistryProperty(
      {
        normalizedAddressKey,
        reraNumber: data.reraNumber,
        unitNumber: data.unitNumber,
      },
      existingCandidates
    );

    if (dup.isDuplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate property detected in Living Property Registry.',
          matchedPropertyId: dup.matchedPropertyId,
          reason: dup.reason,
        },
        { status: 409 }
      );
    }

    const proventaPropertyId = generateProventaPropertyId(data.city);

    const created = await db.registryProperty.create({
      data: {
        proventaPropertyId,
        landParcelCode: data.landParcelCode ?? null,
        projectSlug: data.projectSlug ?? null,
        buildingName: data.buildingName ?? null,
        unitNumber: data.unitNumber ?? null,
        propertyCategory: data.propertyCategory,
        propertyType: data.propertyType,
        title: data.title,
        address: data.address,
        normalizedAddressKey,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode ?? null,
        plotAreaSqFt: data.plotAreaSqFt ?? null,
        carpetAreaSqFt: data.carpetAreaSqFt ?? null,
        builtUpAreaSqFt: data.builtUpAreaSqFt ?? null,
        constructionStatus: data.constructionStatus,
        buildingAgeYears: data.buildingAgeYears ?? null,
        floorInfo: data.floorInfo ?? null,
        configuration: data.configuration ?? null,
        developerName: data.developerName ?? null,
        reraNumber: data.reraNumber ?? null,
        registrationRef: data.registrationRef ?? null,
        verificationStatus: 'USER_SUBMITTED', // Never auto-verified on user submission
        sourceProvenance: data.sourceProvenance,
        isPublicRegistry: true,
        submittedByUserId: session.user.id,
        lifecycleEvents: {
          create: {
            eventType: 'REGISTERED',
            eventDate: new Date(),
            summary: `Registered in PROVENTA Living Property Registry with permanent ID ${proventaPropertyId} (Status: USER_SUBMITTED).`,
            sourceProvenance: data.sourceProvenance,
          },
        },
      },
      include: { lifecycleEvents: true },
    });

    return NextResponse.json(
      {
        property: {
          ...created,
          hierarchy: formatHierarchyBreadcrumbs(created),
        },
        message: 'Property registered with permanent PROVENTA ID. Pending independent verification.',
      },
      { status: 201 }
    );
  } catch (err) {
    const prismaCode = (err as { code?: string })?.code;
    if (prismaCode === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate property detected in Living Property Registry (database unique constraint).' },
        { status: 409 }
      );
    }
    console.error('[POST /api/real-estate/registry]', err);
    return NextResponse.json({ error: 'Failed to register property.' }, { status: 500 });
  }
}

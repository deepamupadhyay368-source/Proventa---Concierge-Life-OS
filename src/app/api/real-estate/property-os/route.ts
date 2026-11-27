import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { computeOwnerPortfolioSummary } from '@/lib/real-estate-intelligence/property-os-service';
import { checkPassportCreationEntitlement } from '@/lib/real-estate-intelligence/entitlements';

const createPassportSchema = z.object({
  action: z.literal('CREATE_PASSPORT'),
  nickname: z.string().trim().min(2).max(120),
  propertyCategory: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'INDUSTRIAL']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'OFFICE', 'PLOT', 'RETAIL', 'WAREHOUSE', 'BUNGALOW']),
  address: z.string().trim().min(5).max(300),
  locality: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80).default('Ahmedabad'),
  linkedRegistryPropertyId: z.string().trim().optional().nullable(),
  carpetAreaSqFt: z.number().positive().optional().nullable(),
  acquisitionDate: z.string().optional().nullable(),
  purchasePriceRupees: z.number().min(0).default(0),
  currentEstimatedRupees: z.number().min(0).default(0),
  occupancyStatus: z.enum(['OWNER_OCCUPIED', 'RENTED', 'VACANT']).default('OWNER_OCCUPIED'),
  ownershipNotes: z.string().trim().max(1000).optional().nullable(),
  documentKeys: z.array(z.string().trim().min(1)).max(30).default([]),
});

const addExpenseSchema = z.object({
  action: z.literal('ADD_EXPENSE'),
  passportId: z.string().trim().min(1),
  category: z.enum([
    'ACQUISITION',
    'STAMP_DUTY_REGISTRATION',
    'PROPERTY_TAX',
    'MAINTENANCE',
    'RENOVATION',
    'UTILITIES',
    'INSURANCE',
    'BROKERAGE',
    'OTHER',
  ]),
  amountRupees: z.number().positive(),
  expenseDate: z.string().min(4),
  description: z.string().trim().min(2).max(300),
  receiptDocKey: z.string().trim().optional().nullable(),
});

const addLeaseSchema = z.object({
  action: z.literal('ADD_LEASE'),
  passportId: z.string().trim().min(1),
  tenantName: z.string().trim().min(2).max(120),
  tenantContact: z.string().trim().max(120).optional().nullable(),
  monthlyRentRupees: z.number().positive(),
  securityDepositRupees: z.number().min(0).default(0),
  leaseStartDate: z.string().min(4),
  leaseEndDate: z.string().min(4),
  status: z.enum(['ACTIVE', 'EXPIRING_SOON', 'ENDED']).default('ACTIVE'),
  agreementDocKey: z.string().trim().optional().nullable(),
});

const addMaintenanceSchema = z.object({
  action: z.literal('ADD_MAINTENANCE'),
  passportId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(160),
  contractorName: z.string().trim().max(120).optional().nullable(),
  costRupees: z.number().min(0).default(0),
  scheduledDate: z.string().optional().nullable(),
  status: z.enum(['OPEN', 'SCHEDULED', 'COMPLETED']).default('OPEN'),
  notes: z.string().trim().max(600).optional().nullable(),
});

const addTimelineSchema = z.object({
  action: z.literal('ADD_TIMELINE'),
  passportId: z.string().trim().min(1),
  eventType: z.enum([
    'ACQUISITION',
    'REGISTRATION',
    'RENOVATION',
    'REPAIR',
    'LEASE_SIGNED',
    'VALUATION_UPDATE',
    'EXPENSE',
  ]),
  eventDate: z.string().min(4),
  title: z.string().trim().min(2).max(160),
  details: z.string().trim().max(600).optional().nullable(),
});

function generatePassportCode(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PV-OS-${year}-${suffix}`;
}

function serializePassport(p: {
  id: string;
  ownerUserId: string;
  passportCode: string;
  linkedRegistryPropertyId: string | null;
  nickname: string;
  propertyCategory: string;
  propertyType: string;
  address: string;
  locality: string;
  city: string;
  carpetAreaSqFt: number | null;
  acquisitionDate: Date | null;
  purchasePricePaise: bigint;
  currentEstimatedPaise: bigint;
  ownershipNotes: string | null;
  occupancyStatus: string;
  isPrivate: boolean;
  documentKeys: string[];
  createdAt: Date;
  updatedAt: Date;
  expenses: Array<{
    id: string;
    category: string;
    amountPaise: bigint;
    expenseDate: Date;
    description: string;
    receiptDocKey: string | null;
  }>;
  leases: Array<{
    id: string;
    tenantName: string;
    tenantContact: string | null;
    monthlyRentPaise: bigint;
    securityDepositPaise: bigint;
    leaseStartDate: Date;
    leaseEndDate: Date;
    status: string;
    agreementDocKey: string | null;
  }>;
  maintenanceRecords: Array<{
    id: string;
    title: string;
    contractorName: string | null;
    costPaise: bigint;
    scheduledDate: Date | null;
    completedDate: Date | null;
    status: string;
    notes: string | null;
  }>;
  timelineEvents: Array<{
    id: string;
    eventType: string;
    eventDate: Date;
    title: string;
    details: string | null;
  }>;
  documents?: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256Checksum: string;
    createdAt: Date;
  }>;
}) {
  return {
    ...p,
    purchasePricePaise: p.purchasePricePaise.toString(),
    currentEstimatedPaise: p.currentEstimatedPaise.toString(),
    expenses: p.expenses.map((e) => ({ ...e, amountPaise: e.amountPaise.toString() })),
    leases: p.leases.map((l) => ({
      ...l,
      monthlyRentPaise: l.monthlyRentPaise.toString(),
      securityDepositPaise: l.securityDepositPaise.toString(),
    })),
    maintenanceRecords: p.maintenanceRecords.map((m) => ({
      ...m,
      costPaise: m.costPaise.toString(),
    })),
    documents: (p.documents ?? []).map((doc) => ({
      ...doc,
      downloadUrl: `/api/real-estate/property-os/documents/${doc.id}`,
    })),
  };
}

/**
 * GET /api/real-estate/property-os
 * Strictly private owner portfolio endpoint.
 * Scoped EXCLUSIVELY to ownerUserId === session.user.id.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required to access Property OS.' }, { status: 401 });
    }

    const passports = await db.propertyPassport.findMany({
      where: {
        ownerUserId: session.user.id,
        deletedAt: null,
      },
      include: {
        expenses: { orderBy: { expenseDate: 'desc' } },
        leases: { orderBy: { leaseEndDate: 'asc' } },
        maintenanceRecords: { orderBy: { createdAt: 'desc' } },
        timelineEvents: { orderBy: { eventDate: 'desc' } },
        documents: {
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            sha256Checksum: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = computeOwnerPortfolioSummary(passports);

    return NextResponse.json({
      summary,
      passports: passports.map(serializePassport),
    });
  } catch (err) {
    console.error('[GET /api/real-estate/property-os]', err);
    return NextResponse.json({ error: 'Failed to load Property OS portfolio.' }, { status: 500 });
  }
}

/**
 * POST /api/real-estate/property-os
 * Supports CREATE_PASSPORT, ADD_EXPENSE, ADD_LEASE, ADD_MAINTENANCE, ADD_TIMELINE.
 * Enforces strict ownerUserId === session.user.id ownership check (403 on cross-user IDOR).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const action = body?.action;

    if (action === 'CREATE_PASSPORT') {
      const userRoles = (session.user as { roles?: string[] }).roles ?? [];
      const entitlement = await checkPassportCreationEntitlement(userId, userRoles);
      if (!entitlement.allowed) {
        return NextResponse.json(
          {
            error: `Property Passport limit reached (${entitlement.used}/${entitlement.limit} on ${entitlement.tier} plan).`,
            entitlement,
          },
          { status: 403 }
        );
      }
      const parsed = createPassportSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid passport payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const passport = await db.propertyPassport.create({
        data: {
          ownerUserId: userId,
          passportCode: generatePassportCode(),
          linkedRegistryPropertyId: d.linkedRegistryPropertyId ?? null,
          nickname: d.nickname,
          propertyCategory: d.propertyCategory,
          propertyType: d.propertyType,
          address: d.address,
          locality: d.locality,
          city: d.city,
          carpetAreaSqFt: d.carpetAreaSqFt ?? null,
          acquisitionDate: d.acquisitionDate ? new Date(d.acquisitionDate) : null,
          purchasePricePaise: BigInt(Math.round(d.purchasePriceRupees * 100)),
          currentEstimatedPaise: BigInt(Math.round((d.currentEstimatedRupees || d.purchasePriceRupees) * 100)),
          occupancyStatus: d.occupancyStatus,
          ownershipNotes: d.ownershipNotes ?? null,
          isPrivate: true,
          documentKeys: d.documentKeys,
          timelineEvents: {
            create: {
              ownerUserId: userId,
              eventType: 'ACQUISITION',
              eventDate: d.acquisitionDate ? new Date(d.acquisitionDate) : new Date(),
              title: `Digital Property Passport created for ${d.nickname}`,
              details: `Private Property OS record initialized in ${d.locality}, ${d.city}.`,
            },
          },
        },
        include: {
          expenses: true,
          leases: true,
          maintenanceRecords: true,
          timelineEvents: true,
        },
      });
      return NextResponse.json({ passport: serializePassport(passport) }, { status: 201 });
    }

    // All child-record actions require strict ownership verification of the target passport
    const targetPassportId = typeof body?.passportId === 'string' ? body.passportId : '';
    if (!targetPassportId) {
      return NextResponse.json({ error: 'passportId is required.' }, { status: 400 });
    }

    const existingPassport = await db.propertyPassport.findUnique({
      where: { id: targetPassportId },
      select: { id: true, ownerUserId: true, deletedAt: true },
    });

    if (!existingPassport || existingPassport.deletedAt) {
      return NextResponse.json({ error: 'Property Passport not found.' }, { status: 404 });
    }
    if (existingPassport.ownerUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this private Property Passport.' },
        { status: 403 }
      );
    }

    if (action === 'ADD_EXPENSE') {
      const parsed = addExpenseSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid expense payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const expense = await db.propertyExpense.create({
        data: {
          passportId: d.passportId,
          ownerUserId: userId,
          category: d.category,
          amountPaise: BigInt(Math.round(d.amountRupees * 100)),
          expenseDate: new Date(d.expenseDate),
          description: d.description,
          receiptDocKey: d.receiptDocKey ?? null,
        },
      });
      return NextResponse.json(
        { expense: { ...expense, amountPaise: expense.amountPaise.toString() } },
        { status: 201 }
      );
    }

    if (action === 'ADD_LEASE') {
      const parsed = addLeaseSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid lease payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const lease = await db.propertyLease.create({
        data: {
          passportId: d.passportId,
          ownerUserId: userId,
          tenantName: d.tenantName,
          tenantContact: d.tenantContact ?? null,
          monthlyRentPaise: BigInt(Math.round(d.monthlyRentRupees * 100)),
          securityDepositPaise: BigInt(Math.round(d.securityDepositRupees * 100)),
          leaseStartDate: new Date(d.leaseStartDate),
          leaseEndDate: new Date(d.leaseEndDate),
          status: d.status,
          agreementDocKey: d.agreementDocKey ?? null,
        },
      });
      return NextResponse.json(
        {
          lease: {
            ...lease,
            monthlyRentPaise: lease.monthlyRentPaise.toString(),
            securityDepositPaise: lease.securityDepositPaise.toString(),
          },
        },
        { status: 201 }
      );
    }

    if (action === 'ADD_MAINTENANCE') {
      const parsed = addMaintenanceSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid maintenance payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const record = await db.propertyMaintenance.create({
        data: {
          passportId: d.passportId,
          ownerUserId: userId,
          title: d.title,
          contractorName: d.contractorName ?? null,
          costPaise: BigInt(Math.round(d.costRupees * 100)),
          scheduledDate: d.scheduledDate ? new Date(d.scheduledDate) : null,
          status: d.status,
          notes: d.notes ?? null,
        },
      });
      return NextResponse.json(
        { maintenance: { ...record, costPaise: record.costPaise.toString() } },
        { status: 201 }
      );
    }

    if (action === 'ADD_TIMELINE') {
      const parsed = addTimelineSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid timeline event payload.', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const d = parsed.data;
      const evt = await db.propertyTimelineEvent.create({
        data: {
          passportId: d.passportId,
          ownerUserId: userId,
          eventType: d.eventType,
          eventDate: new Date(d.eventDate),
          title: d.title,
          details: d.details ?? null,
        },
      });
      return NextResponse.json({ timelineEvent: evt }, { status: 201 });
    }

    if (action === 'ADD_DOCUMENT') {
      const docKey = typeof body?.documentKey === 'string' ? body.documentKey.trim() : '';
      if (!docKey || docKey.length > 240) {
        return NextResponse.json({ error: 'Valid documentKey (1-240 chars) is required.' }, { status: 400 });
      }
      const current = await db.propertyPassport.findUnique({
        where: { id: targetPassportId },
        select: { documentKeys: true },
      });
      const updated = await db.propertyPassport.update({
        where: { id: targetPassportId },
        data: {
          documentKeys: Array.from(new Set([...(current?.documentKeys ?? []), docKey])),
        },
        select: { id: true, documentKeys: true },
      });
      return NextResponse.json({ passport: updated }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported Property OS action.' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/real-estate/property-os]', err);
    return NextResponse.json({ error: 'Failed to update Property OS record.' }, { status: 500 });
  }
}

/**
 * PATCH /api/real-estate/property-os
 * Owner-isolated edit for PropertyExpense and PropertyLease records (403 on IDOR).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const action = body?.action;

    if (action === 'UPDATE_EXPENSE') {
      const id = String(body?.id || '').trim();
      if (!id) return NextResponse.json({ error: 'Expense id is required.' }, { status: 400 });
      const existing = await db.propertyExpense.findUnique({
        where: { id },
        select: { id: true, ownerUserId: true },
      });
      if (!existing) return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
      if (existing.ownerUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this expense.' }, { status: 403 });
      }
      const updated = await db.propertyExpense.update({
        where: { id },
        data: {
          ...(body.category ? { category: body.category } : {}),
          ...(typeof body.amountRupees === 'number' && body.amountRupees > 0
            ? { amountPaise: BigInt(Math.round(body.amountRupees * 100)) }
            : {}),
          ...(body.expenseDate ? { expenseDate: new Date(body.expenseDate) } : {}),
          ...(typeof body.description === 'string' && body.description.trim()
            ? { description: body.description.trim() }
            : {}),
        },
      });
      return NextResponse.json({
        expense: { ...updated, amountPaise: updated.amountPaise.toString() },
      });
    }

    if (action === 'UPDATE_LEASE') {
      const id = String(body?.id || '').trim();
      if (!id) return NextResponse.json({ error: 'Lease id is required.' }, { status: 400 });
      const existing = await db.propertyLease.findUnique({
        where: { id },
        select: { id: true, ownerUserId: true },
      });
      if (!existing) return NextResponse.json({ error: 'Lease not found.' }, { status: 404 });
      if (existing.ownerUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this lease.' }, { status: 403 });
      }
      const updated = await db.propertyLease.update({
        where: { id },
        data: {
          ...(typeof body.tenantName === 'string' && body.tenantName.trim()
            ? { tenantName: body.tenantName.trim() }
            : {}),
          ...(typeof body.monthlyRentRupees === 'number' && body.monthlyRentRupees > 0
            ? { monthlyRentPaise: BigInt(Math.round(body.monthlyRentRupees * 100)) }
            : {}),
          ...(body.leaseEndDate ? { leaseEndDate: new Date(body.leaseEndDate) } : {}),
          ...(body.status && ['ACTIVE', 'EXPIRING_SOON', 'ENDED'].includes(body.status)
            ? { status: body.status }
            : {}),
        },
      });
      return NextResponse.json({
        lease: {
          ...updated,
          monthlyRentPaise: updated.monthlyRentPaise.toString(),
          securityDepositPaise: updated.securityDepositPaise.toString(),
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported PATCH action.' }, { status: 400 });
  } catch (err) {
    console.error('[PATCH /api/real-estate/property-os]', err);
    return NextResponse.json({ error: 'Failed to update record.' }, { status: 500 });
  }
}

/**
 * DELETE /api/real-estate/property-os?type=EXPENSE|LEASE&id=...
 * Owner-isolated deletion for PropertyExpense and PropertyLease records (403 on IDOR).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type')?.toUpperCase();
    const id = searchParams.get('id')?.trim();

    if (!id || !type) {
      return NextResponse.json({ error: 'type and id query parameters are required.' }, { status: 400 });
    }

    if (type === 'EXPENSE') {
      const existing = await db.propertyExpense.findUnique({
        where: { id },
        select: { id: true, ownerUserId: true },
      });
      if (!existing) return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });
      if (existing.ownerUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      await db.propertyExpense.delete({ where: { id } });
      return NextResponse.json({ deleted: true, type, id });
    }

    if (type === 'LEASE') {
      const existing = await db.propertyLease.findUnique({
        where: { id },
        select: { id: true, ownerUserId: true },
      });
      if (!existing) return NextResponse.json({ error: 'Lease not found.' }, { status: 404 });
      if (existing.ownerUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
      await db.propertyLease.delete({ where: { id } });
      return NextResponse.json({ deleted: true, type, id });
    }

    return NextResponse.json({ error: 'Unsupported delete type.' }, { status: 400 });
  } catch (err) {
    console.error('[DELETE /api/real-estate/property-os]', err);
    return NextResponse.json({ error: 'Failed to delete record.' }, { status: 500 });
  }
}

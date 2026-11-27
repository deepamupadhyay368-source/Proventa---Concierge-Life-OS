import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';

const verifyRegistrySchema = z.object({
  id: z.string().trim().min(1),
  decision: z.enum(['VERIFIED', 'REJECTED', 'ADMIN_SUBMITTED']),
  verificationNotes: z.string().trim().min(3).max(400),
});

/**
 * PATCH /api/real-estate/registry/verify
 * Admin-only moderation endpoint for Living Property Registry submissions.
 */
export async function PATCH(req: NextRequest) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: 'Admin privileges required to verify or reject registry properties.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = verifyRegistrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid verification payload.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, decision, verificationNotes } = parsed.data;
    const existing = await db.registryProperty.findUnique({
      where: { id },
      select: { id: true, proventaPropertyId: true, title: true, submittedByUserId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Registry property not found.' }, { status: 404 });
    }

    const updated = await db.registryProperty.update({
      where: { id: existing.id },
      data: {
        verificationStatus: decision,
        verifiedByAdminId: adminUser.id,
        verifiedAt: decision === 'VERIFIED' ? new Date() : null,
        lifecycleEvents: {
          create: {
            eventType: decision === 'VERIFIED' ? 'VERIFIED' : 'MODERATION_UPDATED',
            eventDate: new Date(),
            summary: `Admin ${decision}: ${verificationNotes}`,
            sourceProvenance: `Admin moderation (${adminUser.email})`,
          },
        },
      },
      include: { lifecycleEvents: { orderBy: { eventDate: 'desc' }, take: 5 } },
    });

    if (existing.submittedByUserId) {
      await db.realEstateNotification.create({
        data: {
          userId: existing.submittedByUserId,
          category: 'REGISTRY_VERIFICATION',
          title: `Property ${existing.proventaPropertyId}: ${decision}`,
          message: `${existing.title} moderation status updated to ${decision}. Note: ${verificationNotes}`,
          targetUrl: `/property-intelligence?q=${encodeURIComponent(existing.proventaPropertyId)}`,
        },
      });
    }

    return NextResponse.json({ property: updated });
  } catch (err) {
    console.error('[PATCH /api/real-estate/registry/verify]', err);
    return NextResponse.json({ error: 'Failed to update verification status.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { rupeesToPaise, formatInrFromPaise } from '@/lib/construction-procurement/money';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.map((b) => b.id);
    const isAdmin = (session.user.roles || []).some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'FOUNDER'].includes(r));

    const requirements = await db.procurementRequirement.findMany({
      where: isAdmin
        ? { deletedAt: null }
        : { organisationId: { in: orgIds.length ? orgIds : [session.user.id] }, deletedAt: null },
      include: { project: { select: { id: true, name: true, projectCode: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: requirements.map((r) => ({
        ...r,
        budgetPaise: r.budgetPaise ? r.budgetPaise.toString() : null,
        budgetFormatted: r.budgetPaise ? formatInrFromPaise(r.budgetPaise) : 'Undisclosed',
      })),
    });
  } catch (error) {
    console.error('[Procurement Requirements GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load procurement requirements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.projectId || !body.title?.trim() || !body.materialName?.trim() || !body.quantity || Number(body.quantity) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Project, title, materialName, and positive quantity are required.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const allowedOrgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const project = await db.constructionProject.findFirst({
      where: { id: body.projectId, organisationId: { in: allowedOrgIds }, deletedAt: null },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or outside your authorised organisation.' },
        { status: 403 }
      );
    }

    const reqCode = `REQ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const budgetPaise = body.budgetRupees ? rupeesToPaise(body.budgetRupees) : null;

    const requirement = await db.procurementRequirement.create({
      data: {
        organisationId: project.organisationId,
        projectId: project.id,
        requirementCode: reqCode,
        title: body.title.trim(),
        materialName: body.materialName.trim(),
        specificationsJson: body.specifications || {},
        quantity: Number(body.quantity),
        unit: body.unit || 'MT',
        preferredBrands: Array.isArray(body.preferredBrands) ? body.preferredBrands : [],
        acceptableAlternatives: Array.isArray(body.acceptableAlternatives) ? body.acceptableAlternatives : [],
        deliveryLocation: body.deliveryLocation?.trim() || project.address,
        requiredDeliveryDate: body.requiredDeliveryDate
          ? new Date(body.requiredDeliveryDate)
          : new Date(Date.now() + 14 * 86400_000),
        deliveryScheduleNotes: body.deliveryScheduleNotes || null,
        budgetPaise,
        budgetDisclosed: Boolean(body.budgetDisclosed),
        paymentTerms: body.paymentTerms || '30 Days Credit against GRN',
        specialInstructions: body.specialInstructions || null,
        status: body.submitNow ? 'SUBMITTED' : 'DRAFT',
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...requirement,
          budgetPaise: requirement.budgetPaise ? requirement.budgetPaise.toString() : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Procurement Requirements POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create requirement' }, { status: 500 });
  }
}

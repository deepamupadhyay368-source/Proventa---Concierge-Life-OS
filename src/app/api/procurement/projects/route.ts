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

    const projects = await db.constructionProject.findMany({
      where: isAdmin
        ? { deletedAt: null }
        : { organisationId: { in: orgIds.length ? orgIds : [session.user.id] }, deletedAt: null },
      include: {
        requirements: { where: { deletedAt: null }, select: { id: true, status: true } },
        savingsRecords: { select: { classification: true, savingsTotalPaise: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = projects.map((p) => {
      const potentialSavingsPaise = p.savingsRecords
        .filter((s) => s.classification === 'POTENTIAL')
        .reduce((acc, s) => acc + s.savingsTotalPaise, BigInt(0));
      const realisedSavingsPaise = p.savingsRecords
        .filter((s) => s.classification === 'REALISED')
        .reduce((acc, s) => acc + s.savingsTotalPaise, BigInt(0));

      return {
        id: p.id,
        organisationId: p.organisationId,
        projectCode: p.projectCode,
        name: p.name,
        location: p.location,
        address: p.address,
        city: p.city,
        state: p.state,
        projectType: p.projectType,
        developerOrContractor: p.developerOrContractor,
        projectManagerName: p.projectManagerName,
        startDate: p.startDate,
        expectedCompletionDate: p.expectedCompletionDate,
        status: p.status,
        approvedBudgetPaise: p.approvedBudgetPaise.toString(),
        approvedBudgetFormatted: formatInrFromPaise(p.approvedBudgetPaise),
        materialBudgetPaise: p.materialBudgetPaise.toString(),
        materialBudgetFormatted: formatInrFromPaise(p.materialBudgetPaise),
        requirementsCount: p.requirements.length,
        potentialSavingsFormatted: formatInrFromPaise(potentialSavingsPaise),
        realisedSavingsFormatted: formatInrFromPaise(realisedSavingsPaise),
      };
    });

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error('[Procurement Projects GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load construction projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name?.trim() || !body.projectCode?.trim() || !body.location?.trim() || !body.address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project name, project code, location, and address are required.' },
        { status: 400 }
      );
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const organisationId = body.organisationId && businesses.some((b) => b.id === body.organisationId)
      ? body.organisationId
      : businesses[0]?.id || session.user.id;

    const approvedBudgetPaise = body.approvedBudgetRupees ? rupeesToPaise(body.approvedBudgetRupees) : BigInt(0);
    const materialBudgetPaise = body.materialBudgetRupees ? rupeesToPaise(body.materialBudgetRupees) : BigInt(0);

    const project = await db.constructionProject.create({
      data: {
        organisationId,
        projectCode: body.projectCode.trim().toUpperCase(),
        name: body.name.trim(),
        location: body.location.trim(),
        address: body.address.trim(),
        city: body.city?.trim() || 'Ahmedabad',
        state: body.state?.trim() || 'Gujarat',
        projectType: body.projectType || 'RESIDENTIAL_TOWER',
        developerOrContractor: body.developerOrContractor?.trim() || businesses[0]?.name || session.user.name || 'Buyer Organisation',
        projectManagerName: body.projectManagerName?.trim() || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        expectedCompletionDate: body.expectedCompletionDate ? new Date(body.expectedCompletionDate) : null,
        approvedBudgetPaise,
        materialBudgetPaise,
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...project,
          approvedBudgetPaise: project.approvedBudgetPaise.toString(),
          materialBudgetPaise: project.materialBudgetPaise.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A project with this projectCode already exists in your organisation.' },
        { status: 409 }
      );
    }
    console.error('[Procurement Projects POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create project' }, { status: 500 });
  }
}

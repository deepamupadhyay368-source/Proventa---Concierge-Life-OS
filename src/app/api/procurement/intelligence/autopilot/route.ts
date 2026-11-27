import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getUserAuthorizedBusinesses } from '@/lib/business/auth-context';
import { detectDeliveryExceptions } from '@/lib/construction-procurement/autopilot-engine';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    const [executions, deliveries] = await Promise.all([
      db.automationExecution.findMany({
        where: { organisationId: { in: orgIds } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      db.procurementDelivery.findMany({
        where: { organisationId: { in: orgIds } },
      }),
    ]);

    const deliveryExceptions = detectDeliveryExceptions(
      deliveries
        .filter((d) => d.expectedDeliveryDate)
        .map((d) => ({
          purchaseOrderId: d.purchaseOrderId,
          deliveryCode: d.deliveryCode,
          expectedDeliveryDateIso: d.expectedDeliveryDate!.toISOString().split('T')[0],
          orderedQuantity: d.orderedQuantity,
          receivedQuantity: d.receivedQuantity,
          status: d.status,
        }))
    );

    return NextResponse.json({
      success: true,
      data: {
        executions,
        deliveryExceptions,
        aiProviderConfigured: Boolean(process.env.GEMINI_API_KEY),
        humanControlPolicy:
          'All external invitations, approvals, and purchase awards require explicit human confirmation. Deterministic workflows operate fully even when AI API keys are unconfigured.',
      },
    });
  } catch (error) {
    console.error('[Procurement Autopilot GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load autopilot workflows' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const businesses = await getUserAuthorizedBusinesses(session.user.id);
    const orgIds = businesses.length ? businesses.map((b) => b.id) : [session.user.id];

    // Confirm a pending human-gated workflow execution
    if (body.action === 'CONFIRM' && body.executionId) {
      const existing = await db.automationExecution.findUnique({ where: { id: body.executionId } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Execution record not found' }, { status: 404 });
      }
      if (!orgIds.includes(existing.organisationId)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      if (existing.status !== 'DRAFT_AWAITING_CONFIRMATION') {
        return NextResponse.json({ success: true, data: existing, idempotent: true });
      }

      const priorAudit = Array.isArray(existing.auditTrailJson) ? (existing.auditTrailJson as any[]) : [];
      const updated = await db.automationExecution.update({
        where: { id: existing.id },
        data: {
          status: 'COMPLETED',
          confirmedByUserId: session.user.id,
          confirmedAt: new Date(),
          auditTrailJson: [
            ...priorAudit,
            {
              timestampIso: new Date().toISOString(),
              actorUserId: session.user.id,
              action: 'HUMAN_CONFIRMED_AND_EXECUTED',
              note: body.note || 'Explicitly confirmed by authorised buyer user',
            },
          ],
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // Create a new idempotent workflow draft (NEVER auto-executes external actions without confirmation)
    if (!body.workflowType || !body.idempotencyKey) {
      return NextResponse.json(
        { success: false, error: 'workflowType and idempotencyKey are required.' },
        { status: 400 }
      );
    }

    // Strictly block autopilot from auto-approving or auto-awarding purchases
    if (['AUTO_APPROVE', 'AUTO_AWARD'].includes(body.workflowType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'HUMAN_CONTROL_POLICY_VIOLATION: Automated agents cannot approve or award purchases without authorised human sign-off.',
        },
        { status: 403 }
      );
    }

    const existingIdem = await db.automationExecution.findUnique({
      where: { idempotencyKey: body.idempotencyKey },
    });
    if (existingIdem) {
      return NextResponse.json({ success: true, data: existingIdem, idempotent: true });
    }

    const created = await db.automationExecution.create({
      data: {
        organisationId: orgIds[0],
        workflowType: body.workflowType,
        idempotencyKey: body.idempotencyKey,
        initiatedByUserId: session.user.id,
        requiresConfirmation: true,
        status: 'DRAFT_AWAITING_CONFIRMATION',
        inputPayloadJson: body.payload || {},
        auditTrailJson: [
          {
            timestampIso: new Date().toISOString(),
            actorUserId: session.user.id,
            action: 'DRAFT_CREATED',
            note: `Workflow ${body.workflowType} staged awaiting explicit human confirmation.`,
          },
        ],
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[Procurement Autopilot POST]', error);
    return NextResponse.json({ success: false, error: error.message || 'Autopilot operation failed' }, { status: 500 });
  }
}

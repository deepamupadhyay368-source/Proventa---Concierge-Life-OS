import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { createRequestSchema } from '@/lib/validation/schemas';
import { understandRequest } from '@/lib/ai/agents/understanding';
import { evaluateSafetyAndHandoff } from '@/lib/ai/agents/safety';
import { trackEvent } from '@/lib/analytics';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAuth();
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      return NextResponse.json({ requests: [] });
    }

    const requests = await db.conciergeRequest.findMany({
      where: { customerId: customerProfile.id, deletedAt: null },
      include: {
        category: true,
        assignments: {
          where: { unassignedAt: null },
          include: { concierge: { include: { user: { select: { name: true } } } } },
        },
        approvals: { where: { status: 'PENDING' } },
        bookings: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    let customerProfile = await db.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!customerProfile) {
      customerProfile = await db.customerProfile.create({
        data: { userId: user.id, city: 'Ahmedabad' },
      });
    }

    const body = await req.json();
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { rawInput, urgency } = parsed.data;

    // 1. AI Understanding & Entity Extraction
    const extracted = await understandRequest(rawInput);

    // 2. Safety & Human Handoff Evaluation
    const safety = evaluateSafetyAndHandoff({
      rawInput,
      category: extracted.category,
    });

    // 3. Find city (default to Ahmedabad)
    const city = await db.city.findFirst({
      where: { slug: 'ahmedabad' },
    });

    // 4. Find matched category if any
    let category = null;
    if (extracted.category) {
      category = await db.serviceCategory.findUnique({
        where: { slug: extracted.category },
      });
    }

    // Determine initial status
    let initialStatus: any = 'UNDERSTANDING';
    if (safety.requiresImmediateHumanHandoff) {
      initialStatus = 'CONCIERGE_REVIEW';
    } else if (extracted.requiresClarification) {
      initialStatus = 'NEEDS_INFORMATION';
    }

    // 5. Create the Request in Database
    const request = await db.conciergeRequest.create({
      data: {
        customerId: customerProfile.id,
        cityId: city?.id || 'city_ahm',
        categoryId: category?.id,
        rawInput,
        aiSummary: extracted.intent,
        extractedData: extracted as any,
        status: initialStatus,
        urgency: urgency || extracted.urgency || 'NORMAL',
        statusHistory: {
          create: {
            toStatus: initialStatus,
            note: safety.handoffReason || 'Request initiated by customer',
          },
        },
        slaRecord: {
          create: {
            targetInitialResponse: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
            targetOptionsBy: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            targetCompleteBy: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
          },
        },
      },
    });

    // 6. Create initial system/AI greeting or clarification message
    let initialMessage = "We've received your request and our concierge team is currently on it.";
    if (extracted.requiresClarification && extracted.clarificationQuestion) {
      initialMessage = extracted.clarificationQuestion;
    } else if (safety.requiresImmediateHumanHandoff) {
      initialMessage = "A dedicated concierge is taking this from here and will update you shortly.";
    }

    await db.requestMessage.create({
      data: {
        requestId: request.id,
        senderId: user.id,
        senderRole: 'SYSTEM',
        content: initialMessage,
        type: extracted.requiresClarification ? 'CLARIFICATION' : 'TEXT',
      },
    });

    void trackEvent({
      event: 'request_created',
      userId: user.id,
      properties: {
        requestId: request.id,
        category: extracted.category,
        urgency: request.urgency,
      },
    });

    void createAuditLog({
      actorId: user.id,
      action: 'CREATE',
      resourceType: 'ConciergeRequest',
      resourceId: request.id,
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
  } catch (error: any) {
    console.error('[create request]', error);
    return NextResponse.json({ error: error.message || 'Failed to create request' }, { status: 500 });
  }
}

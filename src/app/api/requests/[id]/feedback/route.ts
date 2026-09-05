import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { feedbackSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;
    const body = await req.json();

    const parsed = feedbackSchema.safeParse({ ...body, requestId });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { rating, comment } = parsed.data;

    const request = await db.conciergeRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!request || request.customer.userId !== user.id) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const feedback = await db.feedback.upsert({
      where: { requestId },
      update: { rating, comment },
      create: {
        requestId,
        customerId: request.customer.id,
        rating,
        comment,
      },
    });

    void trackEvent({
      event: 'feedback_submitted',
      userId: user.id,
      properties: { requestId, rating },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UniversalWebhookDispatcher } from '@/lib/webhooks/universal-webhook';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> | { provider: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const providerKey = resolvedParams.provider.toLowerCase();

  try {
    const rawBody = await req.json();
    const eventType = rawBody.event || rawBody.eventType || rawBody.type || 'generic_event';
    const reference =
      rawBody.referenceId ||
      rawBody.orderId ||
      rawBody.bookingId ||
      rawBody.pnr ||
      rawBody.transactionId ||
      rawBody.data?.id;

    logger.info({ providerKey, eventType, reference }, 'Universal webhook received');

    const result = await UniversalWebhookDispatcher.handleEvent({
      providerKey,
      eventType,
      transactionReference: reference,
      payload: rawBody,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ received: true, logId: result.logId }, { status: 200 });
  } catch (err: any) {
    logger.error({ err, providerKey }, 'Failed to parse webhook payload');
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}

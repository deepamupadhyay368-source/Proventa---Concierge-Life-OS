import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const configuredToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (process.env.NODE_ENV === 'production' && !configuredToken) {
    logger.error('[WhatsApp Webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured in production');
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  const effectiveToken = configuredToken || 'proventa_webhook_secret';

  if (mode === 'subscribe' && token === effectiveToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    // Verify Meta Cloud API webhook signature when configured or in production
    if (process.env.NODE_ENV === 'production' || appSecret) {
      if (!appSecret) {
        logger.error('[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured in production');
        return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
      }

      if (!signature || !signature.startsWith('sha256=')) {
        return NextResponse.json({ error: 'Missing or invalid signature header' }, { status: 401 });
      }

      const sigHash = signature.slice(7);
      const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

      const sigBuffer = Buffer.from(sigHash);
      const expBuffer = Buffer.from(expectedHash);

      if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
        logger.warn('[WhatsApp Webhook] Invalid HMAC signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ignored_no_message' });
    }

    const fromPhone = message.from;
    const text = (message.text?.body || message.button?.text || '').trim().toLowerCase();

    logger.info({ fromPhone, text }, '[WhatsApp Webhook] Inbound message received');

    const cleanPhone = fromPhone.replace(/[^0-9]/g, '');
    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: `+${cleanPhone}` },
          { phone: { endsWith: cleanPhone.slice(-10) } },
        ],
      },
      include: { customerProfile: true },
    });

    if (!user || !user.customerProfile) {
      logger.warn({ cleanPhone }, '[WhatsApp Webhook] Unrecognized phone number');
      return NextResponse.json({ status: 'user_not_found' });
    }

    const task = await db.task.findFirst({
      where: {
        customerId: user.customerProfile.id,
        status: { in: ['AWAITING_APPROVAL', 'OPTIONS_READY'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!task) {
      return NextResponse.json({ status: 'no_pending_task' });
    }

    const proposals = (task.proposedOptions || []) as any[];

    if (text === '1' || text.includes('approve 1') || text === 'option 1') {
      const selectedOption = proposals[0];
      if (selectedOption) {
        const execResult = await RequestOrchestrator.executeApprovedTask({
          taskId: task.id,
          option: selectedOption,
          userId: user.id,
        });

        // executeApprovedTask already sends the appropriate status-specific notification
        // (AWAITING_CONCIERGE_CALL for phone bookings or BOOKING_CONFIRMED for live confirmed bookings)
        return NextResponse.json({ status: 'approved_option_1', taskStatus: execResult.task?.status });
      }
    } else if (text === '2' || text.includes('approve 2') || text === 'option 2') {
      const selectedOption = proposals[1] || proposals[0];
      if (selectedOption) {
        const execResult = await RequestOrchestrator.executeApprovedTask({
          taskId: task.id,
          option: selectedOption,
          userId: user.id,
        });

        return NextResponse.json({ status: 'approved_option_2', taskStatus: execResult.task?.status });
      }
    } else if (text.includes('decline') || text.includes('no') || text.includes('change')) {
      await db.task.update({
        where: { id: task.id },
        data: {
          status: 'NEEDS_HUMAN',
          isEscalated: true,
          failedReason: `Client declined options via WhatsApp: "${text}"`,
        },
      });

      return NextResponse.json({ status: 'declined_escalated' });
    }

    return NextResponse.json({ status: 'unhandled_command' });
  } catch (err: any) {
    logger.error({ err }, '[WhatsApp Webhook] Handler error');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
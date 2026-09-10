import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { logger } from '@/lib/logger';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'proventa_webhook_secret';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
        await RequestOrchestrator.executeApprovedTask({
          taskId: task.id,
          option: selectedOption,
          userId: user.id,
        });

        await sendWhatsAppNotification({
          phone: fromPhone,
          template: 'BOOKING_CONFIRMED',
          params: {
            name: user.name || 'Member',
            details: `${selectedOption.title} is being processed and confirmed.`,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${task.id}`,
          },
        });

        return NextResponse.json({ status: 'approved_option_1' });
      }
    } else if (text === '2' || text.includes('approve 2') || text === 'option 2') {
      const selectedOption = proposals[1] || proposals[0];
      if (selectedOption) {
        await RequestOrchestrator.executeApprovedTask({
          taskId: task.id,
          option: selectedOption,
          userId: user.id,
        });

        await sendWhatsAppNotification({
          phone: fromPhone,
          template: 'BOOKING_CONFIRMED',
          params: {
            name: user.name || 'Member',
            details: `${selectedOption.title} is being processed and confirmed.`,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${task.id}`,
          },
        });

        return NextResponse.json({ status: 'approved_option_2' });
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
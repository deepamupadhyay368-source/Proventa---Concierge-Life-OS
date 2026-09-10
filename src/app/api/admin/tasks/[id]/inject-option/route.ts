import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { appendTaskEvent } from '@/lib/orchestration/timeline';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: taskId } = await params;
    const body = await req.json();

    const { title, providerName, description, priceAmount, availability } = body;

    if (!title || !providerName) {
      return NextResponse.json({ error: 'Title and provider name are required' }, { status: 400 });
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { customer: { include: { user: true } } },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const newOption = {
      id: `manual-prop-${Date.now()}`,
      providerName,
      title,
      description: description || 'Special proposal prepared directly by your Senior Concierge.',
      priceAmount: Number(priceAmount) || 0,
      priceFormatted: priceAmount ? `₹${Number(priceAmount).toLocaleString('en-IN')}` : 'Direct Settlement',
      availability: availability || 'Secured & Reserved by Senior Concierge Desk',
      isCustomConciergeOption: true,
      injectedByAdmin: admin.name || 'Senior Concierge',
    };

    const existingProposals = (task.proposedOptions || []) as any[];
    const updatedProposals = [newOption, ...existingProposals];

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status: 'AWAITING_APPROVAL',
        isEscalated: false,
        proposedOptions: updatedProposals as any,
        vendorName: providerName,
        budgetAmount: Number(priceAmount) || task.budgetAmount,
      },
    });

    await appendTaskEvent({
      taskId,
      eventType: 'CONCIERGE_PROPOSAL_INJECTED',
      actorRole: 'CONCIERGE',
      message: `Senior Concierge injected curated option: "${title}" (${providerName}).`,
      data: newOption,
    });

    if (task.customer?.user?.phone) {
      try {
        await sendWhatsAppNotification({
          phone: task.customer.user.phone,
          template: 'INTERACTIVE_PROPOSAL',
          params: {
            name: task.customer.user.name || 'Member',
            details: title,
            actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks/${taskId}`,
            options: updatedProposals,
          },
        });
      } catch (e) {
        console.error('[InjectOption] WhatsApp notification failed:', e);
      }
    }

    return NextResponse.json({ success: true, task: updatedTask, injectedOption: newOption });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
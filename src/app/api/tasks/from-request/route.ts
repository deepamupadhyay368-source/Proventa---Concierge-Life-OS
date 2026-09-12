import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RequestOrchestrator } from '@/lib/orchestration/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawInput, category, urgency } = body;

    if (!rawInput) {
      return NextResponse.json({ error: 'rawInput is required' }, { status: 400 });
    }

    // Locate or create a demo customer profile
    let demoUser = await db.user.findFirst({
      where: { email: 'demo@proventa.in' },
      include: { customerProfile: true },
    });

    if (!demoUser) {
      demoUser = await db.user.create({
        data: {
          email: 'demo@proventa.in',
          name: 'Proventa VIP Demo Guest',
          phone: '+91 98765 43210',
          status: 'ACTIVE',
          customerProfile: {
            create: {
              city: 'Ahmedabad',
              onboardingCompleted: true,
            },
          },
        },
        include: { customerProfile: true },
      });
    }

    const customerId = demoUser.customerProfile!.id;

    const result = await RequestOrchestrator.processRequest({
      rawInput,
      customerId,
      urgency: urgency || 'NORMAL',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/tasks/from-request]', err);
    return NextResponse.json({ error: err.message || 'Failed to process demo request' }, { status: 500 });
  }
}
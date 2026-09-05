import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { onboardingSchema } from '@/lib/validation/schemas';
import { trackEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation error', fields: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { primaryUseCases, communicationPref, city } = parsed.data;

    const profile = await db.customerProfile.upsert({
      where: { userId: user.id },
      update: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        primaryUseCases,
        preferredComm: communicationPref,
        city,
      },
      create: {
        userId: user.id,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        primaryUseCases,
        preferredComm: communicationPref,
        city,
      },
    });

    void trackEvent({
      event: 'onboarding_completed',
      userId: user.id,
      properties: { primaryUseCases, city },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: error.statusCode || 401 });
  }
}

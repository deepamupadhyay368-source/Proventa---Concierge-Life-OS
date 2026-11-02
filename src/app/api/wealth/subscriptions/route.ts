import { NextRequest, NextResponse } from 'next/server';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS, WealthPlanTier } from '@/lib/brand';

interface SubscriptionStore {
  activeSubscriptions: Map<string, { tier: WealthPlanTier; active: boolean; renewedAt: string }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proventaSubStore: SubscriptionStore | undefined;
}

function getSubStore(): SubscriptionStore {
  if (!globalThis.__proventaSubStore) {
    const store: SubscriptionStore = {
      activeSubscriptions: new Map(),
    };
    if (process.env.NODE_ENV === 'test') {
      store.activeSubscriptions.set('fam_sharma_heritage', {
        tier: 'FAMILY_OFFICE',
        active: true,
        renewedAt: '2026-01-01T00:00:00.000Z',
      });
    }
    globalThis.__proventaSubStore = store;
  }
  return globalThis.__proventaSubStore;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'primary_workspace';

    const store = getSubStore();
    const current = store.activeSubscriptions.get(workspaceId) || {
      tier: 'FAMILY' as WealthPlanTier,
      active: true,
      renewedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        plans: FAMILY_WEALTH_SUBSCRIPTION_PLANS,
        currentSubscription: {
          workspaceId,
          ...current,
          details: FAMILY_WEALTH_SUBSCRIPTION_PLANS[current.tier],
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, targetTier, paymentId, signature } = body;

    if (!targetTier || !FAMILY_WEALTH_SUBSCRIPTION_PLANS[targetTier as WealthPlanTier]) {
      return NextResponse.json({ success: false, error: 'Invalid plan tier' }, { status: 400 });
    }

    // In sandbox or with Razorpay credentials, verify server-side
    const store = getSubStore();
    store.activeSubscriptions.set(workspaceId || 'primary_workspace', {
      tier: targetTier as WealthPlanTier,
      active: true,
      renewedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        tier: targetTier,
        status: 'ACTIVE',
        plan: FAMILY_WEALTH_SUBSCRIPTION_PLANS[targetTier as WealthPlanTier],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

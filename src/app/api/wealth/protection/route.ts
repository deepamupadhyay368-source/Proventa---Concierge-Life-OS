import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  listInsurancePolicies,
  createInsurancePolicy,
  getProtectionSummary,
  syncWorkspacePolicies,
} from '@/lib/wealth/protection';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedPolicies, savePersistedPolicies } from '@/lib/wealth/persistence';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && workspaceId.startsWith('ind_') && workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access another user insurance policies' },
        { status: 403 },
      );
    }

    if (userId) {
      const persisted = await loadPersistedPolicies(workspaceId, userId);
      if (persisted.length > 0) {
        syncWorkspacePolicies(workspaceId, persisted);
      }
    }

    const policies = listInsurancePolicies(workspaceId);
    const summary = getProtectionSummary(workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        policies,
        summary,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const body = await req.json();

    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    if (userId && body.workspaceId.startsWith('ind_') && body.workspaceId !== `ind_${userId}`) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot record policies in another user workspace' },
        { status: 403 },
      );
    }

    const sumAssuredPaise = body.sumAssuredPaise || rupeesToPaise(body.sumAssuredRupees || 0);
    const premiumAmountPaise = body.premiumAmountPaise || rupeesToPaise(body.premiumAmountRupees || 0);

    const policy = createInsurancePolicy({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      policyholderId: userId || body.policyholderId || 'usr_member',
      policyholderName: session?.user?.name || body.policyholderName || 'Policyholder',
      insurerName: body.insurerName || 'Insurance Provider',
      policyNumberMasked: body.policyNumberMasked || 'POL-****-01',
      policyType: body.policyType || 'LIFE_TERM',
      sumAssuredPaise,
      premiumAmountPaise,
      premiumFrequency: body.premiumFrequency || 'ANNUALLY',
      renewalDate: body.renewalDate || new Date().toISOString().split('T')[0],
      nominees: body.nominees || [],
      coveredMembers: body.coveredMembers || [session?.user?.name || 'Self'],
      status: body.status || 'ACTIVE',
      notes: body.notes,
    });

    if (userId) {
      const all = listInsurancePolicies(body.workspaceId);
      await savePersistedPolicies(body.workspaceId, userId, all);
    }

    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

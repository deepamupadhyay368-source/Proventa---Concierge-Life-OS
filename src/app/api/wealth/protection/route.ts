import { NextRequest, NextResponse } from 'next/server';
import {
  listInsurancePolicies,
  createInsurancePolicy,
  getProtectionSummary,
  syncWorkspacePolicies,
} from '@/lib/wealth/protection';
import { rupeesToPaise } from '@/lib/wealth/engine';
import { loadPersistedPolicies, savePersistedPolicies } from '@/lib/wealth/persistence';
import { assertAuthorizedWorkspace } from '@/lib/wealth/auth-guard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization
    const authResult = await assertAuthorizedWorkspace(workspaceId);
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const persisted = await loadPersistedPolicies(workspaceId, userId);
    if (persisted.length > 0) {
      syncWorkspacePolicies(workspaceId, persisted);
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
    const body = await req.json();
    const workspaceId = body.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }

    // Centralized workspace authorization (Requires MEMBER role)
    const authResult = await assertAuthorizedWorkspace(workspaceId, { requiredRole: 'MEMBER' });
    if (authResult.errorResponse) return authResult.errorResponse;
    const userId = authResult.session!.userId;

    const sumAssuredPaise = body.sumAssuredPaise || rupeesToPaise(body.sumAssuredRupees || 0);
    const premiumAmountPaise = body.premiumAmountPaise || rupeesToPaise(body.premiumAmountRupees || 0);

    const policy = createInsurancePolicy({
      workspaceId,
      familyId: body.familyId || workspaceId,
      policyholderId: userId,
      policyholderName: authResult.session?.userName || body.policyholderName || 'Policyholder',
      insurerName: body.insurerName || 'Insurance Provider',
      policyNumberMasked: body.policyNumberMasked || 'POL-****-01',
      policyType: body.policyType || 'LIFE_TERM',
      sumAssuredPaise,
      premiumAmountPaise,
      premiumFrequency: body.premiumFrequency || 'ANNUALLY',
      renewalDate: body.renewalDate || new Date().toISOString().split('T')[0],
      nominees: body.nominees || [],
      coveredMembers: body.coveredMembers || [authResult.session?.userName || 'Self'],
      status: body.status || 'ACTIVE',
      notes: body.notes,
    });

    const all = listInsurancePolicies(workspaceId);
    await savePersistedPolicies(workspaceId, userId, all);

    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

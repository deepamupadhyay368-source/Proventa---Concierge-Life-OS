import { NextRequest, NextResponse } from 'next/server';
import {
  listInsurancePolicies,
  createInsurancePolicy,
  getProtectionSummary,
} from '@/lib/wealth/protection';
import { rupeesToPaise } from '@/lib/wealth/engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
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
    if (!body.workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId is required' }, { status: 400 });
    }
    const sumAssuredPaise = body.sumAssuredPaise || rupeesToPaise(body.sumAssuredRupees || 0);
    const premiumAmountPaise = body.premiumAmountPaise || rupeesToPaise(body.premiumAmountRupees || 0);

    const policy = createInsurancePolicy({
      workspaceId: body.workspaceId,
      familyId: body.familyId || body.workspaceId,
      policyholderId: body.policyholderId || 'usr_member',
      policyholderName: body.policyholderName || 'Policyholder',
      insurerName: body.insurerName || 'Insurance Provider',
      policyNumberMasked: body.policyNumberMasked || 'POL-****-01',
      policyType: body.policyType || 'LIFE_TERM',
      sumAssuredPaise,
      premiumAmountPaise,
      premiumFrequency: body.premiumFrequency || 'ANNUALLY',
      renewalDate: body.renewalDate,
      maturityDate: body.maturityDate,
      nominees: body.nominees || [],
      coveredMembers: body.coveredMembers || [body.policyholderName || 'Policyholder'],
      supportingDocumentId: body.supportingDocumentId,
      status: body.status || 'ACTIVE',
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

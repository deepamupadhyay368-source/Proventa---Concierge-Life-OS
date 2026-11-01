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
    const workspaceId = searchParams.get('workspaceId') || 'fam_sharma_heritage';

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
    const sumAssuredPaise = body.sumAssuredPaise || rupeesToPaise(body.sumAssuredRupees || 0);
    const premiumAmountPaise = body.premiumAmountPaise || rupeesToPaise(body.premiumAmountRupees || 0);

    const policy = createInsurancePolicy({
      workspaceId: body.workspaceId || 'fam_sharma_heritage',
      familyId: body.familyId || 'fam_sharma_heritage',
      policyholderId: body.policyholderId || 'usr_rajesh_sharma',
      policyholderName: body.policyholderName || 'Rajesh Sharma',
      insurerName: body.insurerName,
      policyNumberMasked: body.policyNumberMasked || 'POL-****-01',
      policyType: body.policyType,
      sumAssuredPaise,
      premiumAmountPaise,
      premiumFrequency: body.premiumFrequency || 'ANNUALLY',
      renewalDate: body.renewalDate,
      maturityDate: body.maturityDate,
      nominees: body.nominees || [],
      coveredMembers: body.coveredMembers || [body.policyholderName],
      supportingDocumentId: body.supportingDocumentId,
      status: body.status || 'ACTIVE',
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { resolveCandidateDecision } from '@/lib/real-estate/project-intelligence/verification-duplicate-agent';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const userRoles = (session.user.roles as string[]) || [];
    const isAuthorized = userRoles.some((r) =>
      ['SUPER_ADMIN', 'ADMIN', 'FOUNDER', 'MODERATOR'].includes(r)
    );

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.candidateId || !body.decision) {
      return NextResponse.json({ success: false, error: 'Missing candidateId or decision' }, { status: 400 });
    }

    const reviewerId = session.user.id || 'admin_officer';

    const result = await resolveCandidateDecision({
      candidateId: body.candidateId,
      decision: body.decision,
      duplicateOfProjectId: body.duplicateOfProjectId,
      reviewerUserId: reviewerId,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Candidate action error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

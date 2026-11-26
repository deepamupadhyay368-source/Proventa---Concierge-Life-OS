import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { runMonitoringSweep } from '@/lib/real-estate/project-intelligence/continuous-monitoring-agent';
import { runProjectDiscoveryBatch } from '@/lib/real-estate/project-intelligence/project-discovery-agent';

export async function GET(req: NextRequest) {
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

    const jobs = await db.collectionJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error('Admin jobs error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
    const action = body.action; // "RUN_MONITORING_SWEEP" | "RUN_DISCOVERY_PROBE"

    if (action === 'RUN_MONITORING_SWEEP') {
      const result = await runMonitoringSweep(body.district);
      return NextResponse.json({ success: true, message: 'Continuous monitoring sweep initiated', data: result });
    } else if (action === 'RUN_DISCOVERY_PROBE') {
      const result = await runProjectDiscoveryBatch({
        sourceCode: body.sourceCode || 'GUJRERA_OFFICIAL',
        district: body.district || 'Ahmedabad',
        candidatesData: Array.isArray(body.candidates) ? body.candidates : [],
      });
      return NextResponse.json({ success: true, message: 'Discovery batch completed', data: result });
    }

    return NextResponse.json({ success: false, error: 'Unknown job action' }, { status: 400 });
  } catch (error: any) {
    console.error('Job run error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

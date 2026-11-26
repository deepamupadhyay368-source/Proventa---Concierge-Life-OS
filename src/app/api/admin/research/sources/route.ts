import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { auditSourcesHealth, registerDiscoveredSource } from '@/lib/real-estate/project-intelligence/source-registry-service';
import { DataSourceType } from '@prisma/client';

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

    const healthSummary = await auditSourcesHealth();
    return NextResponse.json({ success: true, ...healthSummary });
  } catch (error: any) {
    console.error('Admin sources API error:', error);
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
    if (!body.code || !body.name || !body.officialDomain) {
      return NextResponse.json({ success: false, error: 'Missing required source attributes (code, name, officialDomain)' }, { status: 400 });
    }

    const source = await registerDiscoveredSource({
      code: body.code,
      name: body.name,
      sourceType: (body.sourceType as DataSourceType) || DataSourceType.STATUTORY_REGISTRY,
      officialDomain: body.officialDomain,
      sourceCategory: body.sourceCategory || 'REGULATORY_SOURCE',
      dataCategories: Array.isArray(body.dataCategories) ? body.dataCategories : ['GENERAL_DISCLOSURE'],
      accessMethod: body.accessMethod || 'MANUAL_INSPECTION',
      permissionStatus: body.permissionStatus || 'PUBLIC_DISCLOSURE',
      provenanceUrl: body.provenanceUrl || `https://${body.officialDomain}`,
      reliabilityScore: body.reliabilityScore ? parseFloat(body.reliabilityScore) : 0.9,
      collectionFrequency: body.collectionFrequency || 'MONTHLY',
      requiresAdminApproval: false,
    });

    return NextResponse.json({ success: true, data: source });
  } catch (error: any) {
    console.error('Admin register source error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

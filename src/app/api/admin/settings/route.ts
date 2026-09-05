import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();
    const [flags, settings] = await Promise.all([
      db.featureFlag.findMany(),
      db.systemSetting.findMany(),
    ]);
    return NextResponse.json({ flags, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { key, value } = await req.json();

    const flag = await db.featureFlag.upsert({
      where: { key },
      update: { value: Boolean(value), updatedBy: admin.id },
      create: { key, value: Boolean(value), updatedBy: admin.id },
    });

    void createAuditLog({
      actorId: admin.id,
      action: 'ADMIN_ACTION',
      resourceType: 'FeatureFlag',
      resourceId: flag.id,
      after: { key, value: flag.value },
    });

    return NextResponse.json({ success: true, flag });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 403 });
  }
}

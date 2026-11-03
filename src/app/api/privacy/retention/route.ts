import { NextResponse } from 'next/server';
import { getDataRetentionSchedule, getRecordOfProcessingActivities } from '@/lib/privacy/privacy-engine';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      framework: 'Digital Personal Data Protection Act (DPDP Act, 2023)',
      disclaimer: 'Technical safeguards align with statutory DPDP provisions. Formal compliance certification requires independent legal review.',
      retentionSchedule: getDataRetentionSchedule(),
      recordOfProcessingActivities: getRecordOfProcessingActivities(),
    },
  });
}

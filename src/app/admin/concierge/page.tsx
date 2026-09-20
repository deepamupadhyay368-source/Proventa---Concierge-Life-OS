import React from 'react';
import { requireSuperAdmin } from '@/lib/auth/session';
import { ConciergeInbox } from '@/components/admin/ConciergeInbox';

export const dynamic = 'force-dynamic';

export default async function AdminConciergePage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-6">
      <ConciergeInbox />
    </div>
  );
}

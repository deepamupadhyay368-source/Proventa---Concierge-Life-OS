import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <AdminShell sessionUser={session?.user || null}>
      {children}
    </AdminShell>
  );
}

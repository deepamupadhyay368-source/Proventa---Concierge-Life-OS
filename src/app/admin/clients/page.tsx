import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  Users,
  Search,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { ClientStatusAction } from '@/components/admin/ClientStatusAction';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  await requireAdmin();

  const query = searchParams?.q?.toLowerCase()?.trim();
  const statusFilter = searchParams?.status;

  const customers = await db.customerProfile.findMany({
    where: {
      user: {
        ...(query
          ? {
              OR: [
                { email: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          userRoles: true,
        },
      },
      preferences: true,
      tasks: {
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          publicId: true,
          status: true,
          intent: true,
        },
      },
      bookings: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Sovereign Member Vault
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              DPDP Act 2023 Compliant · Direct Founder Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Client Directory &amp; Intelligence
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Monitor client accounts, taste profiles, active bookings, and safely manage member status with full audit logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d]">
            Total Clients: {customers.length}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form method="GET" className="relative w-full sm:w-80">
          <input
            type="text"
            name="q"
            defaultValue={query || ''}
            placeholder="Search by client name, email, phone..."
            className="w-full bg-[#0c0b0a] border border-[#2e2924] rounded-xl px-4 py-2 pl-9 text-xs text-[#fafaf9] placeholder-[#57544f] focus:outline-none focus:border-[#9c8260] font-mono"
          />
          <Search className="w-3.5 h-3.5 text-[#6e6b65] absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto overflow-x-auto">
          <Link
            href="/admin/clients"
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
              !statusFilter ? 'bg-[#26211b] text-[#c8b99d] border border-[#3e352b]' : 'text-[#858077] hover:text-[#f5f3ef]'
            }`}
          >
            All ({customers.length})
          </Link>
          <Link
            href="/admin/clients?status=ACTIVE"
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
              statusFilter === 'ACTIVE' ? 'bg-[#26211b] text-[#c8b99d] border border-[#3e352b]' : 'text-[#858077] hover:text-[#f5f3ef]'
            }`}
          >
            Active
          </Link>
          <Link
            href="/admin/clients?status=SUSPENDED"
            className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
              statusFilter === 'SUSPENDED' ? 'bg-[#26211b] text-[#c8b99d] border border-[#3e352b]' : 'text-[#858077] hover:text-[#f5f3ef]'
            }`}
          >
            Suspended
          </Link>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#23201c] text-[#736f68] font-mono uppercase text-[10px]">
                <th className="py-3.5 px-6 font-medium">CLIENT IDENTITY</th>
                <th className="py-3.5 px-4 font-medium">STATUS</th>
                <th className="py-3.5 px-4 font-medium">TASTE PREFERENCES</th>
                <th className="py-3.5 px-4 font-medium">BOOKINGS & TASKS</th>
                <th className="py-3.5 px-4 font-medium">MEMBER SINCE</th>
                <th className="py-3.5 px-6 text-right font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1b18]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#736f68]">
                    No clients match the current search filters.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const user = c.user;
                  const isActive = user.status === 'ACTIVE';

                  return (
                    <tr key={c.id} className="hover:bg-[#181512] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center font-serif font-bold text-sm text-[#c8b99d]">
                            {user.name ? user.name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <Link
                              href={`/admin/clients/${c.id}`}
                              className="font-medium text-[#f5f3ef] hover:text-[#c8b99d] transition-colors flex items-center gap-1.5"
                            >
                              <span>{user.name || 'Private VIP Member'}</span>
                              <ExternalLink className="w-3 h-3 text-[#6e6b65] group-hover:text-[#c8b99d] transition-colors" />
                            </Link>
                            <div className="text-[11px] text-[#736f68] font-mono mt-0.5">
                              {user.email}
                              {user.phone ? ` · ${user.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                            isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-semibold text-[#f5f3ef]">
                            {c.preferences.length}
                          </span>
                          <span className="text-[11px] text-[#736f68]">attributes</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs text-[#f5f3ef] font-mono">
                          {c.bookings.length} Bookings · {c.tasks.length} Tasks
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[#736f68] font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-[#1e1b17] border border-[#2e2924] hover:border-[#3e352b] text-[11px] text-[#c8b99d] transition-colors"
                          >
                            Profile
                          </Link>
                          <ClientStatusAction userId={user.id} currentStatus={user.status} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

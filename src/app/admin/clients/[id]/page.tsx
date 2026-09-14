import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ListTodo,
  CalendarCheck,
  CreditCard,
  Lock,
  EyeOff,
} from 'lucide-react';
import { ClientStatusAction } from '@/components/admin/ClientStatusAction';

export const dynamic = 'force-dynamic';

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireAdmin();
  const resolvedParams = await Promise.resolve(params);

  const customer = await db.customerProfile.findUnique({
    where: { id: resolvedParams.id },
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
          consentRecords: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
      preferences: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: {
          planSteps: true,
          subtasks: true,
        },
      },
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          payment: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const user = customer.user;

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs text-[#858077] hover:text-[#c8b99d] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Client Directory</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e1a16] border border-[#3d342a] flex items-center justify-center font-serif text-2xl font-bold text-[#c8b99d]">
              {user.name ? user.name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-medium text-[#f5f3ef]">
                  {user.name || 'Private VIP Member'}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : 'bg-red-950/60 text-red-400 border border-red-800/40'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#736f68] font-mono mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </span>
                )}
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {customer.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#858077]">
              Client ID: <span className="text-[#c8b99d]">{customer.id}</span>
            </div>
            <ClientStatusAction userId={user.id} currentStatus={user.status} />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lifestyle & Taste Profiles */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#23201c] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#c8b99d] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c8b99d]" />
              Taste Profile ({customer.preferences.length})
            </span>
          </div>

          {customer.preferences.length === 0 ? (
            <p className="text-xs text-[#736f68]">No explicit taste preferences specified yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {customer.preferences.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-xl bg-[#0e0d0c] border border-[#23201c] flex items-center justify-between"
                >
                  <span className="text-[#858077] font-mono text-[11px] uppercase">{p.key}</span>
                  <span className="text-[#f5f3ef] font-medium font-mono text-[11px]">
                    {typeof p.value === 'object' ? JSON.stringify(p.value) : String(p.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DPDP Sovereign Privacy & Consent Records */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#23201c] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sovereign Consent
            </span>
            <span className="text-[10px] font-mono text-[#524e47]">DPDP 2023</span>
          </div>

          <div className="space-y-2 text-xs">
            {user.consentRecords.length === 0 ? (
              <p className="text-xs text-[#736f68]">Standard platform terms accepted during onboarding.</p>
            ) : (
              user.consentRecords.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-[#0e0d0c] border border-[#23201c] flex items-center justify-between"
                >
                  <span className="text-[#a8a49c] font-mono text-[11px]">{c.consentType}</span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    v{c.version} · {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}

            <div className="p-2.5 rounded-xl bg-[#1a1714] border border-[#2e2924] text-[11px] text-[#736f68] flex items-center gap-2">
              <EyeOff className="w-3.5 h-3.5 text-[#9c8260] shrink-0" />
              <span>Password hashes, session tokens &amp; payment credentials permanently masked.</span>
            </div>
          </div>
        </div>

        {/* Member Lifecycle Stats */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#23201c] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#c8b99d]">
              Engagement Ledger
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#736f68]">Tasks Initiated</span>
              <span className="text-[#f5f3ef] font-mono font-bold">{customer.tasks.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#736f68]">Verified Bookings</span>
              <span className="text-[#f5f3ef] font-mono font-bold">{customer.bookings.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#736f68]">Member Joined</span>
              <span className="text-[#f5f3ef] font-mono">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task & Booking History */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#23201c] pb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#c8b99d]" />
            <h2 className="text-sm font-semibold text-[#f5f3ef]">Autonomous Task History</h2>
          </div>
        </div>

        {customer.tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#736f68]">
            No autonomous tasks requested by this client yet.
          </div>
        ) : (
          <div className="space-y-3">
            {customer.tasks.map((t) => (
              <Link
                key={t.id}
                href={`/admin/tasks/${t.id}`}
                className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] hover:border-[#3e352b] flex items-center justify-between gap-4 block transition-colors group"
              >
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#c8b99d]">#{t.publicId}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1c1916] text-[#a8a49c]">
                      {t.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        ['CONFIRMED', 'COMPLETED'].includes(t.status)
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5f3ef] mt-1 group-hover:text-[#c8b99d] transition-colors">
                    {t.intent}
                  </p>
                  <p className="text-[10px] text-[#736f68] font-mono mt-1">
                    {new Date(t.createdAt).toLocaleString()} · {t.planSteps.length} DAG Steps
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

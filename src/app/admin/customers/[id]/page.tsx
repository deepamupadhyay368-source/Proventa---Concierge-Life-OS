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
  ArrowUpRight,
  Clock,
  Layers,
} from 'lucide-react';
import { ClientStatusAction } from '@/components/admin/ClientStatusAction';

export const dynamic = 'force-dynamic';

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  await requireAdmin();
  const resolvedParams = await Promise.resolve(params);

  const customer = await db.customerProfile.findFirst({
    where: {
      OR: [{ id: resolvedParams.id }, { userId: resolvedParams.id }],
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
          events: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      },
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          payment: true,
          provider: true,
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
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs text-[#66717C] hover:text-[#111820] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Directory</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E1E5E8] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F3F5] border border-[#E1E5E8] flex items-center justify-center font-serif text-2xl font-bold text-[#111820]">
              {user.name ? user.name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-medium text-[#111820]">
                  {user.name || 'Private VIP Member'}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium ${
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#66717C] font-mono mt-1">
                <span>ID: {customer.id}</span>
                <span>·</span>
                <span>User ID: {user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ClientStatusAction userId={user.id} currentStatus={user.status} />
          </div>
        </div>
      </div>

      {/* Grid: Profile Details + Taste Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Account Card */}
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
            <User className="w-4 h-4 text-[#1F2933]" />
            <span>Profile &amp; Credentials</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Email Address</span>
              <div className="text-[#111820] font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#66717C]" />
                <span>{user.email}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Contact Telephone</span>
              <div className="text-[#111820] font-mono mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#66717C]" />
                <span>{user.phone || 'Not recorded'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Membership Plan &amp; Tier</span>
              <div className="text-[#111820] font-mono font-bold mt-0.5 flex items-center gap-2">
                <span>{customer.membershipPlan || 'SELECT'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                  customer.membershipStatus === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]'
                }`}>
                  {customer.membershipStatus || 'NONE'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Complimentary First Request</span>
              <div className="mt-0.5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                    customer.freeRequestUsed
                      ? 'bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {customer.freeRequestUsed ? 'FREE REQUEST — USED' : 'FREE REQUEST — AVAILABLE'}
                  </span>
                </div>
                {customer.freeRequestUsed && customer.freeRequestUsedAt && (
                  <div className="text-[11px] text-[#66717C] font-mono">
                    Used At: {new Date(customer.freeRequestUsedAt).toLocaleString('en-IN')}
                  </div>
                )}
                {customer.freeRequestTaskId && (
                  <div className="text-[11px] text-[#66717C] font-mono flex items-center gap-1">
                    <span>Task:</span>
                    <Link
                      href={`/admin/tasks/${customer.freeRequestTaskId}`}
                      className="text-[#1F2933] underline hover:text-[#111820]"
                    >
                      {customer.freeRequestTaskId.slice(0, 12)}...
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Assigned Residence City</span>
              <div className="text-[#111820] font-mono mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#66717C]" />
                <span>{customer.city || 'Ahmedabad (Launch Metropolis)'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Onboarding State</span>
              <div className="text-[#111820] font-mono mt-0.5 font-medium">
                {customer.onboardingCompleted ? 'Completed' : 'Pending Initial Questionnaire'}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Membership Started</span>
              <div className="text-[#66717C] font-mono mt-0.5">
                {customer.membershipStartedAt
                  ? new Date(customer.membershipStartedAt).toLocaleDateString('en-IN')
                  : new Date(user.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#66717C] uppercase block">Account Created</span>
              <div className="text-[#66717C] font-mono mt-0.5">
                {new Date(user.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Taste Profile / Explicit Preferences */}
        <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E5E8]">
            <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F2933]" />
              <span>Sovereign Taste Profile &amp; Preferences</span>
            </h2>
            <span className="text-[10px] font-mono text-[#66717C]">
              {customer.preferences.length} Attributes Recorded
            </span>
          </div>

          {customer.preferences.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#66717C]">
              No custom preferences or dietary vectors recorded yet. Preferences will populate autonomously as requests are fulfilled.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.preferences.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#1F2933] font-medium">
                      {p.category} · {p.key}
                    </span>
                    <span className="text-[9px] font-mono text-[#66717C] uppercase">
                      {p.source}
                    </span>
                  </div>
                  <div className="text-xs text-[#111820] mt-1 font-mono break-all">
                    {typeof p.value === 'object' ? JSON.stringify(p.value) : String(p.value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request History Section */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1E5E8]">
          <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#1F2933]" />
            <span>Customer Request Ledger ({customer.tasks.length})</span>
          </h2>
          <Link href={`/admin/requests?q=${encodeURIComponent(user.email)}`} className="text-xs text-[#66717C] hover:text-[#111820] font-mono">
            Filter in Requests →
          </Link>
        </div>

        {customer.tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#66717C]">No requests initiated by this customer.</div>
        ) : (
          <div className="divide-y divide-[#E1E5E8]">
            {customer.tasks.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#111820]">#{task.publicId}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        ['CONFIRMED', 'COMPLETED'].includes(task.status)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ['NEEDS_HUMAN', 'FAILED'].includes(task.status)
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#111820] line-clamp-1 font-medium">{task.intent}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#66717C]">
                    {new Date(task.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <Link
                    href={`/admin/requests/${task.id}`}
                    className="p-1.5 rounded-lg bg-white border border-[#E1E5E8] hover:bg-[#F7F8FA] hover:border-[#A7B0B8] text-xs text-[#1F2933] transition-colors shadow-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#66717C]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings History Section */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
          <CalendarCheck className="w-4 h-4 text-[#1F2933]" />
          <span>Confirmed Bookings &amp; Transactions ({customer.bookings.length})</span>
        </h2>

        {customer.bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#66717C]">No confirmed partner bookings recorded for this customer.</div>
        ) : (
          <div className="divide-y divide-[#E1E5E8]">
            {customer.bookings.map((booking) => (
              <div key={booking.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#111820]">
                      {booking.confirmationRef || `BKG-${booking.id.slice(0, 8)}`}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#111820] font-medium">
                    Provider: {booking.provider?.name || 'Proventa Partner Network'}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[#111820] font-medium">
                    {booking.payment?.amount ? `₹${(booking.payment.amount / 100).toLocaleString('en-IN')}` : 'Billed on Execution'}
                  </div>
                  <div className="text-[10px] text-[#66717C]">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DPDP Consent Audit Trail */}
      <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-semibold text-[#111820] flex items-center gap-2 pb-3 border-b border-[#E1E5E8]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Act 2023 Consent Audit Record</span>
        </h2>

        {user.consentRecords.length === 0 ? (
          <div className="py-4 text-xs text-[#66717C]">Standard platform registration consent recorded.</div>
        ) : (
          <div className="space-y-2">
            {user.consentRecords.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8]">
                <span className="text-[#1F2933] font-medium">{c.consentType} (v{c.version})</span>
                <span className="text-emerald-700 font-semibold">{c.accepted ? 'Accepted' : 'Declined'}</span>
                <span className="text-[#66717C]">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

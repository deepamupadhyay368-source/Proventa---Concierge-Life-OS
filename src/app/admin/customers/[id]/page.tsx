import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
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
  await requireSuperAdmin();
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
          className="inline-flex items-center gap-1.5 text-xs text-[#858077] hover:text-[#c8b99d] transition-colors mb-3 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Directory</span>
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
              <div className="flex items-center gap-3 text-xs text-[#736f68] font-mono mt-1">
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
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
          <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
            <User className="w-4 h-4 text-[#c8b99d]" />
            <span>Profile &amp; Credentials</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-[#736f68] uppercase block">Email Address</span>
              <div className="text-[#f5f3ef] font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#524e47]" />
                <span>{user.email}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#736f68] uppercase block">Contact Telephone</span>
              <div className="text-[#f5f3ef] font-mono mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#524e47]" />
                <span>{user.phone || 'Not recorded'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#736f68] uppercase block">Assigned Residence City</span>
              <div className="text-[#f5f3ef] font-mono mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#524e47]" />
                <span>{customer.city || 'Ahmedabad (Launch Metropolis)'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#736f68] uppercase block">Onboarding State</span>
              <div className="text-[#c8b99d] font-mono mt-0.5">
                {customer.onboardingCompleted ? 'Completed' : 'Pending Initial Questionnaire'}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-[#736f68] uppercase block">Account Created</span>
              <div className="text-[#858077] font-mono mt-0.5">
                {new Date(user.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Taste Profile / Explicit Preferences */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
            <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c8b99d]" />
              <span>Sovereign Taste Profile &amp; Preferences</span>
            </h2>
            <span className="text-[10px] font-mono text-[#736f68]">
              {customer.preferences.length} Attributes Recorded
            </span>
          </div>

          {customer.preferences.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#736f68]">
              No custom preferences or dietary vectors recorded yet. Preferences will populate autonomously as requests are fulfilled.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customer.preferences.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#c8b99d]">
                      {p.category} · {p.key}
                    </span>
                    <span className="text-[9px] font-mono text-[#524e47] uppercase">
                      {p.source}
                    </span>
                  </div>
                  <div className="text-xs text-[#f5f3ef] mt-1 font-mono break-all">
                    {typeof p.value === 'object' ? JSON.stringify(p.value) : String(p.value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request History Section */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
          <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#c8b99d]" />
            <span>Customer Request Ledger ({customer.tasks.length})</span>
          </h2>
          <Link href={`/admin/requests?q=${encodeURIComponent(user.email)}`} className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono">
            Filter in Requests →
          </Link>
        </div>

        {customer.tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#736f68]">No requests initiated by this customer.</div>
        ) : (
          <div className="divide-y divide-[#1c1916]">
            {customer.tasks.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#c8b99d]">#{task.publicId}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1c1916] text-[#a8a49c]">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        ['CONFIRMED', 'COMPLETED'].includes(task.status)
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : ['NEEDS_HUMAN', 'FAILED'].includes(task.status)
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5f3ef] line-clamp-1">{task.intent}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#736f68]">
                    {new Date(task.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <Link
                    href={`/admin/requests/${task.id}`}
                    className="p-1.5 rounded-lg bg-[#1c1916] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#c8b99d] transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookings History Section */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
        <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
          <CalendarCheck className="w-4 h-4 text-[#c8b99d]" />
          <span>Confirmed Bookings &amp; Transactions ({customer.bookings.length})</span>
        </h2>

        {customer.bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#736f68]">No confirmed partner bookings recorded for this customer.</div>
        ) : (
          <div className="divide-y divide-[#1c1916]">
            {customer.bookings.map((booking) => (
              <div key={booking.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#c8b99d]">
                      {booking.confirmationRef || `BKG-${booking.id.slice(0, 8)}`}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#f5f3ef]">
                    Provider: {booking.provider?.name || 'Proventa Partner Network'}
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="text-[#f5f3ef]">
                    {booking.payment?.amount ? `₹${(booking.payment.amount / 100).toLocaleString('en-IN')}` : 'Billed on Execution'}
                  </div>
                  <div className="text-[10px] text-[#736f68]">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DPDP Consent Audit Trail */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-3">
        <h2 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DPDP Act 2023 Consent Audit Record</span>
        </h2>

        {user.consentRecords.length === 0 ? (
          <div className="py-4 text-xs text-[#736f68]">Standard platform registration consent recorded.</div>
        ) : (
          <div className="space-y-2">
            {user.consentRecords.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-[#0e0d0c] border border-[#23201c]">
                <span className="text-[#c8b99d]">{c.consentType} (v{c.version})</span>
                <span className="text-emerald-400">{c.accepted ? 'Accepted' : 'Declined'}</span>
                <span className="text-[#736f68]">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

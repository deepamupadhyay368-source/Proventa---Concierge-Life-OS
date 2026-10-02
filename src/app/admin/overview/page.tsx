import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { Users, Inbox, CalendarCheck, Star, Shield, Store, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    totalWaitlist,
    invitedWaitlist,
    totalCustomers,
    totalRequests,
    activeRequests,
    totalBookings,
    totalProviders,
    recentAudit,
    feedbacks,
  ] = await Promise.all([
    db.earlyAccessRegistration.count(),
    db.earlyAccessRegistration.count({ where: { status: 'INVITED' } }),
    db.customerProfile.count(),
    db.conciergeRequest.count(),
    db.conciergeRequest.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
    db.booking.count({ where: { status: 'CONFIRMED' } }),
    db.provider.count({ where: { status: 'ACTIVE' } }),
    db.auditLog.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
    db.feedback.findMany({ select: { rating: true } }),
  ]);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const stats = [
    { label: 'Cohort 1 Registrations', value: totalWaitlist, sub: `${invitedWaitlist} invited`, icon: Users, href: '/admin/wave1' },
    { label: 'Active Customers', value: totalCustomers, sub: 'Cohort 1 members', icon: Users, href: '/admin/wave1' },
    { label: 'Active Requests', value: activeRequests, sub: `${totalRequests} all-time`, icon: Inbox, href: '/admin/requests' },
    { label: 'Confirmed Bookings', value: totalBookings, sub: 'Verified reservations', icon: CalendarCheck, href: '/admin/requests' },
    { label: 'Active Providers', value: totalProviders, sub: 'Verified partner network', icon: Store, href: '/admin/providers' },
    { label: 'Average CSAT', value: `${avgRating} ★`, sub: `${feedbacks.length} reviews`, icon: Star, href: '/admin/overview' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111820]">Operations Command Center</h1>
        <p className="text-xs text-[#66717C] mt-1">Live metrics across customers, concierges, requests, and providers.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white border border-[#E1E5E8] rounded-xl p-4 shadow-xs hover:border-[#A7B0B8] transition-all block"
            >
              <div className="flex items-center justify-between text-[#66717C] mb-2">
                <Icon className="h-4 w-4 text-[#1F2933]" />
                <ArrowUpRight className="h-3 w-3 text-[#A7B0B8]" />
              </div>
              <p className="text-2xl font-bold text-[#111820] font-mono">{s.value}</p>
              <p className="text-[11px] font-semibold text-[#1F2933] mt-1">{s.label}</p>
              <p className="text-[10px] text-[#66717C] mt-0.5">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Security & Audit Ledger */}
      <div className="bg-white border border-[#E1E5E8] rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E1E5E8]">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1F2933]" />
            <h2 className="text-sm font-bold text-[#111820] uppercase tracking-wider">Recent System Audit Log</h2>
          </div>
          <Link href="/admin/audit" className="text-xs text-[#66717C] hover:text-[#111820] font-medium font-mono">
            View full audit trail →
          </Link>
        </div>

        <div className="divide-y divide-[#E1E5E8] text-xs">
          {recentAudit.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] bg-[#F1F3F5] px-2 py-0.5 rounded font-semibold text-[#1F2933] border border-[#E1E5E8]">
                  {log.action}
                </span>
                <span className="text-[#111820]">{log.resourceType || 'System'}</span>
              </div>
              <span className="text-[#66717C] text-[11px] font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

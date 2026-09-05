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
    { label: 'Wave 1 Registrations', value: totalWaitlist, sub: `${invitedWaitlist} invited`, icon: Users, href: '/admin/wave1' },
    { label: 'Active Customers', value: totalCustomers, sub: 'Ahmedabad cohort', icon: Users, href: '/admin/wave1' },
    { label: 'Active Requests', value: activeRequests, sub: `${totalRequests} all-time`, icon: Inbox, href: '/admin/requests' },
    { label: 'Confirmed Bookings', value: totalBookings, sub: 'Verified reservations', icon: CalendarCheck, href: '/admin/requests' },
    { label: 'Active Providers', value: totalProviders, sub: 'Ahmedabad network', icon: Store, href: '/admin/providers' },
    { label: 'Average CSAT', value: `${avgRating} ★`, sub: `${feedbacks.length} reviews`, icon: Star, href: '/admin/overview' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Operations Command Center</h1>
        <p className="text-xs text-neutral-500 mt-1">Live metrics across customers, concierges, requests, and providers.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:border-neutral-300 transition-all block"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Icon className="h-4 w-4" />
                <ArrowUpRight className="h-3 w-3" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
              <p className="text-[11px] font-semibold text-neutral-700 mt-1">{s.label}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Security & Audit Ledger */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-neutral-700" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Recent System Audit Log</h2>
          </div>
          <Link href="/admin/audit" className="text-xs text-neutral-500 hover:text-neutral-900 font-medium">
            View full audit trail →
          </Link>
        </div>

        <div className="divide-y divide-neutral-100 text-xs">
          {recentAudit.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-semibold text-neutral-700">
                  {log.action}
                </span>
                <span className="text-neutral-600">{log.resourceType || 'System'}</span>
              </div>
              <span className="text-neutral-400 text-[11px]">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

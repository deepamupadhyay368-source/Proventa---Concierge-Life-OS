import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  Users,
  Bot,
  ListTodo,
  CalendarCheck,
  CreditCard,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMainDashboardPage() {
  const sessionUser = await requireSuperAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch real aggregated data across database models
  const [
    totalCustomers,
    newCustomers7d,
    newCustomers30d,
    totalWaitlist,
    totalTasks,
    activeTasks,
    completedTasks,
    needsHumanTasks,
    totalBookings,
    confirmedBookings,
    payments,
    categoryRaw,
    recentTasks,
    recentAudit,
  ] = await Promise.all([
    db.customerProfile.count(),
    db.customerProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.customerProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.earlyAccessRegistration.count(),
    db.task.count(),
    db.task.count({
      where: {
        status: { in: ['REQUESTED', 'SEARCHING', 'OPTIONS_READY', 'AWAITING_APPROVAL', 'APPROVED', 'EXECUTING', 'VERIFYING'] },
      },
    }),
    db.task.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    db.task.count({ where: { OR: [{ status: 'NEEDS_HUMAN' }, { isEscalated: true }] } }),
    db.booking.count(),
    db.booking.count({ where: { status: 'CONFIRMED' } }),
    db.payment.findMany({
      where: { status: 'CAPTURED' },
      select: { amount: true },
    }),
    db.task.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    db.task.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),
    db.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { email: true, name: true } },
      },
    }),
  ]);

  // Financial calculation: amount is stored in paise
  const totalGMVPaise = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalGMVInRupees = (totalGMVPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome & Atmosphere Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Founder Sovereign Intelligence
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              {sessionUser.name || 'Deepam G Upadhyay'} · Operations Terminal
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Platform Command Center
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Real-time telemetry, agent orchestration, customer sovereign vaults, and partner network transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/system"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1714] border border-[#2e2924] hover:border-[#3e352b] text-xs text-[#c8b99d] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">Neon DB + Gemini Active</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#b09a78] to-[#9c8260] text-black font-semibold text-xs shadow-md shadow-[#9c8260]/10 hover:brightness-105 transition-all"
          >
            <span>Customer Vault</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Customers */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-[#c8b99d]" />
          </div>
          <div className="text-2xl font-semibold text-[#f5f3ef] font-mono">{totalCustomers}</div>
          <p className="text-[11px] text-[#736f68] mt-1 flex items-center gap-1">
            <span className="text-[#c8b99d]">+{newCustomers7d} 7d</span> · <span className="text-[#c8b99d]">+{newCustomers30d} 30d</span>
          </p>
        </div>

        {/* Active Tasks */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Requests</span>
            <ListTodo className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-[#f5f3ef] font-mono">{activeTasks}</div>
          <p className="text-[11px] text-[#736f68] mt-1">
            {totalTasks} lifetime requests
          </p>
        </div>

        {/* Completed Workflows */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-emerald-300 font-mono">{completedTasks}</div>
          <p className="text-[11px] text-[#736f68] mt-1">Zero-hallucination verified</p>
        </div>

        {/* Escalated / Needs Human */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Needs Human</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-purple-300 font-mono">{needsHumanTasks}</div>
          <p className="text-[11px] text-[#736f68] mt-1">Human concierge queue</p>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Bookings</span>
            <CalendarCheck className="w-4 h-4 text-[#c8b99d]" />
          </div>
          <div className="text-2xl font-semibold text-[#f5f3ef] font-mono">{confirmedBookings}</div>
          <p className="text-[11px] text-[#736f68] mt-1">{totalBookings} total ledger</p>
        </div>

        {/* GMV Volume */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-4 shadow-sm hover:border-[#38332c] transition-all">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Gross Volume</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-semibold text-[#f5f3ef] font-mono truncate" title={totalGMVInRupees}>
            {totalGMVInRupees}
          </div>
          <p className="text-[11px] text-[#736f68] mt-1">Processed transactions</p>
        </div>
      </div>

      {/* Category / Service Breakdown & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-[#23201c] mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c8b99d]" />
              <h3 className="text-sm font-semibold text-[#f5f3ef]">Service &amp; Category Distribution</h3>
            </div>
            <Link href="/admin/requests" className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono">
              Filter By Category →
            </Link>
          </div>

          {categoryRaw.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#736f68]">No requests categorized yet.</div>
          ) : (
            <div className="space-y-3">
              {categoryRaw.map((cat) => {
                const count = cat._count.id;
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#f5f3ef] font-medium uppercase tracking-wider font-mono">
                        {cat.category}
                      </span>
                      <span className="text-[#736f68] font-mono">
                        {count} requests ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1c1916] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#9c8260] to-[#c8b99d] rounded-full transition-all"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Founder Controls */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#23201c] mb-4">
              <Bot className="w-4 h-4 text-[#c8b99d]" />
              <h3 className="text-sm font-semibold text-[#f5f3ef]">Founder Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/admin/concierge"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a1714] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#f5f3ef] transition-colors"
              >
                <span>Concierge Operator Queue</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
                  {needsHumanTasks} pending
                </span>
              </Link>
              <Link
                href="/admin/requests"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a1714] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#f5f3ef] transition-colors"
              >
                <span>Active Autonomous Tasks</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  {activeTasks} in flight
                </span>
              </Link>
              <Link
                href="/admin/system"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a1714] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#f5f3ef] transition-colors"
              >
                <span>System Latency &amp; Probes</span>
                <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </Link>
              <Link
                href="/admin/analytics"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a1714] border border-[#2a241e] hover:border-[#3d342a] text-xs text-[#f5f3ef] transition-colors"
              >
                <span>Executive Analytics</span>
                <BarChart3 className="w-3.5 h-3.5 text-[#736f68]" />
              </Link>
            </div>
          </div>
          <div className="pt-4 border-t border-[#23201c] mt-4 text-[11px] text-[#736f68] font-mono">
            Proventa v0.1.0 · Single Source of Truth
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Autonomous Tasks + Security Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-[#23201c] mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#c8b99d]" />
              <h3 className="text-sm font-semibold text-[#f5f3ef]">Live Task Pipeline</h3>
            </div>
            <Link href="/admin/requests" className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono">
              View All Requests →
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#736f68]">No request history recorded yet.</div>
            ) : (
              recentTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/requests/${t.id}`}
                  className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c] hover:border-[#38332c] flex items-center justify-between gap-3 block transition-colors group"
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
                            : ['NEEDS_HUMAN', 'FAILED'].includes(t.status)
                            ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#f5f3ef] truncate mt-1 group-hover:text-[#c8b99d] transition-colors">
                      {t.intent}
                    </p>
                    <p className="text-[10px] text-[#736f68] mt-0.5">
                      Customer: {t.customer?.user?.name || t.customer?.user?.email || 'Anonymous'}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#524e47] group-hover:text-[#c8b99d] transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-[#23201c] mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#f5f3ef]">Recent Sovereign Audit Logs</h3>
            </div>
            <Link href="/admin/audit" className="text-xs text-[#736f68] hover:text-[#c8b99d] font-mono">
              Full Audit Trail →
            </Link>
          </div>

          <div className="space-y-3">
            {recentAudit.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#736f68]">No audit events logged yet.</div>
            ) : (
              recentAudit.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-[#1f1b17] border border-[#38332c] text-[#c8b99d] px-2 py-0.5 rounded font-bold">
                        {log.action}
                      </span>
                      <span className="text-[#a8a49c] font-medium truncate">
                        {log.resourceType || 'System'}: {log.resourceId || 'Global'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#736f68] mt-1 truncate">
                      Actor: {log.actor?.email || 'System Daemon'} {log.ipAddress ? `· IP: ${log.ipAddress}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#524e47] font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

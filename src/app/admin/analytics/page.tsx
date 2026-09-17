import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth/session';
import {
  BarChart3,
  TrendingUp,
  Users,
  ListTodo,
  Bot,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireSuperAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalTasks,
    completedTasks,
    escalatedTasks,
    autonomousTasks,
    categoryCounts,
    statusCounts,
    priorityCounts,
    totalCustomers,
    newCustomers7d,
    newCustomers30d,
    completedTasksTimes,
  ] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    db.task.count({ where: { OR: [{ status: 'NEEDS_HUMAN' }, { isEscalated: true }] } }),
    db.task.count({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        isEscalated: false,
      },
    }),
    db.task.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    db.task.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    db.task.groupBy({
      by: ['priority'],
      _count: { id: true },
    }),
    db.customerProfile.count(),
    db.customerProfile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.customerProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.task.findMany({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      select: { createdAt: true, completedAt: true, updatedAt: true },
      take: 100,
    }),
  ]);

  // Compute fulfillment ratio
  const autonomousRatio =
    completedTasks > 0
      ? Math.round((autonomousTasks / completedTasks) * 100)
      : 100;
  const conciergeRatio = completedTasks > 0 ? 100 - autonomousRatio : 0;

  // Escalation rate
  const escalationRate =
    totalTasks > 0 ? ((escalatedTasks / totalTasks) * 100).toFixed(1) : '0.0';

  // Compute average resolution time in minutes
  let avgResolutionMinutes = 0;
  if (completedTasksTimes.length > 0) {
    const totalMs = completedTasksTimes.reduce((acc, t) => {
      const end = t.completedAt || t.updatedAt;
      return acc + (end.getTime() - t.createdAt.getTime());
    }, 0);
    avgResolutionMinutes = Math.max(1, Math.round(totalMs / completedTasksTimes.length / 60000));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-[#26211b] text-[#c8b99d] px-2.5 py-0.5 rounded border border-[#3e352b]">
              Platform Telemetry
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Live Database Aggregations · Zero Synthetic Fabrication
            </span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Executive Analytics &amp; Operations
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Real-time fulfillment metrics, multi-agent autonomous delegation ratios, category demand, and turnaround times.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/requests"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#c8b99d] hover:border-[#38332c] transition-colors"
          >
            <span>Master Requests</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Customer Growth</span>
            <Users className="w-4 h-4 text-[#c8b99d]" />
          </div>
          <div className="text-2xl font-semibold text-[#f5f3ef] font-mono">{totalCustomers}</div>
          <div className="text-[11px] text-[#736f68] mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400">+{newCustomers7d}</span> past 7d ·{' '}
            <span className="text-emerald-400">+{newCustomers30d}</span> past 30d
          </div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Autonomous Fulfillment</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-emerald-300 font-mono">{autonomousRatio}%</div>
          <div className="text-[11px] text-[#736f68] mt-1 font-mono">
            {autonomousTasks} of {completedTasks || 1} completed workflows
          </div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Escalation Rate</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-semibold text-purple-300 font-mono">{escalationRate}%</div>
          <div className="text-[11px] text-[#736f68] mt-1 font-mono">
            {escalatedTasks} human escalations logged
          </div>
        </div>

        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#736f68] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-[#c8b99d]" />
          </div>
          <div className="text-2xl font-semibold text-[#f5f3ef] font-mono">
            {avgResolutionMinutes > 0 ? `${avgResolutionMinutes} min` : 'Pending cycles'}
          </div>
          <div className="text-[11px] text-[#736f68] mt-1 font-mono">
            End-to-end task turnaround
          </div>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Autonomous vs Human Handoff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
            <h3 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c8b99d]" />
              <span>Volume by Service Category</span>
            </h3>
            <span className="text-xs font-mono text-[#736f68]">{totalTasks} Total Requests</span>
          </div>

          {categoryCounts.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#736f68]">No categorized requests recorded.</div>
          ) : (
            <div className="space-y-3">
              {categoryCounts.map((cat) => {
                const count = cat._count.id;
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#f5f3ef] uppercase">{cat.category}</span>
                      <span className="text-[#736f68]">
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

        {/* Autonomous Delegation Breakdown */}
        <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#23201c]">
            <h3 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c8b99d]" />
              <span>Autonomous vs. Human Concierge Split</span>
            </h3>
            <span className="text-xs font-mono text-[#736f68]">{completedTasks} Completed Workflows</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>Autonomous Agent Fleet</span>
              </span>
              <span className="text-[#f5f3ef] font-bold">{autonomousRatio}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#1c1916] overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${autonomousRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#736f68] font-mono">
              <span>{autonomousTasks} workflows completed without manual fallback</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e0d0c] border border-[#23201c] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                <span>Senior Human Concierge</span>
              </span>
              <span className="text-[#f5f3ef] font-bold">{conciergeRatio}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#1c1916] overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${conciergeRatio}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#736f68] font-mono">
              <span>{completedTasks - autonomousTasks} high-touch human interventions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Distribution Ledger */}
      <div className="bg-[#141210] border border-[#23201c] rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="text-sm font-semibold text-[#f5f3ef] flex items-center gap-2 pb-3 border-b border-[#23201c]">
          <BarChart3 className="w-4 h-4 text-[#c8b99d]" />
          <span>Workflow Execution States</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {statusCounts.map((sc) => (
            <div key={sc.status} className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c]">
              <span className="text-[10px] font-mono text-[#736f68] uppercase block truncate">
                {sc.status.replace(/_/g, ' ')}
              </span>
              <span className="text-lg font-bold font-mono text-[#f5f3ef] mt-1 block">
                {sc._count.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

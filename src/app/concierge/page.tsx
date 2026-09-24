'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  User,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function ConciergeDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    tasks: any[];
    metrics: any;
    currentOperator: string;
  } | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : currentUser?.email?.split('@')[0] || 'Operator';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch('/api/concierge/tasks?filter=all');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load concierge dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const s = await res.json();
          if (s?.user) setCurrentUser(s.user);
        }
      } catch (e) {}
    }
    loadSession();
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  async function handleClaim(taskId: string) {
    try {
      setClaimingId(taskId);
      const res = await fetch('/api/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLAIM',
          taskId,
        }),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to claim task');
      }
    } catch (e) {
      alert('Network error while claiming task');
    } finally {
      setClaimingId(null);
    }
  }

  const metrics = data?.metrics || {
    total: 0,
    unassigned: 0,
    myTasks: 0,
    inProgress: 0,
    waitingCustomer: 0,
    waitingProvider: 0,
    escalated: 0,
    slaUrgent: 0,
    slaOverdue: 0,
  };

  const tasksNeedingAction = (data?.tasks || []).filter(
    (t: any) =>
      t.status === 'NEEDS_HUMAN' ||
      t.status === 'APPROVED' ||
      t.status === 'EXECUTING' ||
      t.isEscalated ||
      t.slaStatus === 'URGENT' ||
      t.slaStatus === 'OVERDUE'
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mono text-xs tracking-wider uppercase font-semibold">
              Live Operations Control
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">Shift Active</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            {getGreeting()}, <span className="text-amber-300">{firstName}</span>.
          </h1>
          <p className="text-sm text-neutral-400">
            Welcome to the Proventa Human Concierge Workspace. You have{' '}
            <strong className="text-neutral-200">{metrics.myTasks} tasks</strong> assigned to you and{' '}
            <strong className="text-amber-300">{metrics.unassigned} unassigned</strong> in the operations queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 rounded-lg border border-neutral-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
          <Link
            href="/concierge/tasks"
            className="flex items-center gap-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2 rounded-lg shadow-md shadow-amber-500/20 transition-all"
          >
            <Inbox className="h-4 w-4" />
            <span>Open Queue</span>
          </Link>
        </div>
      </div>

      {/* SLA Alert Banner if urgent/overdue */}
      {(metrics.slaUrgent > 0 || metrics.slaOverdue > 0 || metrics.escalated > 0) && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-900/50 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-rose-200">Attention Required: Active Operational Pressure</div>
              <div className="text-xs text-rose-300/80">
                {metrics.slaOverdue > 0 && `${metrics.slaOverdue} Overdue SLA • `}
                {metrics.slaUrgent > 0 && `${metrics.slaUrgent} SLA Due Soon • `}
                {metrics.escalated > 0 && `${metrics.escalated} Escalated by Lead`}
              </div>
            </div>
          </div>
          <Link
            href="/concierge/tasks?filter=escalated"
            className="text-xs font-semibold text-rose-300 hover:text-white bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-700/60 transition-colors whitespace-nowrap"
          >
            Resolve Urgent
          </Link>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/concierge/tasks?filter=my_tasks"
          className="bg-neutral-900/80 border border-neutral-800/80 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">My Active Tasks</span>
            <div className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white group-hover:text-amber-300 font-mono transition-colors">
            {metrics.myTasks}
          </div>
          <div className="text-[11px] text-neutral-500">Directly assigned to you</div>
        </Link>

        <Link
          href="/concierge/tasks?filter=unassigned"
          className="bg-neutral-900/80 border border-neutral-800/80 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Unassigned Queue</span>
            <div className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.unassigned}</div>
          <div className="text-[11px] text-neutral-500">Awaiting operator claim</div>
        </Link>

        <Link
          href="/concierge/tasks?filter=waiting_provider"
          className="bg-neutral-900/80 border border-neutral-800/80 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Awaiting Provider</span>
            <div className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
              <PhoneCall className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.waitingProvider}</div>
          <div className="text-[11px] text-neutral-500">Called / desk verifying</div>
        </Link>

        <Link
          href="/concierge/tasks?filter=ready_to_execute"
          className="bg-neutral-900/80 border border-neutral-800/80 hover:border-amber-500/40 p-4 rounded-xl space-y-2 transition-all group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Approved by Member</span>
            <div className="p-1.5 rounded-md bg-neutral-800 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{metrics.readyToExecute || 0}</div>
          <div className="text-[11px] text-neutral-500">Ready for provider booking</div>
        </Link>
      </div>

      {/* Priority Action Tasks Table */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">High Priority Tasks Needing Action</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tasks requiring human execution, provider calls, or VIP offline coordination
            </p>
          </div>
          <Link
            href="/concierge/tasks"
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading && !data ? (
          <div className="p-12 text-center text-neutral-500 text-sm">Loading operations queue...</div>
        ) : tasksNeedingAction.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <div className="font-medium text-sm text-neutral-200">Queue is clear!</div>
            <p className="text-xs text-neutral-500">No urgent tasks currently awaiting human intervention.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Task ID & Member</th>
                  <th className="py-3 px-4">Category & Request</th>
                  <th className="py-3 px-4">Priority & SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {tasksNeedingAction.slice(0, 8).map((task: any) => {
                  const isClaimedByMe = task.isClaimedByMe;
                  const isUnassigned = !task.assignedOperator;
                  const isUrgent = task.priority === 'CRITICAL' || task.priority === 'URGENT';

                  return (
                    <tr key={task.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-neutral-100">{task.publicId}</div>
                        <div className="text-neutral-400 font-sans text-[11px] mt-0.5">{task.customerName}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-neutral-200">{task.category}</div>
                        <div className="text-neutral-400 truncate text-[11px] mt-0.5">{task.originalRequest}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                              isUrgent
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              task.slaStatus === 'OVERDUE'
                                ? 'bg-rose-500/20 text-rose-400'
                                : task.slaStatus === 'URGENT'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'text-neutral-500'
                            }`}
                          >
                            {task.slaStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] ${
                            isUnassigned ? 'text-amber-400/90 italic font-mono' : 'text-neutral-300'
                          }`}
                        >
                          {task.assignedOperator || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnassigned ? (
                            <button
                              onClick={() => handleClaim(task.id)}
                              disabled={claimingId === task.id}
                              className="px-2.5 py-1 text-[11px] font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors"
                            >
                              {claimingId === task.id ? 'Claiming...' : 'Claim'}
                            </button>
                          ) : null}
                          <Link
                            href={`/concierge/tasks/${task.id}`}
                            className="px-2.5 py-1 text-[11px] font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-colors"
                          >
                            Workspace
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronRight,
  User,
} from 'lucide-react';

export default function ConciergeTeamPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  async function loadTeam() {
    try {
      setLoading(true);
      const res = await fetch('/api/concierge/team');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load team operations', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  const team = data?.team || [];
  const shift = data?.shiftInfo || { shiftName: 'Operations Shift', shiftHours: '09:00 - 21:00 IST' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-amber-400" />
            <span>Concierge Team & Workload</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time staff workload distribution, capacity management, and shift control
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{shift.shiftHours}</span>
          </div>
          <button
            onClick={loadTeam}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="text-neutral-400 text-xs font-medium">Active Operators</div>
          <div className="text-2xl font-bold font-mono text-white">{team.length}</div>
          <div className="text-[11px] text-neutral-500">Online and taking requests</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="text-neutral-400 text-xs font-medium">Total Active In-Flight Tasks</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{data?.totalActiveTasks || 0}</div>
          <div className="text-[11px] text-neutral-500">Currently in human execution</div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="text-neutral-400 text-xs font-medium">Unassigned Queue Depth</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{data?.unassignedTasksCount || 0}</div>
          <div className="text-[11px] text-neutral-500">Ready for operator claim</div>
        </div>
      </div>

      {/* Operator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((operator: any) => {
          const load = operator.loadPercentage;
          const isHighLoad = load >= 80;

          return (
            <div
              key={operator.id}
              className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 p-5 rounded-2xl space-y-4 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-amber-300">
                    {operator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-100">{operator.name}</div>
                    <div className="text-xs text-neutral-400">{operator.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                  {operator.primaryRole.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Workload Meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Current Load</span>
                  <span className="font-mono font-semibold text-neutral-200">
                    {operator.activeTasksCount} / {operator.capacity} tasks ({load}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full rounded-full ${
                      isHighLoad ? 'bg-rose-500' : load > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${load}%` }}
                  />
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-center text-xs">
                <div className="p-2 bg-neutral-950/60 rounded-lg">
                  <div className="font-mono font-bold text-blue-400">{operator.executingTasksCount}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Executing</div>
                </div>
                <div className="p-2 bg-neutral-950/60 rounded-lg">
                  <div className="font-mono font-bold text-rose-400">{operator.escalatedCount}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Escalated</div>
                </div>
                <div className="p-2 bg-neutral-950/60 rounded-lg">
                  <div className="font-mono font-bold text-amber-400">{operator.urgentCount}</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Urgent</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

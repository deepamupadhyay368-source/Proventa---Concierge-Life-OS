'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  User,
  ShieldAlert,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function ConciergeOperationsQueuePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-500 text-xs">Loading operations queue...</div>}>
      <ConciergeOperationsQueueContent />
    </Suspense>
  );
}

function ConciergeOperationsQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get('filter') || 'all';
  const currentCategory = searchParams.get('category') || '';
  const currentPriority = searchParams.get('priority') || '';
  const currentAssigned = searchParams.get('assigned') || 'all';

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function fetchQueue() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilter) params.set('filter', currentFilter);
      if (currentCategory) params.set('category', currentCategory);
      if (currentPriority) params.set('priority', currentPriority);
      if (currentAssigned) params.set('assigned', currentAssigned);
      if (search) params.set('search', search);

      const res = await fetch(`/api/concierge/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setMetrics(data.metrics || {});
      }
    } catch (err) {
      console.error('Failed to fetch concierge tasks', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQueue();
  }, [currentFilter, currentCategory, currentPriority, currentAssigned]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/concierge/tasks?${params.toString()}`);
  }

  async function handleClaim(taskId: string) {
    try {
      setClaimingId(taskId);
      const res = await fetch('/api/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CLAIM', taskId }),
      });
      if (res.ok) {
        await fetchQueue();
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

  const tabFilters = [
    { key: 'all', label: 'All Tasks', count: metrics.total },
    { key: 'ready_to_execute', label: 'Ready to Execute', count: metrics.readyToExecute },
    { key: 'in_progress', label: 'In Progress', count: metrics.inProgress },
    { key: 'waiting_provider', label: 'Awaiting Provider', count: metrics.waitingProvider },
    { key: 'waiting_customer', label: 'Needs Member Info', count: metrics.waitingCustomer },
    { key: 'escalated', label: 'Escalated', count: metrics.escalated, highlight: true },
    { key: 'completed', label: 'Completed', count: metrics.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Human Operations Queue</span>
            <span className="text-xs font-mono font-normal bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time human concierge queue for reservations, bookings, and VIP offline execution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchQueue()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-800">
        {tabFilters.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => updateFilter('filter', tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    tab.highlight
                      ? 'bg-rose-500/20 text-rose-300 font-semibold'
                      : isActive
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Dropdown Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by member name, phone, task ID, or request..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={currentAssigned}
            onChange={(e) => updateFilter('assigned', e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Assignment: All</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned Only</option>
          </select>

          <select
            value={currentPriority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Category: All</option>
            <option value="DINING">Fine Dining</option>
            <option value="AVIATION">Aviation</option>
            <option value="TRAVEL">Travel</option>
            <option value="REAL_ESTATE">Real Estate</option>
            <option value="EVENTS">Events</option>
            <option value="WELLNESS">Wellness</option>
          </select>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 text-xs">Loading queue items...</div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <div className="font-semibold text-sm text-neutral-200">No tasks match your filters</div>
            <p className="text-xs text-neutral-500">Try changing or clearing filters to view all tasks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Task ID & Member</th>
                  <th className="py-3 px-4">Category & Request</th>
                  <th className="py-3 px-4">Priority & SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Operator</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {tasks.map((task: any) => {
                  const isUnassigned = !task.assignedOperator;
                  const isUrgent = task.priority === 'CRITICAL' || task.priority === 'URGENT';
                  const isEscalated = task.isEscalated;

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-neutral-800/40 transition-colors ${
                        isEscalated ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* ID & Member */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 font-semibold text-neutral-100">
                          {task.publicId}
                          {isEscalated && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 rounded font-mono">
                              ESC
                            </span>
                          )}
                        </div>
                        <div className="text-neutral-400 font-sans text-[11px] mt-0.5">{task.customerName}</div>
                      </td>

                      {/* Category & Request */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-neutral-200">{task.category}</div>
                        <div className="text-neutral-400 truncate text-[11px] mt-0.5">{task.originalRequest}</div>
                      </td>

                      {/* Priority & SLA */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                        <div className="text-[10px] font-mono text-neutral-500 mt-1">
                          Wait: {task.waitingMinutes}m
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                            task.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : task.status === 'EXECUTING'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : task.status === 'NEEDS_INFORMATION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : task.status === 'COMPLETED'
                              ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] ${
                            isUnassigned ? 'text-amber-400/90 font-mono italic' : 'text-neutral-200'
                          }`}
                        >
                          {task.assignedOperator || 'Unassigned'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isUnassigned && (
                            <button
                              onClick={() => handleClaim(task.id)}
                              disabled={claimingId === task.id}
                              className="px-2.5 py-1 text-[11px] font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded shadow transition-colors"
                            >
                              {claimingId === task.id ? 'Claiming...' : 'Claim'}
                            </button>
                          )}
                          <Link
                            href={`/concierge/tasks/${task.id}`}
                            className="px-3 py-1 text-[11px] font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ChevronRight className="h-3 w-3 text-neutral-400" />
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

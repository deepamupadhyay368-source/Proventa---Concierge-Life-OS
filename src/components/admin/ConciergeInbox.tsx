'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Phone,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Layers,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { ConciergeOperatorWorkspace } from './ConciergeOperatorWorkspace';

interface TaskCard {
  id: string;
  publicId: string;
  category: string;
  intent: string;
  originalRequest: string;
  priority: string;
  status: string;
  isEscalated: boolean;
  executionMethod: string;
  executionTier?: 'AUTOMATED' | 'ASSISTED' | 'HUMAN';
  executionReason?: string | null;
  providerStatus?: string | null;
  preparedContext?: any;
  assignedAgent: string;
  assignedOperator: string | null;
  vendorName: string | null;
  budgetAmount: number | null;
  budgetCurrency: string;
  externalReferenceId: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  queue: string;
  waitingMinutes: number;
  latestEvent: {
    id: string;
    eventType: string;
    actorRole: string;
    message: string;
    createdAt: string;
  } | null;
}

export function ConciergeInbox() {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    new: 0,
    in_progress: 0,
    waiting_customer: 0,
    waiting_provider: 0,
    awaiting_approval: 0,
    ready_to_execute: 0,
    completed: 0,
    escalated: 0,
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);

  const fetchQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/concierge/queue');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error('[ConciergeInbox] Polling failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh polling every 12 seconds
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchQueue();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filter & Sort tasks
  const filteredTasks = tasks
    .filter((t) => {
      if (activeTab !== 'all' && t.queue !== activeTab) return false;
      if (categoryFilter && t.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (assignedFilter === 'assigned' && !t.assignedOperator) return false;
      if (assignedFilter === 'unassigned' && t.assignedOperator) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.publicId.toLowerCase().includes(q) ||
          t.intent.toLowerCase().includes(q) ||
          t.originalRequest.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerPhone.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

  const queueTabs = [
    { id: 'all', label: 'All Requests', count: counts.all },
    { id: 'new', label: 'New', count: counts.new },
    { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { id: 'waiting_customer', label: 'Waiting for Customer', count: counts.waiting_customer },
    { id: 'waiting_provider', label: 'Waiting for Provider', count: counts.waiting_provider },
    { id: 'awaiting_approval', label: 'Awaiting Approval', count: counts.awaiting_approval },
    { id: 'ready_to_execute', label: 'Ready to Execute', count: counts.ready_to_execute },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'escalated', label: 'Escalated', count: counts.escalated },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title & Auto-Refresh Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#23201c] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest bg-emerald-950/60 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Concierge Terminal
            </span>
            <span className="text-xs text-[#736f68] font-mono">
              Auto-refreshing every 12s
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#f5f3ef] mt-2">
            Founder &amp; Concierge Work Queue
          </h1>
          <p className="text-xs text-[#928f88] mt-1 max-w-2xl">
            Unified operational inbox for member requests, phone booking dispatches, client approvals, and vendor executions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1c1916] border border-[#2a241e] hover:border-[#3e352b] text-xs font-mono text-[#c8b99d] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#23201c] pb-2 overflow-x-auto">
        {queueTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#26211b] text-[#f5f3ef] border border-[#3e352b] shadow-xs'
                  : 'text-[#736f68] hover:text-[#f5f3ef] hover:bg-[#161412]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#3d342a] text-[#c8b99d]'
                    : tab.count > 0
                    ? 'bg-[#201c18] text-[#a8a49c]'
                    : 'bg-[#181512] text-[#524e47]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#141210] border border-[#23201c] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#524e47]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, client name, phone..."
            className="w-full bg-[#0d0c0a] border border-[#23201c] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f5f3ef] placeholder-[#524e47] outline-none focus:border-[#c8b99d]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0d0c0a] border border-[#23201c] text-[#a8a49c] rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="">All Categories</option>
            <option value="dining">Dining</option>
            <option value="travel">Travel &amp; Flights</option>
            <option value="hotels">Stays &amp; Hotels</option>
            <option value="transport">Mobility &amp; Chauffeur</option>
            <option value="gifts">Gifts &amp; Shopping</option>
            <option value="events">Events &amp; Access</option>
            <option value="bespoke">Bespoke Requests</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#0d0c0a] border border-[#23201c] text-[#a8a49c] rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value as any)}
            className="bg-[#0d0c0a] border border-[#23201c] text-[#a8a49c] rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="all">All Ownership</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0d0c0a] border border-[#23201c] text-[#a8a49c] rounded-lg px-2.5 py-1.5 text-xs outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority First</option>
          </select>
        </div>
      </div>

      {/* Task Queue List */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-[#141210] border border-[#23201c] text-xs font-mono text-[#736f68]">
          Loading concierge work queue...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#141210] border border-[#23201c] space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#524e47] mx-auto" />
          <div className="text-sm font-medium text-[#f5f3ef]">No requests in this queue</div>
          <p className="text-xs text-[#736f68] max-w-sm mx-auto">
            All member mandates in this operational section are currently fulfilled or awaiting new dispatches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="p-5 rounded-2xl bg-[#141210] border border-[#23201c] hover:border-[#3e352b] transition-all cursor-pointer space-y-3.5 group relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#c8b99d]">#{t.publicId}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1c1916] text-[#a8a49c] border border-[#26211b]">
                    {t.category}
                  </span>
                  {t.priority === 'URGENT' && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                      URGENT
                    </span>
                  )}
                  {t.executionTier && (
                    <span
                      title={t.executionReason || undefined}
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-medium border ${
                        t.executionTier === 'AUTOMATED'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : t.executionTier === 'ASSISTED'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                      }`}
                    >
                      {t.executionTier}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-semibold ${
                  t.status === 'CONFIRMED' || t.status === 'COMPLETED'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    : t.status === 'NEEDS_HUMAN' || t.isEscalated
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                    : t.status === 'AWAITING_APPROVAL'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    : 'bg-[#201c18] text-[#c8b99d] border border-[#383127]'
                }`}>
                  {t.status}
                </span>
              </div>

              {/* Mandate Description */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-[#f5f3ef] group-hover:text-[#c8b99d] transition-colors line-clamp-1">
                  {t.intent || t.originalRequest}
                </h4>
                <p className="text-xs text-[#736f68] line-clamp-2 leading-relaxed">{t.originalRequest}</p>
              </div>

              {/* Member & Wait Details */}
              <div className="p-3 rounded-xl bg-[#0e0d0c] border border-[#23201c] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#a8a49c]">
                  <User className="w-3.5 h-3.5 text-[#524e47]" />
                  <span>{t.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-[#736f68]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.waitingMinutes}m waiting</span>
                </div>
              </div>

              {/* Latest Event Note */}
              {t.latestEvent && (
                <div className="text-[11px] font-mono text-[#736f68] line-clamp-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#524e47]" />
                  <span>{t.latestEvent.message}</span>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#23201c] text-xs font-mono">
                <span className="text-[#524e47]">
                  {t.assignedOperator ? `Operator: ${t.assignedOperator}` : 'Unassigned'}
                </span>
                <span className="text-[#c8b99d] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Operator Workspace */}
      {selectedTask && (
        <ConciergeOperatorWorkspace
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onRefresh={() => {
            fetchQueue();
            // Re-sync selected task
            setSelectedTask((prev) => (prev ? { ...prev, updatedAt: new Date().toISOString() } : null));
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListTodo, CheckCircle2, Clock, ShieldCheck, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function CustomerTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'ACTIVE' | 'AWAITING_APPROVAL' | 'CONFIRMED' | 'NEEDS_HUMAN'>('ALL');

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (tab === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(t.status);
    if (tab === 'AWAITING_APPROVAL') return t.status === 'AWAITING_APPROVAL';
    if (tab === 'CONFIRMED') return ['CONFIRMED', 'COMPLETED'].includes(t.status);
    if (tab === 'NEEDS_HUMAN') return t.status === 'NEEDS_HUMAN';
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-medium text-neutral-900">Task Execution Center</h1>
          <p className="text-xs text-neutral-500 mt-1">Real-time status of your autonomous and concierge-assisted delegations.</p>
        </div>
        <Link
          href="/dashboard#new-request"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
        >
          + Delegate New Task
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-200 text-xs">
        {[
          { key: 'ALL', label: `All Tasks (${tasks.length})` },
          { key: 'ACTIVE', label: 'In Progress' },
          { key: 'AWAITING_APPROVAL', label: 'Awaiting Approval' },
          { key: 'CONFIRMED', label: 'Confirmed & Complete' },
          { key: 'NEEDS_HUMAN', label: 'Human Concierge' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              tab === t.key
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-16 text-xs text-neutral-400">Loading your tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl p-8">
          <ListTodo className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-800">No tasks in this view</p>
          <p className="text-xs text-neutral-400 mt-1">Delegate a request from your dashboard to spin up an agent workflow.</p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
          >
            Open Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTasks.map((task) => {
            const hasApproval = task.status === 'AWAITING_APPROVAL';
            const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(task.status);
            const isNeedsHuman = task.status === 'NEEDS_HUMAN';

            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : hasApproval
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isNeedsHuman
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {isConfirmed && <CheckCircle2 className="h-3 w-3" />}
                        {hasApproval && <ShieldCheck className="h-3 w-3" />}
                        {isNeedsHuman && <UserCheck className="h-3 w-3" />}
                        {!isConfirmed && !hasApproval && !isNeedsHuman && <Clock className="h-3 w-3" />}
                        {task.status.replace(/_/g, ' ')}
                      </span>

                      <span className="text-[11px] font-medium text-[#8a7053] bg-[#faf8f5] px-2 py-0.5 rounded-md border border-[#e8e2d8]">
                        {task.assignedAgent || task.category}
                      </span>

                      <span className="text-xs text-neutral-400 number-mono">
                        #{task.publicId || task.id.slice(-6)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-neutral-900 group-hover:text-brand-900 transition-colors line-clamp-1">
                      {task.intent || task.originalRequest}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      {task.vendorName && (
                        <span>
                          Vendor: <strong className="text-neutral-700 font-medium">{task.vendorName}</strong>
                        </span>
                      )}
                      {task.budgetAmount && (
                        <span>
                          Budget: <strong className="text-neutral-700 font-medium">₹{task.budgetAmount.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      <span>
                        Created: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {hasApproval && (
                      <span className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs animate-pulse">
                        Action Required
                      </span>
                    )}
                    <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-800 flex items-center gap-0.5">
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

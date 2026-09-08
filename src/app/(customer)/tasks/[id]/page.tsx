'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Building,
  UserCheck,
  ChevronRight,
  Receipt,
  FileCheck
} from 'lucide-react';
import { DAGGraphView } from '@/components/tasks/dag-graph-view';
import { ApprovalActionCard } from '@/components/tasks/approval-action-card';
import { VerifiedPassCard } from '@/components/tasks/verified-pass-card';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'RAW'>('OVERVIEW');

  // Manual concierge resolution state
  const [manualRef, setManualRef] = useState('');
  const [manualVendor, setManualVendor] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const loadTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.task) setTask(data.task);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
    const interval = setInterval(loadTask, 4000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleApprove = async (option: any) => {
    setApproving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        loadTask();
      }
    } finally {
      setApproving(false);
    }
  };

  const handleManualConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRef.trim()) return;

    setSubmittingManual(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/manual-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: manualRef.trim(),
          vendorName: manualVendor.trim(),
          notes: manualNotes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setManualRef('');
        setManualVendor('');
        setManualNotes('');
        setTask(data.task);
        loadTask();
      }
    } finally {
      setSubmittingManual(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-xs text-neutral-400">Loading task details...</div>;
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium text-neutral-800">Task not found</p>
        <Link href="/tasks" className="text-xs text-[#8a7053] hover:underline mt-2 inline-block">
          Return to task list
        </Link>
      </div>
    );
  }

  const isConfirmed = ['CONFIRMED', 'COMPLETED'].includes(task.status);
  const isAwaitingApproval = task.status === 'AWAITING_APPROVAL';
  const isNeedsHuman = task.status === 'NEEDS_HUMAN';
  const events = task.events || [];
  const proposedOptions = (task.proposedOptions || []) as any[];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Back & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/tasks" className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#8a7053] uppercase tracking-wider">
                {task.assignedAgent || task.category}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-400 number-mono">Task #{task.publicId || task.id.slice(-6)}</span>
            </div>
            <h1 className="text-lg font-semibold text-neutral-900 mt-0.5">{task.intent || task.originalRequest}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
              isConfirmed
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : isAwaitingApproval
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : isNeedsHuman
                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {isConfirmed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            {isAwaitingApproval && <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />}
            {isNeedsHuman && <UserCheck className="h-3.5 w-3.5 text-purple-600" />}
            {!isConfirmed && !isAwaitingApproval && !isNeedsHuman && <Clock className="h-3.5 w-3.5 text-neutral-500" />}
            {task.status.replace(/_/g, ' ')}
          </span>
          <button
            onClick={loadTask}
            className="p-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-500 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4-Step Orchestration Progress Flow */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center relative">
          {[
            { step: 1, label: 'Ingested & Routed', active: true, done: true },
            {
              step: 2,
              label: 'Agent Research',
              active: true,
              done: !['REQUESTED', 'UNDERSTANDING', 'NEEDS_INFORMATION'].includes(task.status),
            },
            {
              step: 3,
              label: 'Proposal / Authorization',
              active: !['REQUESTED', 'UNDERSTANDING', 'NEEDS_INFORMATION', 'SEARCHING'].includes(task.status),
              done: ['EXECUTING', 'VERIFYING', 'CONFIRMED', 'COMPLETED'].includes(task.status),
            },
            {
              step: 4,
              label: 'Verified Confirmation',
              active: isConfirmed,
              done: isConfirmed,
            },
          ].map((item) => (
            <div key={item.step} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  item.done
                    ? 'bg-emerald-600'
                    : item.active
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-neutral-100'
                }`}
              />
              <span className={`text-[11px] font-medium block ${item.active ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed Authoritative Digital Pass Card */}
      {isConfirmed && task.externalReferenceId && (
        <VerifiedPassCard task={task} />
      )}

      {/* Autonomous Subtask Graph Visualizer (DAG) */}
      <DAGGraphView
        rootObjective={task.intent || task.originalRequest}
        nodes={[
          {
            id: 'node-1',
            category: task.category,
            assignedAgent: task.assignedAgent || `${task.category} Specialist`,
            objective: task.intent || task.originalRequest,
            executionType: 'SEQUENTIAL',
            status: isConfirmed ? 'COMPLETED' : isAwaitingApproval ? 'RUNNING' : isNeedsHuman ? 'FAILED' : 'RUNNING',
            verificationReference: task.externalReferenceId || undefined,
            error: task.failedReason || undefined,
          },
          ...(task.category === 'dining' || task.category === 'travel'
            ? [
                {
                  id: 'node-2',
                  category: 'mobility',
                  assignedAgent: 'Mobility & Chauffeur Agent',
                  objective: 'Synchronize chauffeured transit to destination',
                  executionType: 'SEQUENTIAL' as const,
                  status: isConfirmed ? ('COMPLETED' as const) : ('PENDING' as const),
                  verificationReference: isConfirmed ? `CHAUFF-SYNC-${task.publicId}` : undefined,
                },
                {
                  id: 'node-3',
                  category: 'appointments',
                  assignedAgent: 'Calendar & Appointments Agent',
                  objective: 'Synchronize reservation to member calendar',
                  executionType: 'CONDITIONAL' as const,
                  status: isConfirmed ? ('COMPLETED' as const) : ('PENDING' as const),
                  verificationReference: isConfirmed ? `CAL-SYNC-${task.publicId}` : undefined,
                },
              ]
            : []),
        ]}
      />

      {/* Human Concierge Escalation Notice with Manual Resolution Action */}
      {isNeedsHuman && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-purple-950">Proventa Human Concierge Escalation</h2>
              <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                This request requires customized coordination or direct phone verification with our partner network. Our concierge team is actively handling this.
              </p>
              {task.failedReason && (
                <p className="text-xs text-purple-700 mt-1 font-mono bg-purple-100/50 p-2 rounded">
                  Handoff reason: {task.failedReason}
                </p>
              )}
            </div>
          </div>

          {/* Concierge Operator Manual Booking Record Form */}
          <div className="pt-4 border-t border-purple-200/80 bg-white p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 uppercase">
              <CheckCircle2 className="h-4 w-4 text-purple-700" />
              <span>Concierge Operator Desk — Record Genuine Vendor Confirmation</span>
            </div>
            <form onSubmit={handleManualConfirm} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Authentic Reference / PNR"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Partner / Venue Name"
                value={manualVendor}
                onChange={(e) => setManualVendor(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs"
              />
              <button
                type="submit"
                disabled={submittingManual || !manualRef.trim()}
                className="px-4 py-2 bg-purple-800 text-white rounded-lg text-xs font-semibold hover:bg-purple-900 transition-colors disabled:opacity-50"
              >
                {submittingManual ? 'Recording...' : 'Record Verified Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Proposal & Approval Card */}
      {isAwaitingApproval && proposedOptions.length > 0 && (
        <div className="space-y-4">
          {proposedOptions.map((opt, idx) => (
            <ApprovalActionCard
              key={idx}
              proposal={opt}
              onApprove={handleApprove}
              approving={approving}
            />
          ))}
        </div>
      )}

      {/* Tabs: Overview, Timeline, Metadata */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 border-b border-neutral-200 pb-1 text-xs">
          {(['OVERVIEW', 'TIMELINE', 'RAW'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === t ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t === 'OVERVIEW' ? 'Task Overview' : t === 'TIMELINE' ? `Audit Timeline (${events.length})` : 'Telemetry'}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Original Request Prompt</h3>
              <p className="text-sm font-medium text-neutral-800 mt-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                "{task.originalRequest}"
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-neutral-100">
              <div>
                <span className="text-neutral-400 block">Agent Handler</span>
                <strong className="text-neutral-800 font-medium">{task.assignedAgent || 'Proventa Agent'}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Priority</span>
                <strong className="text-neutral-800 font-medium">{task.priority}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Approval Required</span>
                <strong className="text-neutral-800 font-medium">{task.approvalRequired ? 'Yes' : 'Auto-authorized'}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block">Estimated Budget</span>
                <strong className="text-neutral-800 font-medium">
                  {task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : 'Standard'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TIMELINE' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Immutable Microsecond Audit Trail</h3>
            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-100 pl-6">
              {events.map((ev: any) => (
                <div key={ev.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-400 group-hover:bg-neutral-900 transition-colors ring-4 ring-white" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-neutral-900">{ev.eventType.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-neutral-400 number-mono">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{ev.message}</p>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Actor: {ev.actorRole}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'RAW' && (
          <div className="bg-neutral-900 text-neutral-100 rounded-2xl p-5 text-xs font-mono overflow-x-auto space-y-2">
            <p className="text-neutral-400 text-[11px]">// Task Telemetry & State Machine Snapshot</p>
            <pre>{JSON.stringify({ id: task.id, status: task.status, priority: task.priority, ref: task.externalReferenceId }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

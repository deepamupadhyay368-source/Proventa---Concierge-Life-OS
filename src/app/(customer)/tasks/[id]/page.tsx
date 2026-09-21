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
  FileCheck,
  RotateCcw,
  SlidersHorizontal,
  X,
  MessageSquare
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
  const [cycling, setCycling] = useState(false);
  const [userNotice, setUserNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'RAW'>('OVERVIEW');

  // Recommendation cycle & selection state
  const [selectedKeptIds, setSelectedKeptIds] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyPrompt, setModifyPrompt] = useState('');

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
    setUserNotice('Authorizing your selection and executing...');
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
      setUserNotice(null);
    }
  };

  const handleRejectAll = async (feedback?: string) => {
    setCycling(true);
    setShowRejectModal(false);
    setUserNotice("No problem. I'll find you 5 different options.");
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT_ALL',
          feedback: feedback || feedbackReason || undefined,
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        setSelectedKeptIds([]);
        setFeedbackReason('');
      }
    } catch (err) {
      console.error('Failed to cycle options', err);
    } finally {
      setCycling(false);
      setTimeout(() => setUserNotice(null), 4000);
    }
  };

  const handleReplaceOption = async (optionId: string) => {
    setCycling(true);
    setUserNotice('Curating a fresh alternative for this option...');
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPLACE_OPTION',
          replaceOptionId: optionId,
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        setSelectedKeptIds((prev) => prev.filter((id) => id !== optionId));
      }
    } catch (err) {
      console.error('Failed to replace option', err);
    } finally {
      setCycling(false);
      setTimeout(() => setUserNotice(null), 4000);
    }
  };

  const handlePartialReject = async () => {
    if (selectedKeptIds.length === 0) return;
    setCycling(true);
    setUserNotice(`Retaining ${selectedKeptIds.length} preferred option(s) and refreshing the others...`);
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PARTIAL_REJECT',
          keptOptionIds: selectedKeptIds,
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        setSelectedKeptIds([]);
      }
    } catch (err) {
      console.error('Failed partial rejection', err);
    } finally {
      setCycling(false);
      setTimeout(() => setUserNotice(null), 4000);
    }
  };

  const handleModifyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyPrompt.trim()) return;
    setCycling(true);
    setShowModifyModal(false);
    setUserNotice('Updating your preferences and sourcing 5 new tailored options...');
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MODIFY_REQUEST',
          newRawInput: modifyPrompt.trim(),
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        setModifyPrompt('');
        setSelectedKeptIds([]);
      }
    } catch (err) {
      console.error('Failed to modify request', err);
    } finally {
      setCycling(false);
      setTimeout(() => setUserNotice(null), 4000);
    }
  };

  const handleAskConcierge = async () => {
    setCycling(true);
    setUserNotice('Transferring to your Senior Concierge for bespoke private sourcing...');
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASK_CONCIERGE' }),
      });
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
      }
    } catch (err) {
      console.error('Failed to escalate to concierge', err);
    } finally {
      setCycling(false);
      setTimeout(() => setUserNotice(null), 4000);
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
  const isAwaitingApproval = task.status === 'AWAITING_APPROVAL' || task.status === 'OPTIONS_READY';
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
            status: isConfirmed ? 'COMPLETED' : (task.status === 'FAILED' || task.status === 'CANCELLED') ? 'FAILED' : 'RUNNING',
            verificationReference: task.externalReferenceId || undefined,
            error: task.status === 'FAILED' ? task.failedReason || undefined : undefined,
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
              <h2 className="text-sm font-semibold text-purple-950">Proventa Concierge Execution</h2>
              <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                Your request is approved and has been handed to your Proventa Concierge for execution.
              </p>
              {task.failedReason && (
                <p className="text-xs text-purple-700 mt-1 font-mono bg-purple-100/50 p-2 rounded">
                  Coordination Note: {task.failedReason}
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

      {/* Real-time Reassuring Recommendation Notice */}
      {userNotice && (
        <div className="bg-[#141312] text-[#faf8f5] rounded-2xl p-4 border border-[#8a7053]/40 shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-[#8a7053] animate-spin" />
            <span className="text-xs font-medium tracking-wide">{userNotice}</span>
          </div>
          <button
            onClick={() => setUserNotice(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-md text-xs"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Proposal & Approval Section */}
      {isAwaitingApproval && proposedOptions.length > 0 && (() => {
        const clientPrefs = typeof task.clientPreferences === 'string'
          ? (() => { try { return JSON.parse(task.clientPreferences); } catch { return {}; } })()
          : (task.clientPreferences || {});
        const currentBatchId = clientPrefs.currentBatchId || 'BATCH-001';
        const batchNum = clientPrefs.batchHistory?.length || 1;

        return (
          <div className="space-y-4">
            {/* Recommendation Batch Header & Multi-Action Control Bar */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#141312] text-[#e8dfd5] font-mono tracking-wider">
                      {currentBatchId}
                    </span>
                    <span className="text-xs font-semibold text-neutral-900">
                      Recommendation Cycle {batchNum}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">
                      {proposedOptions.length} curated option{proposedOptions.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    Select an option to approve and execute immediately, or request new alternatives below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={cycling || approving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                    <span>Reject All & Show 5 New Options</span>
                  </button>

                  {selectedKeptIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handlePartialReject}
                      disabled={cycling || approving}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Keep ({selectedKeptIds.length}) & Replace Others</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowModifyModal(true)}
                    disabled={cycling || approving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Modify Criteria</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAskConcierge}
                    disabled={cycling || approving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-purple-700" />
                    <span>Ask Concierge</span>
                  </button>
                </div>
              </div>

              {selectedKeptIds.length > 0 ? (
                <div className="text-xs text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-xl px-3.5 py-2 flex items-center justify-between">
                  <span>
                    <strong>{selectedKeptIds.length}</strong> option{selectedKeptIds.length === 1 ? '' : 's'} locked. Clicking &ldquo;Keep &amp; Replace Others&rdquo; will replace only unselected options.
                  </span>
                  <button
                    onClick={() => setSelectedKeptIds([])}
                    className="text-amber-900 font-semibold underline text-[11px]"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-[#8a7053]" />
                  <span>Tip: You can replace any single option directly, or select options to keep while replacing the rest.</span>
                </div>
              )}
            </div>

            {/* Render Candidates */}
            <div className="space-y-4">
              {proposedOptions.map((opt, idx) => (
                <ApprovalActionCard
                  key={opt.id || idx}
                  proposal={opt}
                  optionNumber={idx + 1}
                  isSelected={selectedKeptIds.includes(opt.id)}
                  onToggleSelect={(id) =>
                    setSelectedKeptIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    )
                  }
                  onReplace={(id) => handleReplaceOption(id)}
                  onApprove={handleApprove}
                  onDecline={() => setShowRejectModal(true)}
                  approving={approving || cycling}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Reject All & Cycle Options Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Request 5 Fresh Alternatives</h3>
                <p className="text-xs text-neutral-500">Provide quick guidance so we can tailor the next batch</p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-2">Quick Preference Refinements</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Too expensive',
                    'Not luxurious enough',
                    'Show something more private',
                    'Earlier timing',
                    'Later timing',
                    'Different airline / provider',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleRejectAll(chip)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 rounded-lg text-xs font-medium transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Or provide specific feedback (optional):</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Prefer direct nonstop flights before 10 AM, or prefer an outdoor courtyard table..."
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectAll()}
                  disabled={cycling}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {cycling ? 'Curating Options...' : 'Curate 5 New Options'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Request Criteria Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Modify Request Criteria</h3>
                <p className="text-xs text-neutral-500">Update your itinerary, dates, or party details</p>
              </div>
              <button
                onClick={() => setShowModifyModal(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleModifyRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Updated Request Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Flight from Ahmedabad to Delhi for 3 passengers next Friday morning, business class preferred..."
                  value={modifyPrompt}
                  onChange={(e) => setModifyPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cycling || !modifyPrompt.trim()}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {cycling ? 'Updating...' : 'Save & Curate 5 New Options'}
                </button>
              </div>
            </form>
          </div>
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

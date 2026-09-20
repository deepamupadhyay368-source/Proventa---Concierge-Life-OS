'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  PlusCircle,
  FileText,
  ShieldCheck,
  Building,
  DollarSign,
  ArrowRight,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';

interface ConciergeOperatorWorkspaceProps {
  task: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function ConciergeOperatorWorkspace({
  task,
  onClose,
  onRefresh,
}: ConciergeOperatorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTIONS' | 'TIMELINE'>('ACTIONS');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [noteText, setNoteText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [newPriority, setNewPriority] = useState(task.priority || 'NORMAL');
  const [providerRef, setProviderRef] = useState(task.externalReferenceId || '');
  const [providerVendor, setProviderVendor] = useState(task.vendorName || '');
  const [providerNotes, setProviderNotes] = useState('');
  
  // Proposal state
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalProvider, setProposalProvider] = useState('');
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');

  // Clarification / Message state
  const [messageText, setMessageText] = useState('');

  const executeAction = async (action: string, payload: Record<string, any> = {}) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    // Zero fabrication client-side guard
    if (action === 'CONFIRM') {
      const ref = (payload.externalReference || providerRef || '').trim().toUpperCase();
      if (!ref) {
        setActionError('Genuine external provider reference is mandatory to confirm a booking.');
        setActionLoading(false);
        return;
      }
      if (
        ref.startsWith('PV-') ||
        ref.startsWith('PV-AMD-') ||
        ref.startsWith('MOCK-') ||
        ref.startsWith('DEMO-') ||
        ref.startsWith('TEST-') ||
        ref.startsWith('FAKE-') ||
        ref.includes('SANDBOX') ||
        ['NONE', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'TEST', 'MOCK', 'FAKE', 'SIMULATED'].includes(ref)
      ) {
        setActionError('Synthetic, simulated, or mock references (e.g. PV-*, MOCK-*, TEST-*) are strictly prohibited by Proventa zero-fabrication policy. Enter the authentic reference from the airline, hotel, or venue.');
        setActionLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          action,
          notes: payload.notes || undefined,
          priority: payload.priority || undefined,
          metadata: payload.metadata || undefined,
          externalReference: payload.externalReference || undefined,
          message: payload.message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Action failed.');
      }

      setActionSuccess(`Action ${action} successfully executed.`);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'An error occurred while executing operator action.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-[#12100e] border-l border-[#26211b] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#23201c] flex items-center justify-between bg-[#161311]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[#c8b99d]">#{task.publicId}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#26211b] text-[#a8a49c] border border-[#383127]">
                {task.category}
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                task.status === 'CONFIRMED' || task.status === 'COMPLETED'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                  : task.status === 'NEEDS_HUMAN' || task.isEscalated
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                  : task.status === 'AWAITING_APPROVAL'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'bg-[#26211b] text-[#c8b99d] border border-[#3e352b]'
              }`}>
                {task.status}
              </span>
              {task.executionTier && (
                <span
                  title={task.executionReason || undefined}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                    task.executionTier === 'AUTOMATED'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                      : task.executionTier === 'ASSISTED'
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                  }`}
                >
                  {task.executionTier}
                </span>
              )}
            </div>
            <h2 className="text-base font-serif font-medium text-[#f5f3ef] line-clamp-1">{task.intent || task.originalRequest}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#736f68] hover:text-[#f5f3ef] hover:bg-[#201c18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center border-b border-[#23201c] bg-[#141210] px-6 text-xs font-mono">
          {[
            { id: 'ACTIONS', label: 'Operator Actions' },
            { id: 'OVERVIEW', label: 'Member & Context' },
            { id: 'TIMELINE', label: 'Event History' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 border-b-2 font-medium transition-all ${
                activeTab === t.id
                  ? 'border-[#c8b99d] text-[#f5f3ef] bg-[#1a1714]'
                  : 'border-transparent text-[#736f68] hover:text-[#a8a49c]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Notification alerts */}
        {actionError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">{actionError}</div>
          </div>
        )}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1">{actionSuccess}</div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: ACTIONS */}
          {activeTab === 'ACTIONS' && (
            <div className="space-y-6">
              {/* Execution Tier & Routing Context Header */}
              <div className="p-3.5 rounded-xl bg-[#161412] border border-[#26211b] flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold border ${
                    task.executionTier === 'AUTOMATED'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                      : task.executionTier === 'ASSISTED'
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/60'
                      : 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                  }`}>
                    {task.executionTier || 'HUMAN'} MODE
                  </span>
                  <span className="text-[#a8a49c] line-clamp-1">
                    {task.executionReason || 'Concierge execution requested.'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('OVERVIEW')}
                  className="text-[11px] text-[#c8b99d] hover:text-[#f5f3ef] underline whitespace-nowrap shrink-0"
                >
                  View Prepared Context &rarr;
                </button>
              </div>

              {/* Primary Quick Actions Bar */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <span className="text-[11px] font-mono text-[#858077] uppercase tracking-wider block font-semibold">
                  Queue Lifecycle Controls
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => executeAction('CLAIM')}
                    disabled={actionLoading}
                    className="p-2.5 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Take Ownership</span>
                  </button>

                  <button
                    onClick={() => executeAction('AWAITING_PROVIDER', { notes: 'Awaiting provider confirmation callback.' })}
                    disabled={actionLoading}
                    className="p-2.5 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Wait Provider</span>
                  </button>

                  <button
                    onClick={() => executeAction('READY_TO_EXECUTE')}
                    disabled={actionLoading}
                    className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/40 text-xs font-mono text-blue-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ready Execute</span>
                  </button>

                  <button
                    onClick={() => executeAction('ESCALATE', { notes: 'Lead concierge intervention required.' })}
                    disabled={actionLoading}
                    className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/40 text-xs font-mono text-purple-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Escalate</span>
                  </button>
                </div>
              </div>

              {/* ACTION: Confirm with Genuine External Reference (Zero Fabrication) */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-semibold text-[#f5f3ef]">
                      Authoritative Provider Confirmation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#858077] uppercase bg-[#141210] px-2 py-0.5 rounded border border-[#26211b]">
                    Zero Fabrication Enforced
                  </span>
                </div>
                <p className="text-xs text-[#858077]">
                  Enter the genuine confirmation reference issued by the airline, hotel, restaurant maître d', or merchant.
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Authentic Provider Confirmation Ref *</label>
                    <input
                      type="text"
                      value={providerRef}
                      onChange={(e) => setProviderRef(e.target.value)}
                      placeholder="e.g. 6E-Z7K8PQ, 098-2412891240, AGS-TABLE-14"
                      className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f3ef] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Vendor / Partner Name</label>
                      <input
                        type="text"
                        value={providerVendor}
                        onChange={(e) => setProviderVendor(e.target.value)}
                        placeholder="e.g. Agashiye / IndiGo / Taj"
                        className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f3ef] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Execution Notes</label>
                      <input
                        type="text"
                        value={providerNotes}
                        onChange={(e) => setProviderNotes(e.target.value)}
                        placeholder="Table held under Proventa VIP desk"
                        className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f3ef] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        executeAction('CONFIRM', {
                          externalReference: providerRef,
                          metadata: { vendorName: providerVendor },
                          notes: providerNotes,
                        })
                      }
                      disabled={actionLoading || !providerRef.trim()}
                      className="flex-1 py-2 px-4 rounded-lg bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-xs font-mono text-emerald-300 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Record Execution &amp; Confirm Booking</span>
                    </button>

                    <button
                      onClick={() => executeAction('COMPLETE', { notes: 'Order fulfilled.' })}
                      disabled={actionLoading}
                      className="py-2 px-4 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION: Propose Option & Request Customer Approval */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <span className="text-xs font-mono font-semibold text-[#f5f3ef] block">
                  Propose Curated Option / Quote
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Option Title *</label>
                    <input
                      type="text"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                      placeholder="e.g. VIP Chef Table at Agashiye"
                      className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f3ef] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Price (INR)</label>
                    <input
                      type="number"
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg px-3 py-2 text-xs font-mono text-[#f5f3ef] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#736f68] block mb-1">Description &amp; Arrangements</label>
                  <textarea
                    rows={2}
                    value={proposalDesc}
                    onChange={(e) => setProposalDesc(e.target.value)}
                    placeholder="Bespoke arrangement details and verified availability..."
                    className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg p-2.5 text-xs text-[#f5f3ef] outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      executeAction('ADD_PROPOSAL', {
                        proposal: {
                          title: proposalTitle,
                          providerName: proposalProvider || 'Curated Partner',
                          priceAmount: parseInt(proposalPrice) || 0,
                          description: proposalDesc,
                        },
                      })
                    }
                    disabled={actionLoading || !proposalTitle.trim()}
                    className="py-2 px-3.5 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors disabled:opacity-50"
                  >
                    Add Option
                  </button>
                  <button
                    onClick={() => executeAction('REQUEST_APPROVAL', { notes: 'Submitted for member approval.' })}
                    disabled={actionLoading}
                    className="py-2 px-3.5 rounded-lg bg-amber-950/50 border border-amber-800/50 hover:bg-amber-900/50 text-xs font-mono text-amber-300 transition-colors disabled:opacity-50"
                  >
                    Request Member Approval
                  </button>
                </div>
              </div>

              {/* ACTION: Clarification & Member Communications */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <span className="text-xs font-mono font-semibold text-[#f5f3ef] block">
                  Member Clarification &amp; Notes
                </span>
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Request details from member or enter operator note..."
                  className="w-full bg-[#100e0c] border border-[#2a241e] focus:border-[#c8b99d] rounded-lg p-2.5 text-xs text-[#f5f3ef] outline-none resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executeAction('REQUEST_CUSTOMER_INFO', { notes: messageText })}
                    disabled={actionLoading || !messageText.trim()}
                    className="py-2 px-3.5 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Request Details</span>
                  </button>
                  <button
                    onClick={() => executeAction('ADD_NOTE', { notes: messageText })}
                    disabled={actionLoading || !messageText.trim()}
                    className="py-2 px-3.5 rounded-lg bg-[#221e1a] border border-[#383127] hover:bg-[#2b2520] text-xs font-mono text-[#c8b99d] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                  <button
                    onClick={() => executeAction('ADD_INTERNAL_NOTE', { notes: messageText })}
                    disabled={actionLoading || !messageText.trim()}
                    className="py-2 px-3.5 rounded-lg bg-[#141210] border border-[#2a241e] hover:bg-[#1a1714] text-xs font-mono text-[#858077] transition-colors disabled:opacity-50"
                  >
                    Internal Only
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* PREPARED CONTEXT CARD (Phase 8.1 - Client Execution Independence) */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#2a241d] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-semibold text-[#f5f3ef]">
                      Execution Tier &amp; Prepared Context
                    </span>
                  </div>
                  {task.executionTier && (
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded font-bold border ${
                        task.executionTier === 'AUTOMATED'
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                          : task.executionTier === 'ASSISTED'
                          ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/60'
                          : 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                      }`}
                    >
                      {task.executionTier} MODE
                    </span>
                  )}
                </div>

                {task.executionReason && (
                  <div className="p-2.5 rounded-lg bg-[#0e0d0c] border border-[#23201c] text-xs font-mono text-[#a8a49c]">
                    <span className="text-[#6e695f] uppercase text-[10px] block font-semibold mb-0.5">Routing Rationale</span>
                    {task.executionReason}
                  </div>
                )}

                {task.preparedContext && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                    {task.preparedContext.dates && (
                      <div className="p-2.5 rounded-lg bg-[#141210] border border-[#23201c]">
                        <span className="text-[#6e695f] text-[10px] uppercase block">Dates / Timing</span>
                        <span className="text-[#f5f3ef] font-medium">{task.preparedContext.dates}</span>
                      </div>
                    )}
                    {task.preparedContext.partySize && (
                      <div className="p-2.5 rounded-lg bg-[#141210] border border-[#23201c]">
                        <span className="text-[#6e695f] text-[10px] uppercase block">Party Size / Guests</span>
                        <span className="text-[#f5f3ef] font-medium">{task.preparedContext.partySize} guests</span>
                      </div>
                    )}
                    {task.preparedContext.location && (
                      <div className="p-2.5 rounded-lg bg-[#141210] border border-[#23201c]">
                        <span className="text-[#6e695f] text-[10px] uppercase block">Location / Route</span>
                        <span className="text-[#f5f3ef] font-medium">{task.preparedContext.location}</span>
                      </div>
                    )}
                    {task.preparedContext.budget && (
                      <div className="p-2.5 rounded-lg bg-[#141210] border border-[#23201c]">
                        <span className="text-[#6e695f] text-[10px] uppercase block">Budget Target</span>
                        <span className="text-[#c8b99d] font-medium">{String(task.preparedContext.budget)}</span>
                      </div>
                    )}
                    {task.preparedContext.proposedOptionsCount !== undefined && task.preparedContext.proposedOptionsCount > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#141210] border border-[#23201c]">
                        <span className="text-[#6e695f] text-[10px] uppercase block">AI Draft Options</span>
                        <span className="text-cyan-400 font-medium">{task.preparedContext.proposedOptionsCount} options</span>
                      </div>
                    )}
                  </div>
                )}

                {task.preparedContext?.aiResearchNotes && (
                  <div className="p-3 rounded-lg bg-[#141210] border border-[#23201c] text-xs text-[#c8b99d] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#736f68] block">Specialist &amp; Research Intelligence</span>
                    <p className="leading-relaxed">{task.preparedContext.aiResearchNotes}</p>
                  </div>
                )}
              </div>

              {/* Member Card */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <span className="text-[11px] font-mono text-[#858077] uppercase tracking-wider block font-semibold">
                  Member Profile
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Name</span>
                    <span className="text-[#f5f3ef] font-medium">{task.customerName || 'VIP Member'}</span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Contact Phone</span>
                    <span className="text-[#c8b99d]">{task.customerPhone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Email</span>
                    <span className="text-[#a8a49c]">{task.customerEmail || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Assigned Operator</span>
                    <span className="text-[#c8b99d]">{task.assignedOperator || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Request Context */}
              <div className="p-4 rounded-xl bg-[#181512] border border-[#26211b] space-y-3">
                <span className="text-[11px] font-mono text-[#858077] uppercase tracking-wider block font-semibold">
                  Original Customer Mandate
                </span>
                <div className="p-3 rounded-lg bg-[#0e0d0c] border border-[#23201c] text-xs text-[#f5f3ef] leading-relaxed">
                  "{task.originalRequest}"
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Target Date</span>
                    <span className="text-[#f5f3ef]">{new Date(task.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Budget / Paired Amount</span>
                    <span className="text-[#c8b99d]">
                      {task.budgetAmount ? `₹${task.budgetAmount.toLocaleString('en-IN')}` : 'Flexible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Execution Mode</span>
                    <span className="text-[#f5f3ef]">{task.executionMethod || 'HUMAN_CONCIERGE'}</span>
                  </div>
                  <div>
                    <span className="text-[#524e47] block text-[10px] uppercase">Provider Ref</span>
                    <span className="text-emerald-400 font-bold">{task.externalReferenceId || 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <span className="text-[11px] font-mono text-[#858077] uppercase tracking-wider block font-semibold">
                Audit Timeline &amp; Operator Actions
              </span>
              <div className="relative pl-6 border-l border-[#26211b] space-y-5">
                {task.events?.map((e: any) => (
                  <div key={e.id} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-[#3d342a] border-2 border-[#12100e]" />
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#736f68]">
                      <span className="text-[#a8a49c] font-semibold">{e.eventType}</span>
                      <span>{new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-[#f5f3ef]">{e.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

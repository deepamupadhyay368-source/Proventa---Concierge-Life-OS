'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  MessageSquare,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  ChevronRight,
  Copy,
  RefreshCw,
  Building,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';

export default function TaskWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const taskId = params.id as string;

  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
  }, []);

  // Modals & Panels
  const [activeTab, setActiveTab] = useState<'workspace' | 'notes' | 'comms' | 'copilot' | 'timeline'>('workspace');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [reqInfoModalOpen, setReqInfoModalOpen] = useState(false);
  const [sendMsgModalOpen, setSendMsgModalOpen] = useState(false);
  const [logContactModalOpen, setLogContactModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  // Forms
  const [newNote, setNewNote] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [infoQuestion, setInfoQuestion] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

  // Provider Confirmation Form
  const [confirmationRef, setConfirmationRef] = useState('');
  const [hostName, setHostName] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [confirmationNotes, setConfirmationNotes] = useState('');

  // Provider Contact Log Form
  const [personContacted, setPersonContacted] = useState('');
  const [contactMethod, setContactMethod] = useState('PHONE');
  const [providerResponse, setProviderResponse] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');

  // Copilot State
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState<string | null>(null);

  const userRoles: string[] = currentUser?.roles || [];

  async function loadWorkspace() {
    try {
      setLoading(true);
      const res = await fetch(`/api/concierge/tasks/${taskId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load task workspace');
      }
      const data = await res.json();
      setWorkspace(data.workspace);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (taskId) loadWorkspace();
  }, [taskId]);

  async function handleAction(action: string, payload: any = {}) {
    try {
      setActionLoading(true);
      const res = await fetch('/api/concierge/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, taskId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Failed to execute ${action}`);
        return false;
      }
      await loadWorkspace();
      return true;
    } catch (e) {
      alert('Network error during operation');
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function runCopilot(action: string, parameters?: any) {
    try {
      setCopilotLoading(true);
      setActiveTab('copilot');
      const res = await fetch('/api/concierge/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          taskId,
          parameters: parameters || {
            venueName: workspace?.providerContact?.name || workspace?.brief?.approvedOptionTitle,
            partySize: workspace?.brief?.partySize,
            targetTime: workspace?.brief?.targetDateTime,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCopilotResult(data.result);
      } else {
        alert(data.error || 'Copilot query failed');
      }
    } catch (e) {
      alert('Copilot network error');
    } finally {
      setCopilotLoading(false);
    }
  }

  if (loading && !workspace) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
        <div className="text-sm font-medium text-neutral-300">Loading Human Concierge Workspace...</div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <div className="text-base font-bold text-white">Workspace Error</div>
        <p className="text-xs text-neutral-400">{error || 'Task not found'}</p>
        <Link
          href="/concierge/tasks"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Queue</span>
        </Link>
      </div>
    );
  }

  const { customer, brief, providerContact, approvalHistory, internalNotes, events, communications } = workspace;
  const isClaimedByMe = workspace.assignedOperator === (currentUser?.name || currentUser?.email);
  const isUnassigned = !workspace.assignedOperator;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Task Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800/90 p-5 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              href="/concierge/tasks"
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-mono text-sm font-bold text-white">{workspace.publicId}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs font-medium text-amber-400">{workspace.category}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                workspace.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : workspace.status === 'EXECUTING'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : workspace.status === 'NEEDS_INFORMATION'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
              }`}
            >
              {workspace.status}
            </span>
            {workspace.isEscalated && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                ESCALATED
              </span>
            )}
          </div>
          <h1 className="text-lg lg:text-xl font-bold text-white">{workspace.originalRequest}</h1>
        </div>

        {/* Action Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isUnassigned ? (
            <button
              onClick={() => handleAction('CLAIM')}
              disabled={actionLoading}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all"
            >
              Claim Task
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-neutral-500">Operator:</span>
              <span className="font-semibold text-neutral-200">{workspace.assignedOperator}</span>
              {isClaimedByMe && <span className="text-[10px] font-mono text-emerald-400">(You)</span>}
            </div>
          )}

          {workspace.status === 'APPROVED' && (
            <button
              onClick={() => handleAction('START_WORK')}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              Start Execution
            </button>
          )}

          <button
            onClick={() => setConfirmModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Confirm Provider Booking</span>
          </button>

          <button
            onClick={() => setEscalateModalOpen(true)}
            className="px-3 py-2 bg-neutral-800 hover:bg-rose-950/50 hover:text-rose-300 text-neutral-400 text-xs font-medium border border-neutral-700 rounded-lg transition-colors"
          >
            Escalate
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) - Operational Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'workspace'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Execution Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>Internal Notes ({internalNotes?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('comms')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'comms'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>Member Comms ({communications?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'copilot'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>AI Copilot</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Audit Timeline
            </button>
          </div>

          {/* TAB 1: WORKSPACE / EXECUTION OVERVIEW */}
          {activeTab === 'workspace' && (
            <div className="space-y-6">
              {/* Approved Option Card (Target of Execution) */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <h3 className="text-sm font-semibold text-white">Customer-Approved Target Option</h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Execution Mandate
                  </span>
                </div>

                {approvalHistory?.approvedOption ? (
                  <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-bold text-neutral-100">
                          {approvalHistory.approvedOption.title || approvalHistory.approvedOption.name}
                        </div>
                        <div className="text-xs text-amber-400 font-medium mt-0.5">
                          Provider: {approvalHistory.approvedOption.provider || 'Curated Partner'}
                        </div>
                      </div>
                      {approvalHistory.approvedOption.price && (
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-white">
                            ₹{approvalHistory.approvedOption.price}
                          </div>
                          <div className="text-[10px] text-neutral-500">Approved budget</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {approvalHistory.approvedOption.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-950/40 rounded-xl text-xs text-neutral-400">
                    Task is in intake/research phase. No specific option approved yet. Proceed with standard intake protocols.
                  </div>
                )}

                {/* Quick Action Button Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => setLogContactModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-amber-400" />
                    <span>Log Provider Call</span>
                  </button>
                  <button
                    onClick={() => handleAction('AWAITING_PROVIDER')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Mark Awaiting Desk</span>
                  </button>
                  <button
                    onClick={() => setReqInfoModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                  >
                    <Info className="h-3.5 w-3.5 text-amber-400" />
                    <span>Request Member Info</span>
                  </button>
                  <button
                    onClick={() => setSendMsgModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Message Member</span>
                  </button>
                </div>
              </div>

              {/* Pre-Call Brief & Context */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>AI Pre-Call Concierge Brief</span>
                  </h3>
                  <button
                    onClick={() => runCopilot('SUMMARIZE_TASK')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Re-Analyze
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1">
                    <div className="text-neutral-500 font-mono text-[10px] uppercase">Reason for Human Desk</div>
                    <div className="text-neutral-200 font-medium">{brief?.handoffReason || 'Direct venue verification required'}</div>
                  </div>
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80 space-y-1">
                    <div className="text-neutral-500 font-mono text-[10px] uppercase">Recommended Action</div>
                    <div className="text-neutral-200 font-medium">{brief?.recommendedNextAction || 'Call provider reservations'}</div>
                  </div>
                </div>

                {brief?.callScriptDraft && (
                  <div className="p-4 bg-neutral-950/80 rounded-xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-amber-300">Suggested Phone Call Script</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(brief.callScriptDraft);
                          alert('Script copied to clipboard');
                        }}
                        className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {brief.callScriptDraft}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Staff-Only Internal Notes</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Strictly private to Proventa concierge employees. Never shown to member.</p>
                </div>
              </div>

              {/* Add note form */}
              <div className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record provider desk notes, call outcomes, special arrangements, or shift handover context..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 min-h-[80px]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!newNote.trim()) return;
                      const ok = await handleAction('ADD_INTERNAL_NOTE', { note: newNote });
                      if (ok) setNewNote('');
                    }}
                    disabled={!newNote.trim() || actionLoading}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              <div className="space-y-3">
                {(internalNotes || []).map((note: any) => (
                  <div key={note.id} className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-amber-300">{note.author}</span>
                      <span className="text-neutral-500 font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBER COMMUNICATIONS */}
          {activeTab === 'comms' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span>Member Communication Feed</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Direct notifications and messages sent to {customer.name}</p>
                </div>
                <button
                  onClick={() => setSendMsgModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </div>

              <div className="space-y-3">
                {(communications || []).length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">No member communications sent yet.</div>
                ) : (
                  communications.map((comm: any) => (
                    <div key={comm.id} className="p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-neutral-200">
                          {comm.channel === 'WHATSAPP' ? '📱 WhatsApp' : '✉️ Email / App Notice'}
                        </span>
                        <span className="text-neutral-500 font-mono">{new Date(comm.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-neutral-300">{comm.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI COPILOT */}
          {activeTab === 'copilot' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Proventa AI Copilot for Human Operators</span>
                </h3>
                <p className="text-xs text-neutral-400">Instant assistance for call scripts, dietary constraints, and member messaging</p>
              </div>

              {/* 1-Click Quick Copilot Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => runCopilot('DRAFT_CALL_SCRIPT')}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-left text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-400 mb-1.5" />
                  <div className="font-semibold">Draft Call Script</div>
                  <div className="text-[10px] text-neutral-500">Venue phone script</div>
                </button>
                <button
                  onClick={() => runCopilot('CHECK_CONSTRAINTS')}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-left text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 mb-1.5" />
                  <div className="font-semibold">Check Constraints</div>
                  <div className="text-[10px] text-neutral-500">Dietary & timing rules</div>
                </button>
                <button
                  onClick={() => runCopilot('DRAFT_CUSTOMER_MESSAGE')}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-left text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-blue-400 mb-1.5" />
                  <div className="font-semibold">Draft Member Text</div>
                  <div className="text-[10px] text-neutral-500">Executive update</div>
                </button>
                <button
                  onClick={() => runCopilot('DRAFT_PROVIDER_EMAIL')}
                  className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl text-left text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-purple-400 mb-1.5" />
                  <div className="font-semibold">Draft Booking Email</div>
                  <div className="text-[10px] text-neutral-500">Formal provider email</div>
                </button>
              </div>

              {/* Copilot Result Box */}
              {copilotLoading ? (
                <div className="p-8 text-center space-y-2 bg-neutral-950 rounded-xl border border-neutral-800">
                  <RefreshCw className="h-5 w-5 animate-spin text-amber-400 mx-auto" />
                  <div className="text-xs text-neutral-400">Generating operator intelligence...</div>
                </div>
              ) : copilotResult ? (
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">Generated Copilot Response</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(copilotResult);
                        alert('Copied to clipboard');
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">{copilotResult}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 5: AUDIT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Full Event & Audit Trail</h3>
              <div className="space-y-3">
                {(events || []).map((event: any) => (
                  <div key={event.id} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-amber-400 font-semibold">{event.eventType}</span>
                      <span className="text-neutral-500 font-mono">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-neutral-300">{event.description}</div>
                    {event.agentRole && <div className="text-[10px] text-neutral-500 font-mono">Role: {event.agentRole}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide) - Context Cards */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Private Client Profile</h3>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                {customer.membershipTier || 'Private Client'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-base font-bold text-white">{customer.name}</div>
                <div className="text-neutral-400 text-[11px]">{customer.city || 'Ahmedabad, India'}</div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Phone:</span>
                  <span className="font-mono text-neutral-200">{customer.phone || 'Not on file'}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Email:</span>
                  <span className="text-neutral-200">{customer.email}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Active Tasks:</span>
                  <span className="font-mono text-neutral-200">{customer.activeTasksCount || 1}</span>
                </div>
              </div>

              {customer.preferences && Object.keys(customer.preferences).length > 0 && (
                <div className="pt-2 border-t border-neutral-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-neutral-500">Member Preferences</div>
                  <pre className="text-[11px] bg-neutral-950 p-2 rounded-lg text-neutral-300 font-sans whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(customer.preferences, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Provider Contact Card */}
          {providerContact && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Provider Contact Desk</h3>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded">
                  {providerContact.bookingMethod}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-sm font-bold text-white">{providerContact.name}</div>
                  {providerContact.venueName && <div className="text-neutral-400">{providerContact.venueName}</div>}
                  {providerContact.address && <div className="text-neutral-500 text-[11px] mt-0.5">{providerContact.address}</div>}
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  {providerContact.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Direct Phone:</span>
                      <a
                        href={`tel:${providerContact.phone}`}
                        className="font-mono text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{providerContact.phone}</span>
                      </a>
                    </div>
                  )}
                  {providerContact.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Email:</span>
                      <a href={`mailto:${providerContact.email}`} className="text-cyan-300 hover:underline">
                        {providerContact.email}
                      </a>
                    </div>
                  )}
                  {providerContact.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Website:</span>
                      <a
                        href={providerContact.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-300 hover:text-white flex items-center gap-1"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {providerContact.notes && (
                  <div className="p-2.5 bg-neutral-950 rounded-lg text-[11px] text-neutral-400">
                    {providerContact.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CONFIRM GENUINE PROVIDER BOOKING */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Confirm Genuine Provider Booking</span>
              </div>
              <button onClick={() => setConfirmModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
              <strong>Zero-Fabrication Mandate:</strong> Enter the genuine reference code and host name provided directly by the venue/service provider. Synthetic or mock references are rejected.
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Provider Confirmation Reference / PNR *</label>
                <input
                  type="text"
                  placeholder="e.g. AG-RES-88219 or 6E-P89X1"
                  value={confirmationRef}
                  onChange={(e) => setConfirmationRef(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Host / Reservations Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram (Front Desk Manager)"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Final Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Special Notes & Confirmation Details</label>
                <textarea
                  placeholder="Table details, deposit confirmation, or special instructions..."
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-500/50 min-h-[60px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!confirmationRef.trim()) {
                    alert('Please enter a valid provider reference');
                    return;
                  }
                  const ok = await handleAction('CONFIRM', {
                    confirmationReference: confirmationRef.trim(),
                    hostName: hostName.trim(),
                    amount: finalAmount ? Number(finalAmount) : undefined,
                    notes: confirmationNotes.trim(),
                  });
                  if (ok) setConfirmModalOpen(false);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {actionLoading ? 'Verifying...' : 'Submit Real Confirmation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG PROVIDER CALL */}
      {logContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Phone className="h-5 w-5 text-amber-400" />
                <span>Log Provider Contact Record</span>
              </div>
              <button onClick={() => setLogContactModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Contact Method</label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                >
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email Inquiry</option>
                  <option value="WHATSAPP">WhatsApp Desk</option>
                  <option value="PORTAL">Provider Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Person / Host Contacted</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh (F&B Desk)"
                  value={personContacted}
                  onChange={(e) => setPersonContacted(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">Provider Desk Response / Status *</label>
                <textarea
                  placeholder="Availability confirmed for requested date, awaiting credit card authorization form..."
                  value={providerResponse}
                  onChange={(e) => setProviderResponse(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 min-h-[70px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setLogContactModalOpen(false)} className="px-4 py-2 text-xs text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!providerResponse.trim()) {
                    alert('Please enter the provider response');
                    return;
                  }
                  const ok = await handleAction('CONTACT_PROVIDER', {
                    contactMethod,
                    personContacted,
                    providerResponse,
                  });
                  if (ok) setLogContactModalOpen(false);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors"
              >
                Save Contact Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUEST CUSTOMER INFO */}
      {reqInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Info className="h-5 w-5 text-amber-400" />
                <span>Request Information from Member</span>
              </div>
              <button onClick={() => setReqInfoModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Question / Clarification Required *</label>
                <textarea
                  placeholder="e.g. Could you kindly confirm whether indoor AC seating or rooftop terrace is preferred for your table?"
                  value={infoQuestion}
                  onChange={(e) => setInfoQuestion(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 min-h-[90px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setReqInfoModalOpen(false)} className="px-4 py-2 text-xs text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!infoQuestion.trim()) return;
                  const ok = await handleAction('REQUEST_CUSTOMER_INFO', { question: infoQuestion });
                  if (ok) setReqInfoModalOpen(false);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors"
              >
                Send Request to Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND DIRECT CUSTOMER MESSAGE */}
      {sendMsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Send className="h-5 w-5 text-emerald-400" />
                <span>Send Executive Update to {customer.name}</span>
              </div>
              <button onClick={() => setSendMsgModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Message Content *</label>
                <textarea
                  placeholder="Dear Member, our concierge desk is coordinating with..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setSendMsgModalOpen(false)} className="px-4 py-2 text-xs text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!customerMessage.trim()) return;
                  const ok = await handleAction('SEND_CUSTOMER_MESSAGE', { message: customerMessage });
                  if (ok) setSendMsgModalOpen(false);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ESCALATE */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Escalate Task to Senior Concierge</span>
              </div>
              <button onClick={() => setEscalateModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">Escalation Reason *</label>
                <textarea
                  placeholder="Venue fully booked, requires partner manager intervention, or VIP tier special handling..."
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-100 min-h-[90px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setEscalateModalOpen(false)} className="px-4 py-2 text-xs text-neutral-400">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!escalationReason.trim()) return;
                  const ok = await handleAction('ESCALATE', { reason: escalationReason });
                  if (ok) setEscalateModalOpen(false);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

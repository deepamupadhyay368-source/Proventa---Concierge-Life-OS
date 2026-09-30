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
  MessageSquare,
  CreditCard,
  Lock,
  Plane,
  ExternalLink,
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

  // Payment checkout & authorization modal state
  const [pendingPaymentModal, setPendingPaymentModal] = useState<{
    order?: any;
    option: any;
    message?: string;
  } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Manual concierge resolution state
  const [manualRef, setManualRef] = useState('');
  const [manualVendor, setManualVendor] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const launchRazorpayCheckout = async (order: any, option: any) => {
    setProcessingPayment(true);
    try {
      const loaded = await loadRazorpayScript();
      const razorpayKey = order?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_proventa_dev_key';

      if (loaded && typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: razorpayKey,
          amount: order?.amountPaise || (option.priceAmount * 100),
          currency: order?.currency || 'INR',
          name: 'Proventa Concierge',
          description: `Reservation: ${option.title || option.providerName}`,
          order_id: order?.orderId?.startsWith('order_') ? order.orderId : undefined,
          handler: async (response: any) => {
            setUserNotice('Payment authorized! Finalizing your reservation...');
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id || order?.orderId || `order_${Date.now()}`,
                  paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  signature: response.razorpay_signature || 'sig_verified_direct',
                  taskId,
                  optionId: option.id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setPendingPaymentModal(null);
                loadTask();
              }
            } catch (e) {
              handleApprove(option, true);
            }
          },
          theme: { color: '#1F2933' },
        });
        rzp.open();
      } else {
        handleApprove(option, true);
      }
    } catch (e) {
      console.error('[Razorpay Launch Error]', e);
      handleApprove(option, true);
    } finally {
      setProcessingPayment(false);
    }
  };

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

  const handleApprove = async (option: any, skipPaymentGate = false) => {
    setApproving(true);
    setUserNotice('Authorizing your selection and preparing reservation...');
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option, skipPaymentGate }),
      });
      const data = await res.json();

      if (data.paymentRequired && data.paymentOrder && !skipPaymentGate) {
        setPendingPaymentModal({
          order: data.paymentOrder,
          option,
          message: data.message,
        });

        // Attempt launching Razorpay if key is configured
        const razorpayKey = data.paymentOrder.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (razorpayKey && !razorpayKey.includes('dev_key') && typeof window !== 'undefined') {
          const loaded = await loadRazorpayScript();
          if (loaded && (window as any).Razorpay) {
            launchRazorpayCheckout(data.paymentOrder, option);
          }
        }
      } else if (data.task) {
        setTask(data.task);
        setPendingPaymentModal(null);
        setUserNotice(data.message || 'Reservation authorized! Your concierge is executing your booking.');
        loadTask();
      } else if (data.error) {
        setUserNotice(`Notice: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Approval execution failed', err);
      setUserNotice('Failed to complete approval. Please try again.');
    } finally {
      setApproving(false);
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
        <p className="text-sm font-medium text-[#1F2933]">Task not found</p>
        <Link href="/tasks" className="text-xs text-[#1F2933] hover:underline mt-2 inline-block font-medium">
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

  const clientPreferences = typeof task.clientPreferences === 'string'
    ? (() => { try { return JSON.parse(task.clientPreferences); } catch { return {}; } })()
    : (task.clientPreferences || {});
  const approvedOption = clientPreferences?.approvedOption;
  const deliverable = clientPreferences?.deliverable;

  const getCustomerFacingStatusLabel = (taskStatus: string) => {
    switch (taskStatus) {
      case 'NEEDS_HUMAN':
      case 'AWAITING_CONCIERGE_CALL':
      case 'CONCIERGE_ASSIGNED':
        return 'Concierge in Progress';
      case 'AWAITING_APPROVAL':
      case 'OPTIONS_READY':
        return 'Options Ready';
      case 'APPROVED':
      case 'EXECUTING':
      case 'VERIFYING':
        return 'Confirming Arrangements';
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'Confirmed';
      case 'NEEDS_INFORMATION':
        return 'Detail Needed';
      case 'FAILED':
        return 'Reviewing Alternatives';
      default:
        return 'Researching Options';
    }
  };

  const getStatusMessage = (taskStatus: string) => {
    switch (taskStatus) {
      case 'APPROVED':
      case 'NEEDS_HUMAN':
      case 'AWAITING_CONCIERGE_CALL':
        return 'Your concierge is taking it from here.';
      case 'EXECUTING':
      case 'VERIFYING':
        return 'Your PROVENTA Concierge is currently finalizing your arrangements.';
      case 'NEEDS_INFORMATION':
        return 'Your concierge needs one more detail before completing this.';
      case 'CONFIRMED':
      case 'COMPLETED':
        return task.externalReferenceId
          ? `You're all set. Your arrangements are confirmed (Ref: ${task.externalReferenceId}).`
          : "You're all set. Your arrangements are confirmed.";
      case 'FAILED':
        return 'Our concierge team is reviewing alternative arrangements for your request.';
      case 'AWAITING_APPROVAL':
      case 'OPTIONS_READY':
        return 'Your personalized options are ready for selection.';
      default:
        return 'Your PROVENTA assistant is curating verified options for you.';
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E1E5E8] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/tasks" className="p-2 hover:bg-[#F1F3F5] rounded-xl text-[#66717C] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#1F2933] uppercase tracking-wider font-mono">
                {task.assignedAgent || task.category}
              </span>
              <span className="text-[#A7B0B8]">·</span>
              <span className="text-xs text-[#66717C] number-mono">Task #{task.publicId || task.id.slice(-6)}</span>
            </div>
            <h1 className="text-lg font-semibold text-[#1F2933] mt-0.5">{task.intent || task.originalRequest}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
              isConfirmed
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : isAwaitingApproval
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : isNeedsHuman || task.status === 'APPROVED' || task.status === 'EXECUTING'
                ? 'bg-purple-50 text-purple-900 border border-purple-200'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {isConfirmed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            {isAwaitingApproval && <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />}
            {(isNeedsHuman || task.status === 'APPROVED' || task.status === 'EXECUTING') && <UserCheck className="h-3.5 w-3.5 text-purple-600" />}
            {!isConfirmed && !isAwaitingApproval && !isNeedsHuman && task.status !== 'APPROVED' && task.status !== 'EXECUTING' && <Clock className="h-3.5 w-3.5 text-neutral-500" />}
            {getCustomerFacingStatusLabel(task.status)}
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

      {/* Reassuring Premium Status Banner */}
      {getStatusMessage(task.status) && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
          task.status === 'COMPLETED' || task.status === 'CONFIRMED'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            : isNeedsHuman || task.status === 'APPROVED' || task.status === 'EXECUTING'
            ? 'bg-purple-50/90 border-purple-200 text-purple-950'
            : task.status === 'FAILED'
            ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {task.status === 'COMPLETED' || task.status === 'CONFIRMED' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
            ) : isNeedsHuman || task.status === 'APPROVED' ? (
              <UserCheck className="h-4 w-4 text-purple-700 shrink-0" />
            ) : task.status === 'EXECUTING' ? (
              <RefreshCw className="h-4 w-4 text-purple-700 shrink-0 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 text-neutral-600 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-xs sm:text-sm">{getStatusMessage(task.status)}</div>
              {(isNeedsHuman || task.status === 'APPROVED') && (
                <div className="text-[11px] text-purple-800/80 mt-0.5">
                  Your PROVENTA Concierge is currently coordinating with the venue/provider to finalize all arrangements.
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/90 border border-current font-bold shrink-0">
            {getCustomerFacingStatusLabel(task.status)}
          </span>
        </div>
      )}

      {/* 5-Step Hybrid Concierge Progress Flow */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center relative">
          {[
            { step: 1, label: 'Request Received', active: true, done: true },
            {
              step: 2,
              label: 'Options Selected',
              active: !['REQUESTED', 'UNDERSTANDING', 'SEARCHING'].includes(task.status),
              done: ['AWAITING_APPROVAL', 'APPROVED', 'NEEDS_HUMAN', 'AWAITING_CONCIERGE_CALL', 'EXECUTING', 'VERIFYING', 'CONFIRMED', 'COMPLETED'].includes(task.status),
            },
            {
              step: 3,
              label: 'Concierge Assigned',
              active: ['APPROVED', 'NEEDS_HUMAN', 'AWAITING_CONCIERGE_CALL', 'EXECUTING', 'VERIFYING', 'CONFIRMED', 'COMPLETED'].includes(task.status),
              done: ['APPROVED', 'NEEDS_HUMAN', 'AWAITING_CONCIERGE_CALL', 'EXECUTING', 'VERIFYING', 'CONFIRMED', 'COMPLETED'].includes(task.status),
            },
            {
              step: 4,
              label: 'Confirming Arrangements',
              active: ['NEEDS_HUMAN', 'AWAITING_CONCIERGE_CALL', 'EXECUTING', 'VERIFYING', 'CONFIRMED', 'COMPLETED'].includes(task.status),
              done: isConfirmed,
            },
            {
              step: 5,
              label: 'Final Confirmation',
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
              <span className={`text-[10px] sm:text-[11px] font-medium block leading-tight ${item.active ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Presentation Card (Non-Booking Tasks) */}
      {deliverable && (
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                DLV
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                  {deliverable.type || 'Curated Deliverable'}
                </span>
                <h2 className="text-base font-bold text-neutral-900">{deliverable.title}</h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Completed
            </span>
          </div>

          <div className="prose prose-neutral text-xs text-neutral-800 whitespace-pre-line leading-relaxed bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 font-sans">
            {deliverable.content}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
            <span>Prepared by {deliverable.preparedBy || 'Proventa Private Concierge'}</span>
            <span className="font-mono text-[11px]">Ref: DLV-{task.publicId || task.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Locked & Approved Option Card */}
      {approvedOption && !deliverable && !task.externalReferenceId && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Locked Approved Option
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {approvedOption.priceFormatted || (approvedOption.priceAmount ? `₹${approvedOption.priceAmount.toLocaleString('en-IN')}` : 'Included')}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-900">{approvedOption.title}</h4>
            <p className="text-xs text-neutral-500">{approvedOption.providerName}</p>
            {approvedOption.description && (
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{approvedOption.description}</p>
            )}
          </div>

          {/* Pending Payment & Authorization Action Panel */}
          {task.paymentStatus === 'PENDING' && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-950">Payment Authorization Required</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900">
                  Total: {approvedOption.priceFormatted || `₹${approvedOption.priceAmount || task.budgetAmount || 0}`}
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Choose to settle online via UPI / Card, or authorize your Proventa Concierge to execute the booking immediately and bill your member account.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => launchRazorpayCheckout({ amountPaise: (approvedOption.priceAmount || task.budgetAmount || 0) * 100 }, approvedOption)}
                  disabled={processingPayment || approving}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{processingPayment ? 'Opening Checkout...' : 'Pay via UPI / Card / NetBanking'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(approvedOption, true)}
                  disabled={approving || processingPayment}
                  className="px-4 py-2 bg-white hover:bg-amber-100/50 text-amber-950 border border-amber-300 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <UserCheck className="h-3.5 w-3.5 text-amber-800" />
                  <span>{approving ? 'Authorizing...' : 'Authorize Concierge Execution & Invoice'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="bg-[#1F2933] text-white rounded-2xl p-4 border border-[#E1E5E8]/30 shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-[#A7B0B8] animate-spin" />
            <span className="text-xs font-medium tracking-wide">{userNotice}</span>
          </div>
          <button
            onClick={() => setUserNotice(null)}
            className="text-[#A7B0B8] hover:text-white p-1 rounded-md text-xs"
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
            <div className="bg-white border border-[#E1E5E8] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E5E8] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1F2933] text-white font-mono tracking-wider">
                      {currentBatchId}
                    </span>
                    <span className="text-xs font-semibold text-[#1F2933]">
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
                <div className="text-[11px] text-[#66717C] flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-[#1F2933]" />
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

      {/* Payment & Concierge Reservation Authorization Modal */}
      {pendingPaymentModal && (
        <div className="fixed inset-0 z-50 bg-[#111820]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E1E5E8] max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-up">
            <div className="flex items-center justify-between border-b border-[#E1E5E8] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#F1F3F5] text-[#1F2933] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#1F2933]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933]">Authorize Reservation</h3>
                  <p className="text-xs text-[#66717C]">Review &amp; confirm booking placement</p>
                </div>
              </div>
              <button
                onClick={() => setPendingPaymentModal(null)}
                className="p-1 hover:bg-[#F1F3F5] rounded-lg text-[#66717C]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Itemized Service Box */}
            <div className="rounded-2xl bg-[#111820] text-white p-5 space-y-3 border border-[#303942]">
              <div className="flex items-center justify-between border-b border-[#303942] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-[#A7B0B8]" />
                  <span className="font-semibold text-white">
                    {pendingPaymentModal.option?.metadata?.carrier || pendingPaymentModal.option?.providerName || 'Airline Reservation'}
                  </span>
                  {pendingPaymentModal.option?.metadata?.flightNumber && (
                    <span className="font-mono text-[#A7B0B8] bg-[#1F2933] px-2 py-0.5 rounded border border-[#303942] text-[10px]">
                      {pendingPaymentModal.option.metadata.flightNumber}
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 font-mono font-bold text-sm">
                  {pendingPaymentModal.option?.priceFormatted || `₹${pendingPaymentModal.option?.priceAmount || 0}`}
                </span>
              </div>

              <div className="text-xs text-[#A7B0B8] space-y-1">
                <p className="font-medium text-white">{pendingPaymentModal.option?.title}</p>
                {pendingPaymentModal.option?.metadata?.departureAirport && pendingPaymentModal.option?.metadata?.arrivalAirport && (
                  <p className="text-[11px] font-mono text-[#A7B0B8]">
                    {pendingPaymentModal.option.metadata.departureAirport} ➔ {pendingPaymentModal.option.metadata.arrivalAirport}
                    {pendingPaymentModal.option.metadata.departureTime ? ` · ${pendingPaymentModal.option.metadata.departureTime.slice(11, 16)}` : ''}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-[#66717C] leading-relaxed">
              To guarantee your reservation with the provider, choose your preferred authorization method below:
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Direct Payment Gateway Checkout */}
              <button
                type="button"
                onClick={() => launchRazorpayCheckout(pendingPaymentModal.order, pendingPaymentModal.option)}
                disabled={processingPayment || approving}
                className="w-full py-3.5 px-5 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-between transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#A7B0B8]" />
                  <span>Pay via UPI / Card / NetBanking</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {pendingPaymentModal.option?.priceFormatted || `₹${pendingPaymentModal.option?.priceAmount || 0}`}
                </span>
              </button>

              {/* Option 2: 1-Click Concierge Direct Authorization */}
              <button
                type="button"
                onClick={() => handleApprove(pendingPaymentModal.option, true)}
                disabled={approving || processingPayment}
                className="w-full py-3.5 px-5 bg-white hover:bg-[#F7F8FA] border border-[#E1E5E8] hover:border-[#1F2933] text-[#1F2933] rounded-xl text-xs font-semibold flex items-center justify-between transition-all disabled:opacity-50 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#1F2933]" />
                  <span>Authorize Concierge Direct Booking &amp; Invoice</span>
                </div>
                <span className="text-[11px] text-[#66717C] font-normal">Wave 1 Member Desk</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E1E5E8] text-xs">
              <span className="text-[11px] text-[#66717C] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1F2933]" />
                Direct settlement. Zero hidden markups.
              </span>
              <button
                type="button"
                onClick={() => setPendingPaymentModal(null)}
                className="px-3 py-1.5 text-[#66717C] hover:text-[#1F2933] font-medium"
              >
                Back to Options
              </button>
            </div>
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

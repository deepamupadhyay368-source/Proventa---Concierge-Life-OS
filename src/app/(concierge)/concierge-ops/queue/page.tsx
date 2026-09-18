'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldAlert,
  Phone,
  ExternalLink,
} from 'lucide-react';

function extractCallSheet(task: any) {
  // Authoritative source: AWAITING_CONCIERGE_CALL event
  const dispatchEvent = task.events?.find((e: any) => e.eventType === 'AWAITING_CONCIERGE_CALL');
  const payload = dispatchEvent?.data?.dispatchPayload || dispatchEvent?.data || {};

  // Fallback to proposedOptions or task fields
  const firstOption = Array.isArray(task.proposedOptions) ? task.proposedOptions[0] : null;

  const venueName =
    payload.venueName ||
    task.vendorName ||
    firstOption?.providerName ||
    firstOption?.title ||
    'Not provided';
  const venuePhone = payload.venuePhone || firstOption?.metadata?.phone || null;
  const requestedDate =
    payload.requestedDate ||
    (task.targetDate
      ? new Date(task.targetDate).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null) ||
    'Not provided';
  const requestedTime = payload.requestedTime || 'Not provided';
  const partySize =
    payload.partySize ||
    task.partySize ||
    (firstOption?.metadata?.guests ? Number(firstOption.metadata.guests) : null) ||
    'Not provided';
  const specialRequests =
    payload.specialRequests ||
    (typeof task.clientPreferences === 'string'
      ? task.clientPreferences
      : task.clientPreferences
      ? JSON.stringify(task.clientPreferences)
      : null) ||
    'Not provided';

  const customerName = task.customer?.user?.name || 'Not provided';
  const customerPhone = task.customer?.user?.phone || null;

  const isPhoneReservation =
    task.executionMethod === 'HUMAN_CONCIERGE' ||
    payload.requiresConciergeCall === true ||
    payload.bookingMethod === 'PHONE' ||
    firstOption?.bookingMethod === 'PHONE';

  return {
    venueName,
    venuePhone,
    requestedDate,
    requestedTime,
    partySize,
    specialRequests,
    customerName,
    customerPhone,
    isPhoneReservation,
  };
}

export default function ConciergeQueuePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [escalatedTasks, setEscalatedTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNASSIGNED' | 'URGENT' | 'AWAITING_REVIEW' | 'AWAITING_CUSTOMER'>('ALL');
  const [loading, setLoading] = useState(true);

  // Manual Confirmation Modal State
  const [selectedTaskForConfirm, setSelectedTaskForConfirm] = useState<any | null>(null);
  const [confirmRef, setConfirmRef] = useState('');
  const [confirmVendor, setConfirmVendor] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/concierge/queue');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
      if (data.escalatedTasks) setEscalatedTasks(data.escalatedTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const claimRequest = async (requestId: string) => {
    await fetch('/api/concierge/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    router.push(`/concierge-ops/requests/${requestId}`);
  };

  const openConfirmModal = (task: any) => {
    const sheet = extractCallSheet(task);
    setSelectedTaskForConfirm(task);
    setConfirmRef('');
    setConfirmVendor(sheet.venueName !== 'Not provided' ? sheet.venueName : (task.vendorName || ''));
    setConfirmNotes('');
    setConfirmError(null);
  };

  const handleManualConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForConfirm || !confirmRef.trim()) return;

    const upper = confirmRef.trim().toUpperCase();
    if (
      upper.startsWith('PV-') ||
      upper.startsWith('PV-AMD-') ||
      upper.startsWith('MOCK-') ||
      upper.startsWith('DEMO-') ||
      upper.includes('SANDBOX') ||
      ['NONE', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'TEST', 'MOCK', 'FAKE', 'SIMULATED'].includes(upper)
    ) {
      setConfirmError('Synthetic or simulated references (e.g. PV-*, MOCK-*) are strictly prohibited by Proventa zero-fabrication policy. Enter the authentic reference provided by the venue.');
      return;
    }

    setSubmittingConfirm(true);
    setConfirmError(null);

    try {
      const res = await fetch(`/api/tasks/${selectedTaskForConfirm.id}/manual-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: confirmRef.trim(),
          vendorName: confirmVendor.trim(),
          notes: confirmNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error || 'Failed to record manual confirmation');
        return;
      }

      setSuccessMessage(
        `Booking for Task #${selectedTaskForConfirm.publicId} verified & confirmed! Vendor Ref: ${confirmRef.trim()}`
      );
      setSelectedTaskForConfirm(null);
      await loadQueue();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setConfirmError(err.message || 'An unexpected error occurred during confirmation');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === 'UNASSIGNED') return !r.assignedToId && !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'URGENT') return r.urgency !== 'NORMAL' && !['COMPLETED', 'CANCELLED'].includes(r.status);
    if (filter === 'AWAITING_REVIEW') return ['NEW', 'UNDERSTANDING', 'CONCIERGE_REVIEW'].includes(r.status);
    if (filter === 'AWAITING_CUSTOMER') return r.status === 'AWAITING_CUSTOMER';
    return !['COMPLETED', 'CANCELLED'].includes(r.status);
  });

  const urgentCount = requests.filter((r) => r.urgency !== 'NORMAL' && !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const unassignedCount = requests.filter((r) => !r.assignedToId && !['COMPLETED', 'CANCELLED'].includes(r.status)).length;
  const awaitingCustomerCount = requests.filter((r) => r.status === 'AWAITING_CUSTOMER').length;
  const needsHumanCount = escalatedTasks.length;

  const phoneReservationTasks = escalatedTasks.filter((t) => {
    const sheet = extractCallSheet(t);
    return t.executionMethod === 'HUMAN_CONCIERGE' || sheet.isPhoneReservation;
  });

  const otherEscalatedTasks = escalatedTasks.filter((t) => {
    const sheet = extractCallSheet(t);
    return !(t.executionMethod === 'HUMAN_CONCIERGE' || sheet.isPhoneReservation);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Concierge Operations Queue</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Live incoming delegations and escalated agent tasks</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQueue}
            className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-600 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Success Feedback Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Needs Human (Action Required)</span>
          <p className="text-2xl font-bold text-purple-900 mt-1">{needsHumanCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-red-500 uppercase">Urgent / ASAP</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{urgentCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-500 uppercase">Unassigned</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{unassignedCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-500 uppercase">Awaiting Customer</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{awaitingCustomerCount}</p>
        </div>
      </div>

      {/* ACTION REQUIRED: Direct Telephone Placement Section */}
      {phoneReservationTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
              </span>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-purple-700" />
                <span>Action Required: Place Venue Call ({phoneReservationTasks.length})</span>
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-semibold border border-purple-200">
              Live Concierge Call Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {phoneReservationTasks.map((t) => {
              const sheet = extractCallSheet(t);

              return (
                <div
                  key={t.id}
                  className="bg-white border-2 border-purple-300/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4 relative overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-800 text-white rounded-lg">
                        #{t.publicId}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900">
                        VIP Member: {sheet.customerName}
                      </span>
                      {sheet.customerPhone ? (
                        <a
                          href={`tel:${sheet.customerPhone}`}
                          className="text-xs text-neutral-600 hover:text-purple-700 flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded"
                          title="Call VIP Member"
                        >
                          <Phone className="h-3 w-3 text-neutral-500" />
                          <span>{sheet.customerPhone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Phone: Not provided</span>
                      )}
                    </div>

                    <span className="text-[10px] uppercase font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 self-start sm:self-auto">
                      HUMAN_CONCIERGE · Awaiting Phone Booking
                    </span>
                  </div>

                  {/* Call Sheet Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs bg-purple-50/30 p-3.5 rounded-xl border border-purple-100/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Venue Establishment</span>
                      <span className="text-xs font-bold text-neutral-900 block mt-0.5">{sheet.venueName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Venue Phone Number</span>
                      {sheet.venuePhone ? (
                        <a
                          href={`tel:${sheet.venuePhone}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline mt-0.5"
                          title="Click to place phone call"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>{sheet.venuePhone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400 mt-0.5 block">Not provided</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Requested Date & Time</span>
                      <span className="text-xs font-semibold text-neutral-900 block mt-0.5">
                        {sheet.requestedDate !== 'Not provided'
                          ? `${sheet.requestedDate} · ${sheet.requestedTime}`
                          : 'Not provided'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Guests & Dietary / Notes</span>
                      <span className="text-xs text-neutral-800 block mt-0.5">
                        <strong>{sheet.partySize !== 'Not provided' ? `${sheet.partySize} guests` : 'Not provided'}</strong>
                        {sheet.specialRequests !== 'Not provided' ? ` · ${sheet.specialRequests}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-neutral-500 line-clamp-1">
                      Original Request: <span className="text-neutral-700">{t.originalRequest}</span>
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openConfirmModal(t)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Record Phone Booking</span>
                      </button>

                      <Link
                        href={`/tasks/${t.id}`}
                        className="p-2 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-neutral-600 transition-colors"
                        title="View client task details"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* General Escalated Tasks Section */}
      {otherEscalatedTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Other Escalated Agent Tasks ({otherEscalatedTasks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {otherEscalatedTasks.map((t) => (
              <div key={t.id} className="p-4 bg-purple-50/40 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                      NEEDS HUMAN
                    </span>
                    <span className="text-xs font-semibold text-neutral-900">
                      {t.customer?.user?.name || 'Customer'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      #{t.publicId}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      · {t.assignedAgent}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-neutral-900 line-clamp-1">
                    {t.originalRequest}
                  </p>

                  <p className="text-[11px] text-purple-800">
                    Reason: {t.failedReason || 'Specialized bespoke coordination or partner negotiation needed.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openConfirmModal(t)}
                    className="px-3 py-1.5 bg-purple-800 text-white rounded-lg text-xs font-medium hover:bg-purple-900 transition-colors shadow-xs"
                  >
                    Confirm
                  </button>
                  <Link
                    href={`/tasks/${t.id}`}
                    className="p-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-neutral-600 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Queue Filter Bar */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-2 text-xs">
        {(['ALL', 'UNASSIGNED', 'URGENT', 'AWAITING_REVIEW', 'AWAITING_CUSTOMER'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filter === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading triage queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No requests in this queue view.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((r) => {
              const assignedAgent = r.assignments?.[0]?.concierge?.user?.name;
              return (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full">
                        {r.status.replace(/_/g, ' ')}
                      </span>
                      {r.urgency !== 'NORMAL' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          {r.urgency}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-neutral-900">{r.customer?.user?.name || 'Wave 1 Customer'}</span>
                      <span className="text-xs text-neutral-400">· {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="text-xs font-medium text-neutral-800 line-clamp-1">
                      {r.aiSummary || r.rawInput}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>Assigned: <strong className="text-neutral-700 font-medium">{assignedAgent || 'Unassigned'}</strong></span>
                      <span>Category: {r.category?.name || 'General'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!assignedAgent ? (
                      <button
                        onClick={() => claimRequest(r.id)}
                        className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
                      >
                        Claim & Open
                      </button>
                    ) : (
                      <Link
                        href={`/concierge-ops/requests/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Phone Booking Modal */}
      {selectedTaskForConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Record Phone Booking Confirmation</h3>
                <p className="text-xs text-neutral-500">Task #{selectedTaskForConfirm.publicId} · Record verified reference</p>
              </div>
              <button
                onClick={() => setSelectedTaskForConfirm(null)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Structured Call Brief Inside Modal */}
            {(() => {
              const sheet = extractCallSheet(selectedTaskForConfirm);
              return (
                <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Establishment</span>
                      <span className="font-bold text-neutral-900">{sheet.venueName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone Line</span>
                      {sheet.venuePhone ? (
                        <a href={`tel:${sheet.venuePhone}`} className="text-purple-700 font-bold hover:underline inline-flex items-center gap-1">
                          <PhoneCall className="h-3 w-3" />
                          <span>{sheet.venuePhone}</span>
                        </a>
                      ) : (
                        <span className="text-neutral-400">Not provided</span>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-600 border-t border-purple-100/60 pt-1.5">
                    Reservation: <strong>{sheet.requestedDate !== 'Not provided' ? `${sheet.requestedDate} at ${sheet.requestedTime}` : 'Not provided'}</strong> · {sheet.partySize !== 'Not provided' ? `${sheet.partySize} guests` : 'Guests: Not provided'}
                  </div>
                  {sheet.specialRequests !== 'Not provided' && (
                    <div className="text-[11px] text-purple-900 italic">
                      Special requests: {sheet.specialRequests}
                    </div>
                  )}
                </div>
              );
            })()}

            {confirmError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{confirmError}</span>
              </div>
            )}

            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-amber-950 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950 text-[11px] uppercase tracking-wider">Strict Zero-Fabrication Mandate</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Synthetic or simulated codes (e.g. PV-*, MOCK-*, DEMO-*) will be rejected. You must input the authentic reference code, PNR, or table confirmation provided by the venue host.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualConfirmSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Authentic Confirmation Reference / Table Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AGS-TABLE-14 or DUTY-MGR-8891"
                  value={confirmRef}
                  onChange={(e) => setConfirmRef(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Duty Manager / Staff Contacted (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Hitesh (Floor Manager)"
                  value={confirmVendor}
                  onChange={(e) => setConfirmVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Call Logs & Verification Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spoke with duty manager. Verified terrace priority seating for 4."
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForConfirm(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConfirm || !confirmRef.trim()}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 disabled:opacity-50 shadow-xs"
                >
                  {submittingConfirm ? 'Confirming...' : 'Mark Confirmed & Issue Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

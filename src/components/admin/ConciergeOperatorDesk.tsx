'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  PlusCircle,
  ShieldAlert,
  CheckCircle2,
  Send,
  X,
  Building,
  User,
  ExternalLink,
  DollarSign,
  Phone,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function extractCallSheet(task: any) {
  const dispatchEvent = task.events?.find((e: any) => e.eventType === 'AWAITING_CONCIERGE_CALL');
  const payload = dispatchEvent?.data?.dispatchPayload || dispatchEvent?.data || {};
  const firstOption = Array.isArray(task.proposedOptions) ? task.proposedOptions[0] : null;

  const isFlight =
    task.category === 'TRAVEL' ||
    task.category === 'FLIGHTS' ||
    task.category === 'travel' ||
    task.category === 'flights' ||
    payload.subCategory === 'FLIGHTS' ||
    payload.category === 'TRAVEL' ||
    Boolean(payload.carrier) ||
    Boolean(firstOption?.metadata?.airline);

  const carrier = payload.carrier || firstOption?.metadata?.airline || task.vendorName || 'Commercial Airline';
  const flightNumber = payload.flightNumber || firstOption?.metadata?.flightNumber || '';
  const route = payload.origin && payload.destination
    ? `${payload.origin} ➔ ${payload.destination}`
    : firstOption?.metadata?.route || 'Not provided';
  const cabinClass = payload.cabinClass || firstOption?.metadata?.cabinClass || 'ECONOMY';
  const priceInr = payload.priceInr || firstOption?.priceAmount || task.budgetAmount || null;
  const instructions = payload.instructions || null;

  const venueName = isFlight
    ? `${carrier} ${flightNumber} (${route})`.trim()
    : payload.venueName ||
      task.vendorName ||
      firstOption?.providerName ||
      firstOption?.title ||
      'Not provided';

  const venuePhone = payload.venuePhone || firstOption?.metadata?.phone || null;
  const requestedDate =
    payload.departureTime
      ? new Date(payload.departureTime).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : payload.requestedDate ||
        (task.targetDate
          ? new Date(task.targetDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : null) ||
        'Not provided';

  const requestedTime = payload.departureTime
    ? new Date(payload.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : payload.requestedTime || 'Not provided';

  const partySize =
    payload.passengers ||
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

  return {
    isFlight,
    carrier,
    flightNumber,
    route,
    cabinClass,
    priceInr,
    instructions,
    venueName,
    venuePhone,
    requestedDate,
    requestedTime,
    partySize,
    specialRequests,
    customerName,
    customerPhone,
  };
}

export function ConciergeOperatorDesk({
  tasks,
  onRefresh,
}: {
  tasks: any[];
  onRefresh?: () => void;
}) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'INJECT' | 'LOG_PHONE' | null>(null);

  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [availability, setAvailability] = useState('');
  const [phoneRef, setPhoneRef] = useState('');
  const [phoneVendor, setPhoneVendor] = useState('');
  const [phoneNotes, setPhoneNotes] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsHumanTasks = tasks.filter((t) => t.status === 'NEEDS_HUMAN' || t.isEscalated);

  const openInjectModal = (task: any) => {
    setSelectedTask(task);
    setTitle(`Exclusive VIP Table at ${task.vendorName || 'Heritage Venue'}`);
    setProviderName(task.vendorName || 'Curated Partner');
    setDescription('Senior Concierge verified table reservation with tailored arrangements.');
    setPriceAmount(task.budgetAmount ? String(task.budgetAmount) : '3500');
    setAvailability('Confirmed Table Held under Proventa Private Account');
    setModalMode('INJECT');
  };

  const openPhoneModal = (task: any) => {
    const sheet = extractCallSheet(task);
    setSelectedTask(task);
    setPhoneRef('');
    setPhoneVendor(sheet.venueName !== 'Not provided' ? sheet.venueName : (task.vendorName || ''));
    setPhoneNotes('');
    setPhoneError(null);
    setModalMode('LOG_PHONE');
  };

  const handleInjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !title || !providerName) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tasks/${selectedTask.id}/inject-option`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          providerName,
          description,
          priceAmount: parseInt(priceAmount) || 0,
          availability,
        }),
      });
      if (res.ok) {
        setModalMode(null);
        if (onRefresh) onRefresh();
        else window.location.reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !phoneRef.trim()) return;

    const upper = phoneRef.trim().toUpperCase();
    if (
      upper.startsWith('PV-') ||
      upper.startsWith('PV-AMD-') ||
      upper.startsWith('MOCK-') ||
      upper.startsWith('DEMO-') ||
      upper.includes('SANDBOX') ||
      ['NONE', 'N/A', 'NA', 'NULL', 'UNDEFINED', 'TEST', 'MOCK', 'FAKE', 'SIMULATED'].includes(upper)
    ) {
      setPhoneError('Synthetic or mock references (e.g. PV-*, MOCK-*) are strictly prohibited by Proventa zero-fabrication policy. Enter the authentic confirmation reference provided by the venue.');
      return;
    }

    setSubmitting(true);
    setPhoneError(null);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/manual-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: phoneRef.trim(),
          vendorName: phoneVendor.trim() || undefined,
          notes: phoneNotes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setModalMode(null);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        setPhoneError(data.error || 'Failed to record phone booking. Please try again.');
      }
    } catch (err: any) {
      setPhoneError(err.message || 'Network error occurred while confirming booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {needsHumanTasks.length > 0 && (
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50/80 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-purple-600 animate-ping" />
              <h2 className="text-sm font-bold text-purple-950 uppercase tracking-wider">
                Senior Concierge Intervention Queue ({needsHumanTasks.length} Escalated)
              </h2>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-purple-200 text-purple-800 font-semibold">
              Live Operator Action Required
            </span>
          </div>

          <p className="text-xs text-purple-900 mb-4 leading-relaxed">
            The following tasks require direct human coordination, telephone reservation with partner desks, or bespoke proposal crafting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {needsHumanTasks.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">#{t.publicId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-900 font-semibold rounded-full uppercase">
                      {t.category || 'concierge'}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-neutral-900 mt-1 line-clamp-1">
                    {t.intent || t.originalRequest}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Client: {t.customer?.user?.name || 'VIP Member'}
                  </p>
                  {t.failedReason && (
                    <p className="text-[10px] text-purple-700 bg-purple-50 p-1.5 rounded mt-2 font-mono">
                      Reason: {t.failedReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => openInjectModal(t)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Inject Proposal</span>
                  </button>

                  <button
                    onClick={() => openPhoneModal(t)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-700 text-white hover:bg-purple-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Log Phone Booking</span>
                  </button>

                  <Link
                    href={`/tasks/${t.id}`}
                    className="p-1.5 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-neutral-600 transition-colors"
                    title="Open task view"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalMode === 'INJECT' && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Inject Concierge Proposal</h3>
                <p className="text-xs text-neutral-500">Task #{selectedTask.publicId} · Direct client insertion</p>
              </div>
              <button onClick={() => setModalMode(null)} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInjectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Provider / Venue Name</label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Price (INR)</label>
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Description & Privileges</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Availability Status</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !providerName.trim()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Injecting...' : 'Inject into Client Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'LOG_PHONE' && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Log Offline Telephone Booking</h3>
                <p className="text-xs text-neutral-500">Task #{selectedTask.publicId} · Record verified reference</p>
              </div>
              <button onClick={() => setModalMode(null)} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            {phoneError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{phoneError}</span>
              </div>
            )}

            {/* Venue / Flight Call Brief */}
            {(() => {
              const sheet = extractCallSheet(selectedTask);
              return (
                <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3.5 space-y-2.5 text-xs text-purple-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-900 uppercase tracking-wider text-[10px]">
                      {sheet.isFlight ? 'Airline / GDS Flight Dispatch Brief' : 'Venue Call Brief'}
                    </span>
                    {sheet.venuePhone ? (
                      <a
                        href={`tel:${sheet.venuePhone}`}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-[11px] font-medium transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{sheet.venuePhone}</span>
                      </a>
                    ) : sheet.isFlight ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-200/60 text-purple-800 font-semibold">
                        GDS / Airline Partner Desk
                      </span>
                    ) : (
                      <span className="text-[11px] text-purple-400 italic">No phone available</span>
                    )}
                  </div>

                  {sheet.isFlight ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-purple-600 block text-[10px]">Flight / Carrier</span>
                          <span className="font-medium text-purple-950">{sheet.carrier} {sheet.flightNumber}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 block text-[10px]">Route</span>
                          <span className="font-medium text-purple-950">{sheet.route}</span>
                        </div>
                        <div>
                          <span className="text-purple-600 block text-[10px]">Cabin & Guests</span>
                          <span className="font-medium text-purple-950">{sheet.cabinClass} ({sheet.partySize} pax)</span>
                        </div>
                        <div>
                          <span className="text-purple-600 block text-[10px]">Date & Time</span>
                          <span className="font-medium text-purple-950">{sheet.requestedDate} {sheet.requestedTime}</span>
                        </div>
                      </div>

                      {sheet.instructions && (
                        <div className="p-2 bg-purple-100/60 rounded-lg text-[10px] text-purple-900 border border-purple-200/60">
                          <span className="font-bold block">Operator Dispatch Directive:</span>
                          {sheet.instructions}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-purple-600 block text-[10px]">Venue</span>
                        <span className="font-medium text-purple-950">{sheet.venueName}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[10px]">Party Size</span>
                        <span className="font-medium text-purple-950">{sheet.partySize}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[10px]">Date</span>
                        <span className="font-medium text-purple-950">{sheet.requestedDate}</span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[10px]">Time</span>
                        <span className="font-medium text-purple-950">{sheet.requestedTime}</span>
                      </div>
                    </div>
                  )}

                  {sheet.specialRequests !== 'Not provided' && (
                    <div className="pt-2 border-t border-purple-200/60 text-[11px]">
                      <span className="text-purple-600 block text-[10px]">Special Requests</span>
                      <span className="text-purple-900">{sheet.specialRequests}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-purple-600 block text-[10px]">Member</span>
                      <span className="font-medium text-purple-950">{sheet.customerName}</span>
                    </div>
                    {sheet.customerPhone && (
                      <div className="text-right">
                        <span className="text-purple-600 block text-[10px]">Member Phone</span>
                        <a href={`tel:${sheet.customerPhone}`} className="text-purple-700 hover:underline font-mono">
                          {sheet.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-amber-950 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950 text-[11px] uppercase tracking-wider">Strict Zero-Fabrication Mandate</p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Synthetic or simulated codes (e.g. PV-*, MOCK-*, DEMO-*) will be rejected. You must input the authentic reference code, PNR, or table confirmation provided by the venue host or airline GDS.
                </p>
              </div>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Authentic Confirmation PNR / Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={extractCallSheet(selectedTask).isFlight ? "e.g. AI-9X4K2P or 6E-W8P9Q" : "e.g. AGS-TABLE-14 or DUTY-MGR-8891"}
                  value={phoneRef}
                  onChange={(e) => setPhoneRef(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  {extractCallSheet(selectedTask).isFlight ? "Airline / GDS Provider" : "Venue / Duty Manager Name"}
                </label>
                <input
                  type="text"
                  value={phoneVendor}
                  onChange={(e) => setPhoneVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Call Logs & Verification Notes</label>
                <textarea
                  rows={3}
                  value={phoneNotes}
                  onChange={(e) => setPhoneNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !phoneRef.trim()}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Mark Confirmed & Issue Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
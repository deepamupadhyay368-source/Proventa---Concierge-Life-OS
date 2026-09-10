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
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

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
    setSelectedTask(task);
    setPhoneRef(`TEL-${Date.now().toString().slice(-6)}`);
    setPhoneVendor(task.vendorName || 'Venue Reservation Desk');
    setPhoneNotes('Spoke with Restaurant Duty Manager. Confirmed table for specified party.');
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
    if (!selectedTask || !phoneRef) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/manual-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationRef: phoneRef,
          vendorName: phoneVendor,
          notes: phoneNotes,
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

            <form onSubmit={handlePhoneSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Authentic Confirmation PNR / Reference</label>
                <input
                  type="text"
                  required
                  value={phoneRef}
                  onChange={(e) => setPhoneRef(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">Venue / Duty Manager Name</label>
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
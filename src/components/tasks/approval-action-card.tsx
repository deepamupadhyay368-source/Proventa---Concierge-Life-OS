'use client';

import React from 'react';
import { ShieldCheck, ArrowRight, Check, X, Building, AlertCircle } from 'lucide-react';

export function ApprovalActionCard({
  proposal,
  onApprove,
  onDecline,
  approving,
}: {
  proposal: any;
  onApprove: (proposal: any) => void;
  onDecline?: () => void;
  approving: boolean;
}) {
  if (!proposal) return null;

  return (
    <div className="rounded-2xl bg-white border-2 border-[#8a7053] p-6 sm:p-8 shadow-xl shadow-brand-900/5 relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent pointer-events-none rounded-bl-full" />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[11px] uppercase tracking-widest font-bold text-[#8a7053] font-sans">
          Client Authorization Required
        </span>
      </div>

      <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#141312] mb-2">
        {proposal.title || proposal.providerName}
      </h3>

      <p className="text-xs sm:text-sm text-[#5a4937] leading-relaxed mb-6 font-sans">
        {proposal.description || 'Verified concierge proposal prepared for your review.'}
      </p>

      {/* Itemized Detail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#faf8f5] border border-[#e8e2d8] mb-6 text-xs font-sans">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5">Venue / Provider</span>
          <span className="font-semibold text-[#141312]">{proposal.providerName}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5">Total Line Item</span>
          <span className="font-semibold text-emerald-800">{proposal.priceFormatted || `₹${proposal.priceAmount || 0}`}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-0.5">Cancellation Policy</span>
          <span className="text-[11px] text-neutral-600 truncate block">{proposal.cancellationPolicy || 'Complimentary up to 2h prior'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => onApprove(proposal)}
          disabled={approving}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#141312] hover:bg-[#2e2720] text-[#faf8f5] text-xs uppercase tracking-widest font-semibold transition-all shadow-md disabled:opacity-50"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{approving ? 'Authorizing & Executing...' : 'Approve & Book'}</span>
        </button>

        {onDecline && (
          <button
            type="button"
            onClick={onDecline}
            disabled={approving}
            className="px-5 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            <span>Decline / Change</span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-500">
        <ShieldCheck className="h-3.5 w-3.5 text-[#8a7053]" />
        <span>Authoritative direct settlement. Zero hidden transaction markups.</span>
      </div>
    </div>
  );
}

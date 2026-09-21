'use client';

import React from 'react';
import { ShieldCheck, Check, X, Plane, Clock, Luggage, Info, RefreshCw } from 'lucide-react';

export function ApprovalActionCard({
  proposal,
  onApprove,
  onDecline,
  onReplace,
  isSelected,
  onToggleSelect,
  optionNumber,
  approving,
}: {
  proposal: any;
  onApprove: (proposal: any) => void;
  onDecline?: () => void;
  onReplace?: (optionId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (optionId: string) => void;
  optionNumber?: number;
  approving: boolean;
}) {
  if (!proposal) return null;

  const isFlight = Boolean(
    proposal.metadata?.flightNumber ||
    proposal.metadata?.departureAirport ||
    proposal.providerId === 'amadeus_flights' ||
    proposal.category === 'travel' ||
    proposal.category === 'flights'
  );

  const carrier = proposal.metadata?.carrier || proposal.providerName;
  const flightNumber = proposal.metadata?.flightNumber;
  const origin = proposal.metadata?.departureAirport;
  const destination = proposal.metadata?.arrivalAirport;
  const departureTime = proposal.metadata?.departureTime;
  const arrivalTime = proposal.metadata?.arrivalTime;
  const durationMinutes = proposal.metadata?.durationMinutes;
  const cabinClass = proposal.metadata?.cabinClass;
  const baggage = proposal.metadata?.baggage;
  const isSandbox = proposal.environment === 'SANDBOX' || proposal.isMock;

  return (
    <div className={`rounded-2xl bg-white border-2 p-6 sm:p-8 shadow-xl shadow-brand-900/5 relative overflow-hidden transition-all ${
      isSelected ? 'border-amber-600 ring-2 ring-amber-400/20 bg-amber-50/10' : 'border-[#8a7053]'
    }`}>
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent pointer-events-none rounded-bl-full" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {optionNumber !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-900 text-amber-300 number-mono">
              Option {optionNumber}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#8a7053] font-sans">
            Client Authorization Required
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <button
              type="button"
              onClick={() => onToggleSelect(proposal.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={() => {}}
                className="rounded text-amber-700 pointer-events-none"
              />
              <span>{isSelected ? 'Kept in list' : 'Keep option'}</span>
            </button>
          )}

          {isSandbox && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Sandbox Preview
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#141312] mb-2">
        {proposal.title || proposal.providerName}
      </h3>

      <p className="text-xs sm:text-sm text-[#5a4937] leading-relaxed mb-6 font-sans">
        {proposal.description || 'Verified concierge proposal prepared for your review.'}
      </p>

      {/* Flight-Specific Itinerary Card */}
      {isFlight && (
        <div className="bg-[#141210] text-[#faf8f5] rounded-xl p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2e2924] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#c8b99d]" />
              <span className="font-semibold text-white">{carrier}</span>
              {flightNumber && (
                <span className="font-mono text-[#c8b99d] bg-[#221e1a] px-2 py-0.5 rounded border border-[#3e362e] text-[11px]">
                  {flightNumber}
                </span>
              )}
            </div>
            {cabinClass && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#2a241e] text-[#ddc8a9] border border-[#3e362e]">
                {cabinClass.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 items-center text-center">
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white block">
                {origin || 'AMD'}
              </span>
              <span className="text-[10px] text-[#a8a49c] block font-mono">
                {departureTime ? departureTime.replace('T', ' ').slice(11, 16) : 'Prime Time'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#a8a49c] block">
                {durationMinutes ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : 'Non-Stop'}
              </span>
              <div className="h-0.5 w-full bg-[#3e362e] relative">
                <Plane className="h-3 w-3 text-[#c8b99d] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[9px] text-[#78746c] block">Direct Flight</span>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white block">
                {destination || 'BOM'}
              </span>
              <span className="text-[10px] text-[#a8a49c] block font-mono">
                {arrivalTime ? arrivalTime.replace('T', ' ').slice(11, 16) : 'Landing'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2e2924] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a8a49c]">
            {baggage && (
              <div className="flex items-center gap-1.5">
                <Luggage className="h-3.5 w-3.5 text-[#c8b99d]" />
                <span>{baggage}</span>
              </div>
            )}
            <div className="text-right text-emerald-400 font-mono font-bold">
              Total: {proposal.priceFormatted || `₹${proposal.priceAmount || 0}`}
            </div>
          </div>
        </div>
      )}

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
          <span className="text-[11px] text-neutral-600 truncate block">{proposal.cancellationPolicy || 'Complimentary up to 4h prior'}</span>
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
          <span>{approving ? 'Authorizing & Executing...' : isFlight ? 'Approve & Reserve Flight' : 'Approve & Book'}</span>
        </button>

        {onReplace && (
          <button
            type="button"
            onClick={() => onReplace(proposal.id)}
            disabled={approving}
            className="px-4 py-3.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            title={`Replace Option ${optionNumber || ''} with an alternative`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-500" />
            <span>Replace This Option</span>
          </button>
        )}

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


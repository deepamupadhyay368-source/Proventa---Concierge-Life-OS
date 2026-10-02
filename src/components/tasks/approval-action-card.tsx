'use client';

import React from 'react';
import { ShieldCheck, Check, X, Plane, Luggage, RefreshCw } from 'lucide-react';

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

  const isHealthcare = Boolean(
    proposal.metadata?.isHealthcare ||
    proposal.providerId === 'healthcare_discovery' ||
    proposal.category === 'healthcare' ||
    proposal.category === 'doctor' ||
    proposal.category === 'appointments' ||
    proposal.metadata?.doctorId
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

  const docMeta = proposal.metadata || {};

  return (
    <div className={`rounded-2xl bg-white border p-6 sm:p-8 shadow-md relative overflow-hidden transition-all ${
      isSelected ? 'border-[#1F2933] ring-2 ring-[#1F2933]/15 bg-[#F7F8FA]' : 'border-[#E1E5E8]'
    }`}>
      {/* Decorative Silver Tech Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E5E9ED]/50 to-transparent pointer-events-none rounded-bl-full" />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {optionNumber !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F2933] text-white number-mono">
              Option {optionNumber}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-bold text-[#1F2933] font-sans">
            {isHealthcare ? 'Doctor Recommendation' : 'Client Authorization Required'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <button
              type="button"
              onClick={() => onToggleSelect(proposal.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#E5E9ED] border-[#A7B0B8] text-[#1F2933]'
                  : 'bg-[#F7F8FA] border-[#E1E5E8] text-[#66717C] hover:bg-[#F1F3F5]'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={() => {}}
                className="rounded text-[#1F2933] pointer-events-none"
              />
              <span>{isSelected ? 'Kept in list' : 'Keep option'}</span>
            </button>
          )}

          {isSandbox && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1F3F5] text-[#66717C] border border-[#E1E5E8]">
              Sandbox Preview
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#1F2933] mb-2">
        {proposal.title || proposal.providerName}
      </h3>

      <p className="text-xs sm:text-sm text-[#303942] leading-relaxed mb-6 font-sans">
        {proposal.description || 'Verified concierge proposal prepared for your review.'}
      </p>

      {/* Healthcare / Doctor Specific Presentation */}
      {isHealthcare && (
        <div className="bg-[#F7F8FA] rounded-xl p-4 sm:p-5 mb-6 space-y-3 border border-[#E1E5E8]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E5E8] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1F2933]">{docMeta.doctorName || proposal.title}</span>
              {docMeta.specialty && (
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#E5E9ED] text-[#1F2933] border border-[#CBD2D9]">
                  {docMeta.subSpecialty || docMeta.specialty}
                </span>
              )}
            </div>
            {docMeta.experienceYears && (
              <span className="text-[11px] text-[#52606D] font-medium">
                {docMeta.experienceYears} Years Experience
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#303942]">
            {docMeta.qualifications && (
              <div>
                <span className="text-[10px] text-[#66717C] uppercase tracking-wider block">Qualifications</span>
                <span className="font-medium text-[#1F2933]">{docMeta.qualifications}</span>
              </div>
            )}
            {(docMeta.hospital || docMeta.clinic) && (
              <div>
                <span className="text-[10px] text-[#66717C] uppercase tracking-wider block">Hospital / Clinic</span>
                <span className="font-medium text-[#1F2933]">{[docMeta.hospital, docMeta.locality, docMeta.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {docMeta.availabilitySchedule && (
              <div className="col-span-1 sm:col-span-2">
                <span className="text-[10px] text-[#66717C] uppercase tracking-wider block">Consultation Schedule</span>
                <span className="text-[11px] text-[#303942]">{docMeta.availabilitySchedule}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#E1E5E8] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#52606D]">
            <span>Verified Source: <strong className="text-[#1F2933]">{docMeta.source || 'Verified Hospital Desk'}</strong></span>
            <span className="text-emerald-700 font-bold">{proposal.priceFormatted || (docMeta.consultationFee ? `₹${docMeta.consultationFee.toLocaleString('en-IN')}` : 'Fee on Enquiry')}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#E5E9ED]/60 border border-[#CBD2D9] text-[11px] text-[#303942]">
            <strong>Appointment Notice:</strong> Direct booking API is not enabled for healthcare in this release. Appointment coordination and priority slot reservation will be handled directly through the Proventa Senior Concierge Desk upon selection.
          </div>
        </div>
      )}

      {/* Flight-Specific Itinerary Card */}
      {isFlight && (
        <div className="bg-[#111820] text-white rounded-xl p-4 sm:p-5 mb-6 space-y-4 border border-[#303942]">
          <div className="flex items-center justify-between border-b border-[#303942] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-[#A7B0B8]" />
              <span className="font-semibold text-white">{carrier}</span>
              {flightNumber && (
                <span className="font-mono text-[#A7B0B8] bg-[#1F2933] px-2 py-0.5 rounded border border-[#303942] text-[11px]">
                  {flightNumber}
                </span>
              )}
            </div>
            {cabinClass && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1F2933] text-[#E5E9ED] border border-[#303942]">
                {cabinClass.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 items-center text-center">
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white block">
                {origin || 'AMD'}
              </span>
              <span className="text-[10px] text-[#A7B0B8] block font-mono">
                {departureTime ? departureTime.replace('T', ' ').slice(11, 16) : 'Prime Time'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#A7B0B8] block">
                {durationMinutes ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : 'Non-Stop'}
              </span>
              <div className="h-0.5 w-full bg-[#303942] relative">
                <Plane className="h-3 w-3 text-[#A7B0B8] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[9px] text-[#66717C] block">Direct Flight</span>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white block">
                {destination || 'BOM'}
              </span>
              <span className="text-[10px] text-[#A7B0B8] block font-mono">
                {arrivalTime ? arrivalTime.replace('T', ' ').slice(11, 16) : 'Landing'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#303942] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A7B0B8]">
            {baggage && (
              <div className="flex items-center gap-1.5">
                <Luggage className="h-3.5 w-3.5 text-[#A7B0B8]" />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] mb-6 text-xs font-sans">
        <div>
          <span className="text-[10px] text-[#66717C] uppercase tracking-wider block mb-0.5">Venue / Provider</span>
          <span className="font-semibold text-[#1F2933]">{proposal.providerName}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#66717C] uppercase tracking-wider block mb-0.5">Total Line Item</span>
          <span className="font-semibold text-emerald-700">{proposal.priceFormatted || `₹${proposal.priceAmount || 0}`}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#66717C] uppercase tracking-wider block mb-0.5">Cancellation Policy</span>
          <span className="text-[11px] text-[#66717C] truncate block">{proposal.cancellationPolicy || 'Complimentary up to 4h prior'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => onApprove(proposal)}
          disabled={approving}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#1F2933] hover:bg-[#111820] text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-md disabled:opacity-50"
        >
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{approving ? 'Connecting to Concierge...' : isFlight ? 'Select & Book Flight with Concierge' : isHealthcare ? 'Select & Coordinate Appointment with Concierge' : 'Select & Book with Concierge'}</span>
        </button>

        {onReplace && (
          <button
            type="button"
            onClick={() => onReplace(proposal.id)}
            disabled={approving}
            className="px-4 py-3.5 rounded-xl border border-[#E1E5E8] bg-white hover:bg-[#F7F8FA] text-[#1F2933] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            title={`Replace Option ${optionNumber || ''} with an alternative`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#66717C]" />
            <span>Replace Option</span>
          </button>
        )}

        {onDecline && (
          <button
            type="button"
            onClick={onDecline}
            disabled={approving}
            className="px-5 py-3.5 rounded-xl border border-[#E1E5E8] bg-white hover:bg-[#F7F8FA] text-[#66717C] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            <span>Decline / Change</span>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-[#66717C]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#1F2933]" />
        <span>Discovered by PROVENTA AI · Executed & confirmed by your dedicated Human Concierge Desk.</span>
      </div>
    </div>
  );
}



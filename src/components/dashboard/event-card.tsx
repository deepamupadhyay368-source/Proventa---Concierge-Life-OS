'use client';

import { Calendar, Clock, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { OptionProposal } from '@/lib/orchestration/types';

interface EventCardProps {
  option: OptionProposal;
  onSelect?: (optionId: string) => void;
  selected?: boolean;
}

export function EventCard({ option, onSelect, selected }: EventCardProps) {
  const meta = option.metadata || {};
  const category = meta.category || 'Event';
  const venue = meta.venue || option.providerName;
  const city = meta.city || 'Ahmedabad';
  const date = meta.date || 'Scheduled Date';
  const timeDisplay = meta.timeDisplay || 'Evening';
  const priceDisplay = option.priceFormatted || (option.priceAmount ? `₹${option.priceAmount.toLocaleString('en-IN')}` : 'Complimentary / RSVP');
  const source = meta.source || 'Proventa Verified Liaison';
  const isExclusive = meta.isExclusive;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
        selected
          ? 'bg-[#F7F8FA] border-[#1F2933] shadow-md ring-2 ring-[#1F2933]/15'
          : 'bg-white border-[#E1E5E8] hover:border-[#1F2933] shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F1F3F5] text-[#1F2933] text-[10px] font-semibold uppercase tracking-wider border border-[#E1E5E8]">
              {category}
            </span>
            {isExclusive && (
              <span className="px-2 py-0.5 rounded-full bg-[#E5E9ED]/60 text-[#1F2933] text-[10px] font-medium flex items-center gap-1 border border-[#E1E5E8]">
                <ShieldCheck className="w-3 h-3 text-[#1F2933]" />
                <span>Exclusive Access</span>
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#1F2933]">{priceDisplay}</span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-serif font-bold text-[#1F2933] leading-snug">
            {option.title}
          </h3>
          <p className="text-xs text-[#66717C] mt-1 line-clamp-2 leading-relaxed">
            {option.description}
          </p>
        </div>

        {/* Event Schedule & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[#66717C]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1F2933] shrink-0" />
            <span className="font-medium text-[#1F2933]">{date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#1F2933] shrink-0" />
            <span>{timeDisplay}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-[#1F2933] shrink-0" />
            <span className="truncate" title={`${venue}, ${city}`}>
              {venue} · <strong className="font-medium text-[#1F2933]">{city}</strong>
            </span>
          </div>
        </div>

        {/* Transparent Availability Badge */}
        <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] text-[#66717C] flex items-center justify-between gap-2">
          <span>{option.availability || 'Availability subject to provider confirmation.'}</span>
          <span className="text-[10px] text-[#A7B0B8] font-medium shrink-0">{source}</span>
        </div>
      </div>

      {/* Select / Actions Button */}
      {onSelect && (
        <div className="pt-2 border-t border-[#E1E5E8] flex items-center justify-end">
          <button
            type="button"
            onClick={() => onSelect(option.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selected
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'bg-white border border-[#E1E5E8] text-[#1F2933] hover:bg-[#F7F8FA]'
            }`}
          >
            {selected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected</span>
              </>
            ) : (
              <span>Select Option</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}


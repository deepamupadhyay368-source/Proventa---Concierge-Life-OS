'use client';

import { Calendar, Clock, MapPin, Ticket, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
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
          ? 'bg-brand-50/40 border-brand-700 shadow-md ring-2 ring-brand-700/20'
          : 'bg-white border-neutral-200 hover:border-brand-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-semibold uppercase tracking-wider">
              {category}
            </span>
            {isExclusive && (
              <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 text-[10px] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-700" />
                <span>Exclusive Access</span>
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-neutral-900">{priceDisplay}</span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-serif font-bold text-neutral-900 leading-snug">
            {option.title}
          </h3>
          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
            {option.description}
          </p>
        </div>

        {/* Event Schedule & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-700 shrink-0" />
            <span className="font-medium text-neutral-800">{date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-700 shrink-0" />
            <span>{timeDisplay}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0" />
            <span className="truncate" title={`${venue}, ${city}`}>
              {venue} · <strong className="font-medium text-neutral-800">{city}</strong>
            </span>
          </div>
        </div>

        {/* Transparent Availability Badge */}
        <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-500 flex items-center justify-between gap-2">
          <span>{option.availability || 'Availability subject to provider confirmation.'}</span>
          <span className="text-[10px] text-neutral-400 font-medium shrink-0">{source}</span>
        </div>
      </div>

      {/* Select / Actions Button */}
      {onSelect && (
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onSelect(option.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              selected
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {selected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
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

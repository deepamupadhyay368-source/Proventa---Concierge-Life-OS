'use client';

import { StructuredRequestForm, buildSynthesizedPrompt } from '@/lib/requests/request-builder';
import {
  Sparkles,
  Plane,
  Building2,
  Ticket,
  Film,
  Utensils,
  Stethoscope,
  Car,
  Gift,
  Compass,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  ShieldCheck,
  Edit2,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface RequestSummaryCardProps {
  form: StructuredRequestForm;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canCreateRequest: boolean;
}

const SERVICE_META: Record<string, { label: string; icon: any }> = {
  FLIGHTS: { label: 'Flights', icon: Plane },
  HOTELS: { label: 'Hotels & Resorts', icon: Building2 },
  EVENTS: { label: 'Events & Experiences', icon: Ticket },
  MOVIES: { label: 'Movies & Cinema', icon: Film },
  DINING: { label: 'Fine Dining & Tables', icon: Utensils },
  HEALTHCARE: { label: 'Healthcare & Consultations', icon: Stethoscope },
  TRANSPORT: { label: 'Transport & Chauffeur', icon: Car },
  GIFTING: { label: 'Bespoke Gifting', icon: Gift },
  TRIPS: { label: 'Trips & Getaways', icon: Compass },
  OTHER: { label: 'Bespoke Request', icon: FileText },
};

export function RequestSummaryCard({
  form,
  onEdit,
  onSubmit,
  isSubmitting,
  canCreateRequest,
}: RequestSummaryCardProps) {
  const meta = SERVICE_META[form.service] || SERVICE_META.OTHER;
  const ServiceIcon = meta.icon;

  const getRouteOrLocation = () => {
    if (form.service === 'FLIGHTS') {
      return `${form.origin || 'Ahmedabad'} → ${form.destination || 'Mumbai'}`;
    }
    if (form.service === 'TRANSPORT') {
      return `${form.pickupLocation || form.city || 'Ahmedabad'} → ${form.destination || 'Destination'}`;
    }
    if (form.service === 'TRIPS') {
      return `${form.origin || 'Ahmedabad'} → ${form.isSurpriseDestination ? 'Surprise Getaway' : (form.destination || 'Goa')}`;
    }
    return form.city || form.destination || 'Ahmedabad';
  };

  const getDateSummary = () => {
    if (form.service === 'FLIGHTS' && form.tripType === 'ROUND_TRIP' && form.returnDate) {
      return `${form.date || 'Departure'} · Return: ${form.returnDate}`;
    }
    if (form.service === 'HOTELS' && form.returnDate) {
      return `${form.date || 'Check-in'} → ${form.returnDate} (Check-out)`;
    }
    if (form.service === 'TRIPS' && form.returnDate) {
      return `${form.date || 'Start'} → ${form.returnDate}`;
    }
    if (form.date && form.time) {
      return `${form.date} at ${form.time}`;
    }
    return form.date || 'Earliest available';
  };

  const getPartyLabel = () => {
    if (form.service === 'FLIGHTS') return `${form.partySize} passenger${form.partySize > 1 ? 's' : ''}`;
    if (form.service === 'HOTELS') return `${form.partySize} guest${form.partySize > 1 ? 's' : ''}`;
    if (form.service === 'EVENTS') return `${form.partySize} pass${form.partySize > 1 ? 'es' : ''}`;
    if (form.service === 'MOVIES') return `${form.partySize} ticket${form.partySize > 1 ? 's' : ''}`;
    if (form.service === 'HEALTHCARE') return `${form.partySize} patient${form.partySize > 1 ? 's' : ''}`;
    return `${form.partySize} person${form.partySize > 1 ? 's' : ''}`;
  };

  const getBudgetSummary = () => {
    if (form.budgetMode === 'FLEXIBLE' || !form.budgetAmount) {
      return 'Flexible (Show best options)';
    }
    const formatted = `₹${form.budgetAmount.toLocaleString('en-IN')}`;
    if (form.budgetMode === 'MAX') {
      return `Under ${formatted} (Max)`;
    }
    return `Around ${formatted} (Target)`;
  };

  const synthesized = buildSynthesizedPrompt(form);

  return (
    <div className="bg-white border border-[#E1E5E8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E1E5E8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1F3F5] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933]">
            <ServiceIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#66717C]">Your Request</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
                {form.urgency}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1F2933] mt-0.5">{meta.label}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E1E5E8] bg-[#F7F8FA] hover:bg-[#F1F3F5] text-xs font-semibold text-[#1F2933] transition-colors cursor-pointer"
        >
          <Edit2 className="h-3.5 w-3.5 text-[#66717C]" />
          <span>Edit</span>
        </button>
      </div>

      {/* Structured Constraints Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]/60">
          <MapPin className="h-4 w-4 text-[#66717C] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#66717C] block">Location / Route</span>
            <span className="font-semibold text-[#1F2933]">{getRouteOrLocation()}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]/60">
          <Calendar className="h-4 w-4 text-[#66717C] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#66717C] block">Schedule & Timing</span>
            <span className="font-semibold text-[#1F2933]">{getDateSummary()}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]/60">
          <Users className="h-4 w-4 text-[#66717C] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#66717C] block">Party Size</span>
            <span className="font-semibold text-[#1F2933]">
              {getPartyLabel()}
              {form.cabinClass && ` · ${form.cabinClass.replace(/_/g, ' ')}`}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]/60">
          <IndianRupee className="h-4 w-4 text-[#66717C] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#66717C] block">Budget Expectation</span>
            <span className="font-semibold text-[#1F2933]">{getBudgetSummary()}</span>
          </div>
        </div>
      </div>

      {/* Preferences & Specifics */}
      {((form.preferences && form.preferences.length > 0) || form.targetName || form.notes) && (
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8]/60 text-xs space-y-2">
          {form.targetName && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold text-[#66717C]">Target:</span>
              <span className="font-semibold text-[#1F2933]">{form.targetName}</span>
            </div>
          )}

          {form.preferences && form.preferences.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#66717C] block mb-1">Preferences:</span>
              <div className="flex flex-wrap gap-1">
                {form.preferences.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#E1E5E8] text-[11px] font-medium text-[#1F2933]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {form.notes && (
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#66717C] block">Notes:</span>
              <p className="text-[11px] text-[#1F2933] italic mt-0.5">{form.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Discovery Reassurance Callout */}
      <div className="p-3 rounded-xl bg-[#F1F3F5] border border-[#E1E5E8] text-xs text-[#1F2933] flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-[#1F2933] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#66717C] leading-relaxed">
          <span className="font-semibold text-[#1F2933]">Discovery-First Protocol:</span> Submitting this request initiates multi-source search across verified providers. You will receive up to 25 verified options to review, compare, and explicitly approve before any booking or payment takes place.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-4 py-2.5 border border-[#E1E5E8] bg-white hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#66717C] hover:text-[#1F2933] transition-colors cursor-pointer text-center"
        >
          Back &amp; Edit Details
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !canCreateRequest}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Finding Options...</span>
            </>
          ) : (
            <>
              <span>Find My Options</span>
              <ArrowRight className="h-4 w-4 text-[#A7B0B8]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StructuredRequestForm,
  INITIAL_REQUEST_FORM,
  ServiceType,
  buildSynthesizedPrompt,
  mapExtractedDataToForm
} from '@/lib/requests/request-builder';
import { ServiceSpecificFields } from './ServiceSpecificFields';
import { RequestSummaryCard } from './RequestSummaryCard';
import { VoiceInput } from '@/components/voice/VoiceInput';
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
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface HybridRequestComposerProps {
  entitlement: {
    canCreateRequest: boolean;
    hasActiveMembership: boolean;
    complimentaryRequestsRemaining?: number;
    freeRequestAvailable?: boolean;
    freeRequestUsed?: boolean;
  };
  onShowMembershipGate: () => void;
  onSuccess?: (taskId: string) => void;
  className?: string;
}

const SERVICES: Array<{ id: ServiceType; label: string; icon: any; shortDesc: string }> = [
  { id: 'FLIGHTS', label: 'Flights', icon: Plane, shortDesc: 'Aviation & Airfare' },
  { id: 'HOTELS', label: 'Hotels', icon: Building2, shortDesc: 'Suites & Resorts' },
  { id: 'EVENTS', label: 'Events', icon: Ticket, shortDesc: 'Passes & VIP Access' },
  { id: 'MOVIES', label: 'Movies', icon: Film, shortDesc: 'Cinema & Screenings' },
  { id: 'DINING', label: 'Dining', icon: Utensils, shortDesc: 'Reservations & Tables' },
  { id: 'HEALTHCARE', label: 'Healthcare', icon: Stethoscope, shortDesc: 'Doctors & Specialists' },
  { id: 'TRANSPORT', label: 'Transport', icon: Car, shortDesc: 'Chauffeur & Fleets' },
  { id: 'GIFTING', label: 'Gifting', icon: Gift, shortDesc: 'Hampers & Flowers' },
  { id: 'TRIPS', label: 'Trips / Getaways', icon: Compass, shortDesc: 'Custom Escapes' },
  { id: 'OTHER', label: 'Other', icon: FileText, shortDesc: 'Bespoke Delegations' },
];

export function HybridRequestComposer({
  entitlement,
  onShowMembershipGate,
  onSuccess,
  className = '',
}: HybridRequestComposerProps) {
  const router = useRouter();

  // Mode: STRUCTURED (Guided Form) vs NATURAL (Free-form text / voice)
  const [mode, setMode] = useState<'STRUCTURED' | 'NATURAL'>('STRUCTURED');

  // Step in structured mode: 1 = Edit Details, 2 = Summary / Review
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [form, setForm] = useState<StructuredRequestForm>(INITIAL_REQUEST_FORM);

  // Natural language state
  const [naturalText, setNaturalText] = useState('');
  const [naturalUrgency, setNaturalUrgency] = useState<'NORMAL' | 'URGENT' | 'ASAP'>('NORMAL');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateForm = (updated: Partial<StructuredRequestForm>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleServiceSelect = (serviceId: ServiceType) => {
    setForm((prev) => ({
      ...prev,
      service: serviceId,
      // Provide clean defaults per service
      targetName: undefined,
      tripType: serviceId === 'FLIGHTS' ? 'ONE_WAY' : prev.tripType,
      cabinClass: serviceId === 'FLIGHTS' ? 'ECONOMY' : prev.cabinClass,
    }));
  };

  // AI Auto-Fill / Parsing helper
  const handleAutoFillFromText = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    setParseMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/requests/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.structured) {
          setForm((prev) => ({
            ...prev,
            ...data.structured,
            notes: prev.notes || (data.structured.service === 'OTHER' ? textToParse : prev.notes),
          }));
          setMode('STRUCTURED');
          setStep(1);
          setParseMessage('Request details parsed and filled into guided form. Review or edit below.');
          setTimeout(() => setParseMessage(null), 6000);
          return;
        }
      }
    } catch (e) {
      console.warn('[AutoFill] Intent parse fallback:', e);
    } finally {
      setIsParsing(false);
    }

    // Fallback: switch to structured and keep notes
    setForm((prev) => ({ ...prev, notes: textToParse }));
    setMode('STRUCTURED');
    setStep(1);
  };

  // Submit request to Proventa orchestration engine (/api/tasks)
  const executeSubmission = async (rawInputToSend: string, urgencyToSend: 'NORMAL' | 'URGENT' | 'ASAP') => {
    if (!entitlement.canCreateRequest) {
      onShowMembershipGate();
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawInputToSend,
          urgency: urgencyToSend,
        }),
      });

      if (res.status === 401) {
        router.push(`/sign-in?callbackUrl=${encodeURIComponent('/dashboard#new-request')}`);
        return;
      }

      if (res.status === 402) {
        onShowMembershipGate();
        setSubmitting(false);
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (data?.code === 'MEMBERSHIP_REQUIRED') {
        onShowMembershipGate();
        setSubmitting(false);
        return;
      }

      if (res.ok && data?.task?.id) {
        if (onSuccess) {
          onSuccess(data.task.id);
        } else {
          router.push(`/tasks/${data.task.id}`);
        }
        return;
      }

      // Fallback to legacy requests route if needed
      const legacyRes = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawInputToSend,
          urgency: urgencyToSend,
        }),
      });

      if (legacyRes.ok) {
        const legData = await legacyRes.json();
        if (legData?.request?.id) {
          router.push(`/requests/${legData.request.id}`);
          return;
        }
      }

      const msg =
        data?.error ||
        'Unable to submit your request at this moment. Please check your connection or contact concierge.';
      setErrorMessage(msg);
    } catch (err: any) {
      console.error('[Request Submission]', err);
      setErrorMessage(err.message || 'A network error occurred while communicating with the concierge desk.');
    } finally {
      setSubmitting(false);
    }
  };

  // Structured Submit (Summary -> Final Submit)
  const handleStructuredSubmit = () => {
    const synthesizedPrompt = buildSynthesizedPrompt(form);
    executeSubmission(synthesizedPrompt, form.urgency);
  };

  // Natural Submit
  const handleNaturalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim() || submitting) return;
    executeSubmission(naturalText.trim(), naturalUrgency);
  };

  // Voice Transcript Handlers
  const handleVoiceTranscript = (transcript: string) => {
    setNaturalText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    // Also auto-fill into structured form so customer has both options
    void handleAutoFillFromText(transcript);
  };

  return (
    <section id="new-request" className={`bg-white rounded-2xl border border-[#E1E5E8] p-6 sm:p-8 shadow-xs ${className}`}>
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[#E1E5E8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
              <Sparkles className="h-3 w-3 text-[#1F2933]" />
              <span>Concierge Request Flow</span>
            </span>
            {entitlement.freeRequestAvailable && !entitlement.hasActiveMembership && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                {entitlement.complimentaryRequestsRemaining ?? 3} Free Left
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#1F2933]">
            What can we handle for you?
          </h2>
          <p className="text-xs text-[#66717C] mt-1 font-sans">
            Choose what you need, tell us the essentials, and we&apos;ll take it from there.
          </p>
        </div>

        {/* Mode Toggle: Structured vs Natural Voice */}
        <div className="flex items-center p-1 bg-[#F1F3F5] rounded-xl border border-[#E1E5E8] text-xs shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('STRUCTURED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === 'STRUCTURED'
                ? 'bg-white text-[#1F2933] shadow-2xs'
                : 'text-[#66717C] hover:text-[#1F2933]'
            }`}
          >
            Guided Request
          </button>
          <button
            type="button"
            onClick={() => setMode('NATURAL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'NATURAL'
                ? 'bg-white text-[#1F2933] shadow-2xs'
                : 'text-[#66717C] hover:text-[#1F2933]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#66717C]" />
            <span>Tell Proventa / Voice</span>
          </button>
        </div>
      </div>

      {/* Error & Feedback Alerts */}
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-fade-in shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-rose-900">Request Not Dispatched</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {parseMessage && (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{parseMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: STRUCTURED GUIDED REQUEST FLOW                                     */}
      {/* ========================================================================= */}
      {mode === 'STRUCTURED' && (
        <div className="space-y-6">
          {step === 1 ? (
            <>
              {/* Service Cards Selector Grid */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
                  1. Select Service
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {SERVICES.map((srv) => {
                    const isSelected = form.service === srv.id;
                    const Icon = srv.icon;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleServiceSelect(srv.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1F2933] text-white border-[#1F2933] shadow-xs'
                            : 'bg-[#F7F8FA] hover:bg-white text-[#1F2933] border-[#E1E5E8] hover:border-[#A7B0B8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-[#66717C]'}`} />
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#1F2933]'}`}>
                            {srv.label}
                          </p>
                          <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#A7B0B8]' : 'text-[#66717C]'}`}>
                            {srv.shortDesc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Service-Specific Form Fields */}
              <div className="pt-3 border-t border-[#E1E5E8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#66717C]">
                    2. Provide Details for {SERVICES.find((s) => s.id === form.service)?.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#66717C] font-medium shrink-0">Urgency:</span>
                    {(['NORMAL', 'URGENT', 'ASAP'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleUpdateForm({ urgency: lvl })}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                          form.urgency === lvl
                            ? 'bg-[#1F2933] text-white font-semibold'
                            : 'bg-[#F1F3F5] text-[#66717C] hover:bg-[#E5E9ED]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <ServiceSpecificFields
                  form={form}
                  onChange={handleUpdateForm}
                  activeStep={step}
                />
              </div>

              {/* Navigation to Summary */}
              <div className="pt-4 border-t border-[#E1E5E8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode('NATURAL')}
                  className="text-xs text-[#66717C] hover:text-[#1F2933] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Or just tell Proventa what you need</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  <span>Review Request</span>
                  <ArrowRight className="h-4 w-4 text-[#A7B0B8]" />
                </button>
              </div>
            </>
          ) : (
            /* Step 2: Confirmation Summary Card before Dispatch */
            <RequestSummaryCard
              form={form}
              onEdit={() => setStep(1)}
              onSubmit={handleStructuredSubmit}
              isSubmitting={submitting}
              canCreateRequest={entitlement.canCreateRequest}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: NATURAL LANGUAGE & VOICE REQUEST FLOW                              */}
      {/* ========================================================================= */}
      {mode === 'NATURAL' && (
        <form onSubmit={handleNaturalSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              rows={4}
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder="e.g. I need flights from Ahmedabad to Mumbai on 15 October for 3 people under ₹20,000, or a table for 4 at Agashiye this Saturday."
              className="w-full p-4 border border-[#E1E5E8] bg-[#F7F8FA] focus:bg-white focus:border-[#1F2933] rounded-xl text-sm text-[#1F2933] focus:outline-none placeholder:text-[#A7B0B8] resize-none transition-colors shadow-2xs"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={submitting || isParsing}
              />
              <span className="text-[#E1E5E8] hidden sm:inline">&bull;</span>
              <span className="text-xs text-[#66717C] font-medium shrink-0">Urgency:</span>
              {(['NORMAL', 'URGENT', 'ASAP'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setNaturalUrgency(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    naturalUrgency === lvl
                      ? 'bg-[#1F2933] text-white font-semibold'
                      : 'bg-[#F1F3F5] text-[#66717C] hover:bg-[#E5E9ED]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* AI Auto-Fill into Guided Form Button */}
              {naturalText.trim().length > 10 && (
                <button
                  type="button"
                  onClick={() => handleAutoFillFromText(naturalText)}
                  disabled={isParsing || submitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#E1E5E8] bg-white hover:bg-[#F7F8FA] rounded-xl text-xs font-semibold text-[#1F2933] transition-colors cursor-pointer shadow-2xs"
                  title="Extract details and open structured form"
                >
                  {isParsing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1F2933]" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 text-[#1F2933]" />
                  )}
                  <span>Fill Guided Form</span>
                </button>
              )}

              <button
                type="submit"
                disabled={submitting || !naturalText.trim() || !entitlement.canCreateRequest}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F2933] hover:bg-[#111820] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Understanding...</span>
                  </>
                ) : (
                  <>
                    <span>Tell Proventa</span>
                    <ArrowRight className="h-4 w-4 text-[#A7B0B8]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Ahmedabad Delegation Prompts */}
          <div className="pt-2.5 border-t border-[#E1E5E8] flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x flex-nowrap -mx-1 px-1 sm:mx-0 sm:px-0 text-xs py-1">
            <span className="text-[#66717C] shrink-0 font-medium text-[11px]">Quick suggestions:</span>
            {[
              { label: 'Dinner at Agashiye', text: 'Reserve a quiet terrace table for 4 at Agashiye for Saturday 8:00 PM.' },
              { label: 'Flights to Mumbai', text: 'Find 2 business class flights from Ahmedabad to Mumbai on October 15 under ₹25,000.' },
              { label: 'Garba Passes', text: 'Book 3 VIP Garba passes in Ahmedabad for Navratri on October 15 under ₹6,000.' },
              { label: 'Airport Chauffeur', text: 'Arrange an executive sedan pickup from SVPIA Airport to Bodakdev tomorrow at 11:30 AM.' },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setNaturalText(s.text);
                  void handleAutoFillFromText(s.text);
                }}
                className="shrink-0 px-2.5 py-1 bg-[#F7F8FA] hover:bg-[#F1F3F5] border border-[#E1E5E8] text-[#1F2933] rounded-lg text-[11px] transition-colors cursor-pointer whitespace-nowrap"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>
      )}
    </section>
  );
}

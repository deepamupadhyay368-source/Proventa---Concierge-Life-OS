'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import type {
  MissionCandidateSupplier,
  StructuredMissionBrief,
} from '@/lib/marketplace/mission-types';

function MissionBuilderInner() {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('Within 2–4 weeks');
  const [urgency, setUrgency] = useState<'STANDARD' | 'URGENT' | 'CRITICAL'>('STANDARD');
  const [deliveryMode, setDeliveryMode] = useState<'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER'>('EITHER');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedBrief, setExtractedBrief] = useState<StructuredMissionBrief | null>(null);

  const [candidateSuppliers, setCandidateSuppliers] = useState<MissionCandidateSupplier[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounced AI Extraction Preview
  useEffect(() => {
    if (prompt.trim().length < 15) {
      setExtractedBrief(null);
      setCandidateSuppliers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsExtracting(true);
      try {
        const res = await fetch('/api/marketplace/missions/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naturalLanguagePrompt: prompt,
            structuredOverrides: {
              city,
              budgetMin: budgetMin ? Number(budgetMin) : undefined,
              budgetMax: budgetMax ? Number(budgetMax) : undefined,
              timeline,
              urgencyLevel: urgency,
              deliveryMode,
            },
          }),
        });
        const data = await res.json();
        if (data.brief) {
          setExtractedBrief(data.brief);
        }
      } catch {
        // ignore preview extraction errors
      } finally {
        setIsExtracting(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [prompt, city, budgetMin, budgetMax, timeline, urgency, deliveryMode]);

  async function handleLaunchMission(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      setErrorMessage('Please describe your requirement in at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/marketplace/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naturalLanguagePrompt: prompt,
          city,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          timeline,
          urgencyLevel: urgency,
          deliveryMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initialize mission.');
        setIsSubmitting(false);
        return;
      }

      const missionId = data.mission?.id;
      if (missionId) {
        router.push(`/missions/${missionId}`);
      } else {
        router.push('/missions');
      }
    } catch {
      setErrorMessage('Network error while launching mission. Please try again.');
      setIsSubmitting(false);
    }
  }

  function handleSelectAllSuppliers() {
    if (candidateSuppliers.length === selectedSupplierIds.size) {
      setSelectedSupplierIds(new Set());
    } else {
      setSelectedSupplierIds(new Set(candidateSuppliers.map((s) => s.businessId)));
    }
  }

  function toggleSupplier(businessId: string) {
    const next = new Set(selectedSupplierIds);
    if (next.has(businessId)) {
      next.delete(businessId);
    } else {
      next.add(businessId);
    }
    setSelectedSupplierIds(next);
  }

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* Editorial Header */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-12 lg:py-16">
        <div className="container-wide">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-[#A7A194] hover:text-[#F6F0E4] mb-5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Mission Workspace</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2.5 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  PROVENTA Mission Engine
                </span>
                <span className="text-[#4C4A40]">·</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                  AI Scope Extraction &amp; Verified RFQ Matching
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#F6F0E4] leading-[1.02]">
                Initialize a business <span className="text-[#B94E2D]">mission.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 text-sm text-[#A7A194] leading-relaxed">
              Describe what you need in plain English. Our engine structures your deliverables,
              identifies verified businesses, and dispatches customer-approved requests for quotation.
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-12 lg:py-16">
        <form onSubmit={handleLaunchMission} className="space-y-10">
          {errorMessage && (
            <div className="p-4 bg-[#9E2A2B] text-[#F6F0E4] font-mono text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Natural Language Input & Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5CBB8]">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                    01 — Describe Your Business Requirement
                  </span>
                  {isExtracting && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#B94E2D] animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      Structuring scope...
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-2">
                    Natural Language Scope &amp; Specifications *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., We need 500 units of custom 5-axis CNC machined anodized aluminum enclosures for an industrial IoT gateway. Delivery required in Changodar, Ahmedabad within 3 weeks. ISO 9001 certification required. Estimated budget ₹1.2 to ₹1.8 Lakhs..."
                    className="input-enterprise font-sans text-sm leading-relaxed"
                  />
                  <p className="mt-1.5 font-mono text-[11px] text-[#6B675E]">
                    Mention quantities, materials, location, quality certifications, or target dates.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D5CBB8] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                      Target City / Location
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-enterprise"
                    >
                      {BRAND_CONFIG.initialCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Pan-India">Pan-India / Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                      Fulfillment Mode
                    </label>
                    <select
                      value={deliveryMode}
                      onChange={(e) =>
                        setDeliveryMode(
                          e.target.value as 'ON_SITE' | 'REMOTE' | 'DELIVERY' | 'EITHER',
                        )
                      }
                      className="input-enterprise"
                    >
                      <option value="EITHER">Flexible / Either</option>
                      <option value="DELIVERY">Physical Delivery</option>
                      <option value="ON_SITE">On-Site Service</option>
                      <option value="REMOTE">Remote / Digital</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                      Budget Min (INR)
                    </label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="e.g. 50000"
                      className="input-enterprise font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                      Budget Max (INR)
                    </label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="e.g. 150000"
                      className="input-enterprise font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                      Timeline
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="input-enterprise"
                    >
                      <option value="Immediate / Urgent">Immediate / Urgent</option>
                      <option value="Within 1 week">Within 1 week</option>
                      <option value="Within 2–4 weeks">Within 2–4 weeks</option>
                      <option value="1 to 3 months">1 to 3 months</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-[0.08em] text-[#181914] mb-1.5">
                    Urgency Classification
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    {(['STANDARD', 'URGENT', 'CRITICAL'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`py-2 px-3 border transition-colors ${
                          urgency === lvl
                            ? 'bg-[#171A14] text-[#F6F0E4] border-[#171A14] font-semibold'
                            : 'bg-[#F5F0E5] text-[#181914] border-[#D5CBB8] hover:bg-[#E9DFCC]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Trigger Bar */}
              <div className="border border-[#D5CBB8] bg-[#E9DFCC] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-[#5C584F] leading-relaxed">
                  <strong className="block font-mono uppercase text-[#181914]">
                    Zero Platform Commission
                  </strong>
                  Quotes arrive directly from verified businesses. You review and approve every step.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-terracotta w-full sm:w-auto shrink-0"
                >
                  <span>{isSubmitting ? 'Launching Mission...' : 'Initialize Mission →'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Real-Time Structured AI Preview & Truth Inspection */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-[#4C4A40]/70 bg-[#171A14] text-[#F6F0E4] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#4C4A40]/70">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253] flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-[#B94E2D]" />
                    AI Structured Brief
                  </span>
                  {extractedBrief && (
                    <span className="badge-neutral text-[10px]">
                      {Math.round(extractedBrief.confidenceScore * 100)}% Confidence
                    </span>
                  )}
                </div>

                {extractedBrief ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="font-mono text-[10px] uppercase text-[#A7A194]">
                        Commercial Title
                      </div>
                      <div className="font-display text-xl text-[#F6F0E4] mt-0.5">
                        {extractedBrief.title}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#4C4A40]/50 font-mono text-[11px]">
                      <div>
                        <span className="text-[#A7A194] block">Sector</span>
                        <span className="text-[#F6F0E4] font-medium mt-0.5 block">
                          {extractedBrief.categoryName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A7A194] block">Target City</span>
                        <span className="text-[#F6F0E4] font-medium mt-0.5 block">
                          {extractedBrief.city}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#4C4A40]/50">
                      <div className="font-mono text-[10px] uppercase text-[#A7A194] mb-1.5">
                        Extracted Deliverables
                      </div>
                      <ul className="space-y-1 text-[#E9DFCC]">
                        {extractedBrief.deliverables.map((deliv, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#B94E2D] shrink-0 mt-0.5" />
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {extractedBrief.missingInformation.length > 0 && (
                      <div className="pt-3 border-t border-[#4C4A40]/50 bg-[#20211C] p-3 border border-[#4C4A40]">
                        <div className="font-mono text-[10px] uppercase text-[#B94E2D] flex items-center gap-1.5 mb-1.5">
                          <HelpCircle className="h-3.5 w-3.5" />
                          Recommended Clarifications
                        </div>
                        <ul className="space-y-1 text-[11px] text-[#A7A194]">
                          {extractedBrief.clarificationQuestions.map((q, idx) => (
                            <li key={idx}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[#A7A194] font-mono text-xs">
                    Start describing your requirement on the left to inspect real-time AI
                    specifications and candidate supplier matches.
                  </div>
                )}
              </div>

              {/* Protocol Safeguards */}
              <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 space-y-4 text-xs">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A98253] pb-2 border-b border-[#D5CBB8]">
                  Mission Engine Guarantees
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#181914]">Customer-Controlled Distribution</strong>
                    <span className="text-[#5C584F]">
                      No RFQs are sent until you review candidate businesses and approve distribution.
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#181914]">Side-by-Side Comparison</strong>
                    <span className="text-[#5C584F]">
                      Compare actual offers with transparent pricing, terms, and delivery schedules.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewMissionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F0E5] p-12 font-mono text-xs uppercase tracking-[0.14em]">
          Initializing Mission Builder...
        </div>
      }
    >
      <MissionBuilderInner />
    </Suspense>
  );
}

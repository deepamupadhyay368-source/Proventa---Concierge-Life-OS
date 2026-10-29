'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  History,
  IndianRupee,
  Layers,
  MapPin,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import type {
  MissionDTO,
  MissionStage,
  QuotationComparisonItem,
} from '@/lib/marketplace/mission-types';

const STAGE_ORDER: MissionStage[] = [
  'RFQ_PENDING_APPROVAL',
  'RFQ_DISPATCHED',
  'QUOTATIONS_RECEIVED',
  'IN_REVIEW',
  'OFFER_ACCEPTED',
  'COMPLETED',
];

const STAGE_LABELS: Record<MissionStage, string> = {
  DRAFT: 'Draft Brief',
  MATCHING: 'Supplier Matching',
  RFQ_PENDING_APPROVAL: 'RFQ Review',
  RFQ_DISPATCHED: 'Awaiting Quotes',
  QUOTATIONS_RECEIVED: 'Offers Received',
  IN_REVIEW: 'In Review',
  OFFER_ACCEPTED: 'Offer Awarded',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Fulfilled',
  CANCELLED: 'Cancelled',
};

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [mission, setMission] = useState<MissionDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'suppliers' | 'brief' | 'activity'>('quotes');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Supplier selection for RFQ approval
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Accept offer confirmation state
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  async function loadMission() {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/missions/${id}`);
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        if (data.mission.approvedSupplierIds?.length > 0) {
          setSelectedSupplierIds(new Set(data.mission.approvedSupplierIds));
        } else if (data.mission.candidateSuppliers?.length > 0) {
          // Pre-select top candidates by default
          setSelectedSupplierIds(
            new Set(data.mission.candidateSuppliers.slice(0, 3).map((s: { businessId: string }) => s.businessId)),
          );
        }
      } else {
        setActionError(data.error || 'Failed to load mission.');
      }
    } catch {
      setActionError('Network error while retrieving mission.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMission();
  }, [id]);

  async function handleApproveRfqDistribution() {
    if (selectedSupplierIds.size === 0) {
      setActionError('Please select at least one candidate business to invite.');
      return;
    }

    setIsProcessingAction(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const res = await fetch(`/api/marketplace/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_RFQ_DISTRIBUTION',
          supplierIds: Array.from(selectedSupplierIds),
        }),
      });
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        setActionNotice(`RFQs successfully dispatched to ${selectedSupplierIds.size} verified vendor consoles.`);
        setActiveTab('quotes');
      } else {
        setActionError(data.error || 'Could not approve RFQ distribution.');
      }
    } catch {
      setActionError('Failed to dispatch RFQ.');
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleShortlistQuote(quotationId: string) {
    setIsProcessingAction(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const res = await fetch(`/api/marketplace/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SHORTLIST_QUOTATION',
          quotationId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        setActionNotice('Quotation shortlisted. Vendor coordinate access activated.');
      } else {
        setActionError(data.error || 'Could not shortlist quotation.');
      }
    } catch {
      setActionError('Failed to shortlist.');
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleAcceptQuote(quotationId: string) {
    setIsProcessingAction(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const res = await fetch(`/api/marketplace/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT_QUOTATION',
          quotationId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        setAcceptingQuoteId(null);
        setActionNotice('Commercial offer accepted! Mission awarded to supplier.');
      } else {
        setActionError(data.error || 'Could not accept quotation.');
      }
    } catch {
      setActionError('Failed to accept quotation.');
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleConciergeFallback() {
    setIsProcessingAction(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const res = await fetch(`/api/marketplace/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONCIERGE_FALLBACK',
          note: 'Customer activated human concierge sourcing fallback for specialized enterprise fulfillment.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        setActionNotice('PROVENTA Concierge Sourcing activated. An industry sourcing manager will contact verified partners directly.');
      }
    } catch {
      setActionError('Failed to activate concierge fallback.');
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleConfirmCompletion() {
    setIsProcessingAction(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/marketplace/missions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_COMPLETION',
          note: 'Customer confirmed all deliverables fulfilled satisfactorily.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.mission) {
        setMission(data.mission);
        setActionNotice('Mission marked completed. Commercial transaction finalized in the ledger.');
      }
    } catch {
      setActionError('Failed to confirm completion.');
    } finally {
      setIsProcessingAction(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E5] p-12 font-mono text-xs uppercase tracking-[0.14em]">
        Synchronizing Mission Cockpit...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-[#F5F0E5] py-16">
        <div className="container-narrow border border-[#D5CBB8] bg-[#FAF6EC] p-8">
          <h1 className="font-display text-2xl text-[#181914]">Mission Not Found</h1>
          <p className="mt-2 text-sm text-[#5C584F]">
            This mission may have been closed or is not accessible with your current credentials.
          </p>
          <div className="mt-6">
            <Link href="/missions" className="btn-secondary">
              ← Return to Mission Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(mission.missionStage);
  const quotations = mission.quotations || [];
  const candidateSuppliers = mission.candidateSuppliers || [];
  const activities = mission.activities || [];

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* Header Banner */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-10 lg:py-14">
        <div className="container-wide">
          <Link
            href="/missions"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-[#A7A194] hover:text-[#F6F0E4] mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Mission Workspace</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2 font-mono text-xs">
                <span className="badge-verified">{mission.referenceCode}</span>
                <span className="text-[#A98253]">{mission.categoryName}</span>
                <span className="text-[#4C4A40]">·</span>
                <span className="text-[#A7A194]">{mission.city}</span>
                {mission.conciergeFallback && (
                  <span className="badge-bronze text-[10px]">Concierge Assisted</span>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#F6F0E4]">
                {mission.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {mission.missionStage === 'OFFER_ACCEPTED' && (
                <button
                  type="button"
                  onClick={handleConfirmCompletion}
                  disabled={isProcessingAction}
                  className="btn-terracotta"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Mission Completion</span>
                </button>
              )}
              {!mission.conciergeFallback && mission.missionStage !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={handleConciergeFallback}
                  disabled={isProcessingAction}
                  className="inline-flex items-center gap-2 border border-[#4C4A40] bg-[#20211C] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-[#E9DFCC] hover:border-[#A98253] transition-colors"
                >
                  <Compass className="h-4 w-4 text-[#A98253]" />
                  <span>Request Concierge Sourcing</span>
                </button>
              )}
            </div>
          </div>

          {/* Mission Progress Stepper */}
          <div className="mt-10 pt-6 border-t border-[#4C4A40]/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STAGE_ORDER.map((stage, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={stage}
                    className={`p-3 border font-mono text-xs transition-colors ${
                      isCurrent
                        ? 'border-[#B94E2D] bg-[#B94E2D]/15 text-[#F6F0E4]'
                        : isPassed
                          ? 'border-[#4C4A40] bg-[#20211C] text-[#A7A194]'
                          : 'border-[#4C4A40]/30 bg-[#171A14] text-[#4C4A40]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span>0{idx + 1}</span>
                      {isPassed && <Check className="h-3 w-3 text-[#B94E2D]" />}
                      {isCurrent && <span className="h-2 w-2 rounded-full bg-[#B94E2D]" />}
                    </div>
                    <div className="mt-1 font-semibold uppercase tracking-[0.1em] truncate">
                      {STAGE_LABELS[stage]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-10 lg:py-14">
        {actionNotice && (
          <div className="mb-6 p-4 border border-[#B94E2D] bg-[#B94E2D]/10 font-mono text-xs font-medium text-[#181914] flex items-center justify-between">
            <span>✓ {actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-[#6B675E] hover:text-[#181914]">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-6 p-4 border border-[#9E2A2B] bg-[#9E2A2B]/10 font-mono text-xs font-medium text-[#9E2A2B] flex items-center justify-between">
            <span>⚠ {actionError}</span>
            <button onClick={() => setActionError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Cockpit Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#D5CBB8] mb-8 font-mono text-xs uppercase tracking-[0.14em]">
          <button
            type="button"
            onClick={() => setActiveTab('quotes')}
            className={`px-6 py-3.5 border-t border-r first:border-l border-[#D5CBB8] transition-colors flex items-center gap-2 ${
              activeTab === 'quotes'
                ? 'bg-[#171A14] text-[#F6F0E4] font-semibold'
                : 'bg-[#FAF6EC] text-[#5C584F] hover:bg-[#E9DFCC] hover:text-[#181914]'
            }`}
          >
            <span>01 // Quotation Comparison</span>
            <span className="badge-neutral text-[10px]">{quotations.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-3.5 border-t border-r border-[#D5CBB8] transition-colors flex items-center gap-2 ${
              activeTab === 'suppliers'
                ? 'bg-[#171A14] text-[#F6F0E4] font-semibold'
                : 'bg-[#FAF6EC] text-[#5C584F] hover:bg-[#E9DFCC] hover:text-[#181914]'
            }`}
          >
            <span>02 // Candidate Suppliers</span>
            <span className="badge-neutral text-[10px]">{candidateSuppliers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            className={`px-6 py-3.5 border-t border-r border-[#D5CBB8] transition-colors flex items-center gap-2 ${
              activeTab === 'brief'
                ? 'bg-[#171A14] text-[#F6F0E4] font-semibold'
                : 'bg-[#FAF6EC] text-[#5C584F] hover:bg-[#E9DFCC] hover:text-[#181914]'
            }`}
          >
            <span>03 // AI Scope &amp; Brief</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3.5 border-t border-r border-[#D5CBB8] transition-colors flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'bg-[#171A14] text-[#F6F0E4] font-semibold'
                : 'bg-[#FAF6EC] text-[#5C584F] hover:bg-[#E9DFCC] hover:text-[#181914]'
            }`}
          >
            <span>04 // Activity Ledger</span>
            <span className="badge-neutral text-[10px]">{activities.length}</span>
          </button>
        </div>

        {/* TAB 01: SIDE-BY-SIDE QUOTATION COMPARISON DESK */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            {quotations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {quotations.map((quote) => {
                  const isAccepted = quote.status === 'ACCEPTED';
                  const isShortlisted = quote.status === 'SHORTLISTED';
                  return (
                    <div
                      key={quote.quotationId}
                      className={`border transition-all ${
                        isAccepted
                          ? 'border-[#B94E2D] bg-[#FAF6EC] ring-2 ring-[#B94E2D]'
                          : isShortlisted
                            ? 'border-[#A98253] bg-[#FAF6EC]'
                            : 'border-[#D5CBB8] bg-[#FAF6EC]'
                      } p-6 sm:p-7 flex flex-col justify-between`}
                    >
                      <div>
                        {/* Supplier Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#D5CBB8] font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#181914]">
                              {quote.referenceCode}
                            </span>
                            <span>·</span>
                            <Link
                              href={`/business/${quote.businessSlug}`}
                              className="font-bold underline hover:text-[#B94E2D]"
                            >
                              {quote.businessName}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            {quote.isVerified && (
                              <span className="badge-verified flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                {quote.verificationBadge}
                              </span>
                            )}
                            <span className="badge-neutral">{quote.status}</span>
                          </div>
                        </div>

                        {/* Proposal Summary */}
                        <h3 className="font-display text-2xl font-normal text-[#181914]">
                          {quote.summary}
                        </h3>
                        <p className="mt-2 text-sm text-[#5C584F] leading-relaxed">
                          {quote.detailedProposal}
                        </p>

                        {/* Deliverables & Inclusions */}
                        <div className="mt-4 pt-3 border-t border-[#D5CBB8]">
                          <div className="font-mono text-[10px] uppercase text-[#6B675E] mb-1.5">
                            Committed Inclusions &amp; Deliverables
                          </div>
                          <ul className="space-y-1 text-xs text-[#181914]">
                            {quote.inclusions.map((inc, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="h-3.5 w-3.5 text-[#B94E2D] shrink-0 mt-0.5" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Commercial Terms Metrics */}
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#D5CBB8] pt-3 font-mono text-xs">
                          <div>
                            <span className="text-[#6B675E] block text-[10px] uppercase">
                              Commercial Price
                            </span>
                            <span className="font-display text-xl text-[#181914] block mt-0.5">
                              {quote.priceAmount
                                ? `₹${quote.priceAmount.toLocaleString('en-IN')}`
                                : 'Custom Estimate'}
                            </span>
                            <span className="text-[10px] text-[#A98253]">
                              {quote.priceType === 'FIXED_QUOTE' ? 'Firm Fixed Quote' : 'Estimate'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[#6B675E] block text-[10px] uppercase">
                              Committed ETA
                            </span>
                            <span className="font-semibold text-sm text-[#181914] block mt-0.5">
                              {quote.deliveryTimeline}
                            </span>
                            <span className="text-[10px] text-[#6B675E]">Verified Turnaround</span>
                          </div>

                          <div>
                            <span className="text-[#6B675E] block text-[10px] uppercase">
                              Validity Window
                            </span>
                            <span className="font-semibold text-xs text-[#181914] block mt-0.5">
                              {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '14 Days'}
                            </span>
                            <span className="text-[10px] text-[#6B675E]">Official Proposal</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-6 pt-4 border-t border-[#D5CBB8] flex flex-wrap items-center justify-between gap-3">
                        <div className="font-mono text-[11px] text-[#6B675E]">
                          Transparent Score: {quote.transparentScore.overallScore}/100
                        </div>

                        <div className="flex items-center gap-2">
                          {!isAccepted && !isShortlisted && (
                            <button
                              type="button"
                              onClick={() => handleShortlistQuote(quote.quotationId)}
                              disabled={isProcessingAction}
                              className="inline-flex items-center gap-1.5 border border-[#D5CBB8] bg-[#F5F0E5] px-3.5 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[#181914] hover:border-[#181914] transition-colors"
                            >
                              <Bookmark className="h-3.5 w-3.5 text-[#A98253]" />
                              <span>Shortlist</span>
                            </button>
                          )}

                          {!isAccepted && (
                            <button
                              type="button"
                              onClick={() => setAcceptingQuoteId(quote.quotationId)}
                              disabled={isProcessingAction}
                              className="btn-terracotta py-2 px-4"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Accept Offer</span>
                            </button>
                          )}

                          {isAccepted && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#B94E2D]">
                              <CheckCircle2 className="h-4 w-4" />
                              AWARDED QUOTATION
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Accept Offer Modal / Confirmation Dialog */}
                      {acceptingQuoteId === quote.quotationId && (
                        <div className="mt-4 border-2 border-[#B94E2D] bg-[#FAF6EC] p-4 text-xs space-y-3">
                          <div className="font-mono uppercase font-semibold text-[#B94E2D]">
                            Confirm Commercial Award
                          </div>
                          <p className="text-[#5C584F]">
                            By accepting, you commit to awarding this requirement to{' '}
                            <strong>{quote.businessName}</strong> for{' '}
                            <strong>
                              {quote.priceAmount
                                ? `₹${quote.priceAmount.toLocaleString('en-IN')}`
                                : 'the agreed proposal price'}
                            </strong>
                            . All other competing proposals will be politely closed.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptQuote(quote.quotationId)}
                              disabled={isProcessingAction}
                              className="btn-terracotta py-1.5 px-3 text-[11px]"
                            >
                              Confirm Award &amp; Notify Supplier
                            </button>
                            <button
                              type="button"
                              onClick={() => setAcceptingQuoteId(null)}
                              className="btn-secondary py-1.5 px-3 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E9DFCC] text-[#B94E2D]">
                  <Clock className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl text-[#181914]">
                  Awaiting Supplier Quotations
                </h2>
                <p className="text-sm text-[#5C584F] max-w-lg mx-auto">
                  {mission.approvedSupplierIds.length > 0
                    ? `Your RFQ has been dispatched to ${mission.approvedSupplierIds.length} candidate businesses. Proposals with pricing and commitments will appear here as suppliers respond.`
                    : 'Review the matched businesses in the Candidate Suppliers tab and approve RFQ distribution to invite quotations.'}
                </p>
                {mission.approvedSupplierIds.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('suppliers')}
                    className="btn-terracotta"
                  >
                    <span>Inspect Candidate Suppliers →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 02: CANDIDATE SUPPLIERS & TRUTH SEPARATION */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-[#181914]">
                  Candidate Registered Suppliers ({candidateSuppliers.length})
                </h3>
                <p className="text-xs text-[#5C584F] mt-1">
                  Matched from real registered business records. Verified facts and supplier claims
                  are strictly separated.
                </p>
              </div>

              {mission.missionStage === 'RFQ_PENDING_APPROVAL' && (
                <button
                  type="button"
                  onClick={handleApproveRfqDistribution}
                  disabled={isProcessingAction || selectedSupplierIds.size === 0}
                  className="btn-terracotta shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {isProcessingAction
                      ? 'Dispatching...'
                      : `Approve & Dispatch RFQ (${selectedSupplierIds.size})`}
                  </span>
                </button>
              )}
            </div>

            {candidateSuppliers.length > 0 ? (
              <div className="space-y-4">
                {candidateSuppliers.map((supplier) => {
                  const isSelected = selectedSupplierIds.has(supplier.businessId);
                  return (
                    <div
                      key={supplier.businessId}
                      className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                    >
                      {/* Selection Control & Identification */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="flex items-start gap-3">
                          {mission.missionStage === 'RFQ_PENDING_APPROVAL' && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const next = new Set(selectedSupplierIds);
                                if (next.has(supplier.businessId)) next.delete(supplier.businessId);
                                else next.add(supplier.businessId);
                                setSelectedSupplierIds(next);
                              }}
                              className="h-4 w-4 mt-1 accent-[#B94E2D]"
                            />
                          )}
                          <div>
                            <Link
                              href={`/business/${supplier.businessSlug}`}
                              className="font-display text-2xl font-normal text-[#181914] hover:text-[#B94E2D] transition-colors"
                            >
                              {supplier.businessName}
                            </Link>
                            <div className="font-mono text-xs text-[#6B675E] mt-0.5">
                              {supplier.businessCity}
                              {supplier.verifiedFacts.establishedYear &&
                                ` · Est. ${supplier.verifiedFacts.establishedYear}`}
                            </div>
                          </div>
                        </div>

                        {supplier.supplierClaims.tagline && (
                          <p className="text-xs text-[#5C584F] italic">
                            &ldquo;{supplier.supplierClaims.tagline}&rdquo;
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {supplier.supplierClaims.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="badge-neutral text-[10px]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Truth Separation Column: Verified Facts vs Supplier Claims vs AI Fit */}
                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-[#D5CBB8] lg:pl-6 pt-4 lg:pt-0 font-mono text-xs">
                        {/* 1. Verified Facts */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase text-[#A98253] block font-semibold">
                            Verified Facts
                          </span>
                          <div className="space-y-1 text-[11px] text-[#181914]">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-[#B94E2D]" />
                              <span>{supplier.verifiedFacts.verificationBadge}</span>
                            </div>
                            {supplier.verifiedFacts.gstVerified && (
                              <div className="flex items-center gap-1.5 text-[#6B675E]">
                                <Check className="h-3 w-3" />
                                <span>GST Registered</span>
                              </div>
                            )}
                            <div className="text-[#6B675E]">
                              {supplier.verifiedFacts.activeOfferingsCount} Active Listings
                            </div>
                          </div>
                        </div>

                        {/* 2. Supplier Claims */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase text-[#6B675E] block font-semibold">
                            Supplier Claims
                          </span>
                          <div className="space-y-1 text-[11px] text-[#5C584F]">
                            {supplier.supplierClaims.highlights.slice(0, 2).map((h, i) => (
                              <div key={i} className="truncate">
                                • {h}
                              </div>
                            ))}
                            {supplier.supplierClaims.turnaroundClaim && (
                              <div className="text-[#A98253]">
                                ⚡ {supplier.supplierClaims.turnaroundClaim}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. AI Estimates */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase text-[#B94E2D] block font-semibold">
                            AI Relevance Fit
                          </span>
                          <div className="space-y-1 text-[11px]">
                            <div className="font-display text-lg text-[#181914]">
                              {supplier.matchScore}% Match
                            </div>
                            <div className="text-[#6B675E] text-[10px]">
                              {supplier.matchReasons[0] || 'Category & geography aligned'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 text-center space-y-4">
                <AlertCircle className="h-8 w-8 text-[#A98253] mx-auto" />
                <h3 className="font-display text-2xl text-[#181914]">
                  No Matching Businesses Found in {mission.city}
                </h3>
                <p className="text-sm text-[#5C584F] max-w-md mx-auto">
                  We did not find any registered business that fits this exact category in this location yet.
                  You can broaden to Pan-India or activate PROVENTA Concierge Assisted Sourcing.
                </p>
                <button
                  type="button"
                  onClick={handleConciergeFallback}
                  disabled={isProcessingAction}
                  className="btn-terracotta"
                >
                  <Compass className="h-4 w-4" />
                  <span>Request Concierge Sourcing Fallback</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 03: STRUCTURED AI BRIEF */}
        {activeTab === 'brief' && (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 sm:p-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D5CBB8]">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                  Mission Specifications
                </span>
                <h2 className="font-display text-3xl font-normal text-[#181914] mt-1">
                  {mission.title}
                </h2>
              </div>
              {mission.aiBrief && (
                <span className="badge-neutral font-mono text-xs">
                  AI Extracted ({Math.round(mission.aiBrief.confidenceScore * 100)}% Confidence)
                </span>
              )}
            </div>

            <p className="text-sm text-[#5C584F] leading-relaxed max-w-3xl">
              {mission.description}
            </p>

            {mission.aiBrief?.deliverables && (
              <div className="pt-4 border-t border-[#D5CBB8]">
                <div className="font-mono text-xs uppercase text-[#A98253] mb-3">
                  Scope Deliverables
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mission.aiBrief.deliverables.map((deliv, i) => (
                    <div key={i} className="p-3 border border-[#D5CBB8] bg-[#F5F0E5] text-xs flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D5CBB8] font-mono text-xs">
              <div>
                <span className="text-[#6B675E] block text-[10px] uppercase">Category</span>
                <span className="font-semibold text-[#181914] mt-1 block">{mission.categoryName}</span>
              </div>
              <div>
                <span className="text-[#6B675E] block text-[10px] uppercase">Location</span>
                <span className="font-semibold text-[#181914] mt-1 block">{mission.city}</span>
              </div>
              <div>
                <span className="text-[#6B675E] block text-[10px] uppercase">Budget</span>
                <span className="font-semibold text-[#181914] mt-1 block">
                  {mission.budgetMax ? `₹${mission.budgetMin || 0} – ₹${mission.budgetMax}` : 'Open'}
                </span>
              </div>
              <div>
                <span className="text-[#6B675E] block text-[10px] uppercase">Timeline</span>
                <span className="font-semibold text-[#181914] mt-1 block">{mission.timeline || 'Standard'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 04: ACTIVITY AUDIT HISTORY */}
        {activeTab === 'activity' && (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 sm:p-10 space-y-6">
            <div className="pb-4 border-b border-[#D5CBB8]">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                Audit History
              </span>
              <h2 className="font-display text-2xl text-[#181914] mt-1">
                Mission Execution Ledger
              </h2>
            </div>

            <div className="space-y-4">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 border border-[#D5CBB8] bg-[#F5F0E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#6B675E] mb-1">
                      <span className="font-bold text-[#181914]">{act.actorRole}</span>
                      <span>·</span>
                      <span>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                    <strong className="block text-sm font-medium text-[#181914]">
                      {act.title}
                    </strong>
                    {act.description && (
                      <p className="mt-0.5 text-[#5C584F]">{act.description}</p>
                    )}
                  </div>
                  <span className="badge-neutral font-mono text-[10px] shrink-0">{act.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bookmark, Check, Plus, X } from 'lucide-react';
import {
  BusinessQuotationDTO,
  CustomerEnquiryDTO,
} from '@/lib/marketplace/types';

export default function CustomerDashboardPage() {
  const [enquiries, setEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/enquiries?mode=customer');
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchEnquiries();
  }, []);

  async function handleQuotationDecision(
    quotationId: string,
    status: 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED',
    label: string,
  ) {
    setStatusMessage(null);
    const res = await fetch(`/api/marketplace/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setStatusMessage(label);
      await fetchEnquiries();
    }
  }

  const totalQuotations = enquiries.reduce(
    (acc, e) => acc + (e.quotations?.length || 0),
    0,
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-10 lg:py-14">
        <div className="container-wide flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                Customer Enquiry &amp; Quotation Workspace
              </span>
              <span className="text-[#4C4A40]">·</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                Track Requirements &amp; Proposals
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#F6F0E4]">
              My Enquiries &amp; <span className="text-[#B94E2D]">Quotations.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 border border-[#4C4A40] bg-[#20211C] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F6F0E4] hover:border-[#A98253] transition-colors"
            >
              <span>Browse Directory</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/enquiries/new" className="btn-terracotta">
              <Plus className="h-4 w-4" />
              <span>Post New Enquiry</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="container-wide py-10 lg:py-14">
        {/* Summary Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#D5CBB8] bg-[#FAF6EC] divide-y sm:divide-y-0 sm:divide-x divide-[#D5CBB8] mb-8">
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Submitted Enquiries
            </div>
            <div className="mt-2 font-display text-3xl text-[#181914]">
              {String(enquiries.length).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Received Quotations
            </div>
            <div className="mt-2 font-display text-3xl text-[#181914]">
              {String(totalQuotations).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Contact Privacy
            </div>
            <div className="mt-2 font-mono text-xs font-semibold text-[#181914] uppercase tracking-[0.1em]">
              Active · Protected Until Selection
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 border border-[#B94E2D] bg-[#B94E2D]/10 font-mono text-xs font-medium text-[#181914]">
            ✓ {statusMessage}
          </div>
        )}

        {loading ? (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-12 font-mono text-xs uppercase tracking-[0.14em] text-[#6B675E]">
            Loading your enquiries and quotations...
          </div>
        ) : enquiries.length > 0 ? (
          <div className="space-y-6">
            {enquiries.map((enq) => {
              const quotations = enq.quotations || [];
              const budgetLabel = enq.budgetMax
                ? `₹${(enq.budgetMin || 0).toLocaleString('en-IN')} – ₹${enq.budgetMax.toLocaleString('en-IN')}`
                : 'Open';
              return (
                <section
                  key={enq.id}
                  className="border border-[#D5CBB8] bg-[#FAF6EC]"
                >
                  <div className="p-6 border-b border-[#D5CBB8]">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D5CBB8] font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="badge-neutral">{enq.referenceCode}</span>
                        <span className="text-[#6B675E] uppercase">
                          {enq.categoryName} · {enq.city}
                        </span>
                      </div>
                      <span className="badge-verified">{enq.status}</span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#181914]">
                      {enq.title}
                    </h2>
                    <p className="mt-2 text-sm text-[#5C584F] leading-relaxed">
                      {enq.description}
                    </p>

                    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#D5CBB8] font-mono text-xs">
                      <div>
                        <dt className="text-[#6B675E]">QUANTITY / VOLUME</dt>
                        <dd className="font-semibold text-[#181914] mt-0.5">
                          {enq.quantity || 'Standard'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#6B675E]">BUDGET</dt>
                        <dd className="font-semibold text-[#181914] mt-0.5">
                          {budgetLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#6B675E]">TIMELINE</dt>
                        <dd className="font-semibold text-[#181914] mt-0.5">
                          {enq.timeline || 'Flexible'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#6B675E]">QUOTATIONS</dt>
                        <dd className="font-semibold text-[#181914] mt-0.5">
                          {quotations.length} Received
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Quotations Sub-Ledger */}
                  <div className="p-6 bg-[#E9DFCC]/50">
                    <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#A98253] mb-4">
                      Business Quotations ({quotations.length})
                    </div>

                    {quotations.length > 0 ? (
                      <div className="space-y-3">
                        {quotations.map((q: BusinessQuotationDTO) => (
                          <div
                            key={q.id}
                            className="border border-[#D5CBB8] bg-[#FAF6EC] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-1.5">
                                <span className="font-semibold text-[#181914]">
                                  {q.referenceCode}
                                </span>
                                <span>·</span>
                                <Link
                                  href={`/business/${q.businessSlug || ''}`}
                                  className="underline font-semibold text-[#181914] hover:text-[#B94E2D]"
                                >
                                  {q.businessName || 'Verified Business'}
                                </Link>
                                <span className="badge-verified">{q.status}</span>
                              </div>
                              <h3 className="font-display text-2xl font-normal text-[#181914]">
                                {q.summary}
                              </h3>
                              <p className="mt-1 text-xs text-[#5C584F] leading-relaxed">
                                {q.detailedProposal}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#D5CBB8]">
                              <div className="font-mono text-right">
                                <div className="text-lg font-semibold text-[#181914]">
                                  {q.priceAmount
                                    ? `₹${q.priceAmount.toLocaleString('en-IN')}`
                                    : 'Custom Estimate'}
                                </div>
                                {q.deliveryTimeline && (
                                  <div className="text-[11px] text-[#6B675E]">
                                    ETA: {q.deliveryTimeline}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {q.status !== 'SHORTLISTED' && q.status !== 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuotationDecision(
                                        q.id,
                                        'SHORTLISTED',
                                        'Quotation added to your shortlist.',
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 border border-[#D5CBB8] bg-[#F5F0E5] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#181914] hover:border-[#181914] transition-colors"
                                  >
                                    <Bookmark className="h-3.5 w-3.5 text-[#A98253]" />
                                    <span>Shortlist</span>
                                  </button>
                                )}

                                {q.status !== 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuotationDecision(
                                        q.id,
                                        'ACCEPTED',
                                        'Quotation accepted. The business has been notified.',
                                      )
                                    }
                                    className="btn-terracotta py-2 px-4"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Accept Quotation</span>
                                  </button>
                                )}

                                {q.status !== 'REJECTED' && q.status !== 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuotationDecision(
                                        q.id,
                                        'REJECTED',
                                        'Quotation declined.',
                                      )
                                    }
                                    className="inline-flex items-center gap-1 border border-[#D5CBB8] bg-[#FAF6EC] px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#6B675E] hover:text-[#9E2A2B] hover:border-[#9E2A2B] transition-colors"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    <span>Decline</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-[#6B675E]">
                        Awaiting business quotations. Matching businesses can respond with
                        structured proposals.
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D] block mb-3">
              No Enquiries Yet
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#181914]">
              Post your first business enquiry or explore the directory.
            </h2>
            <p className="mt-3 text-sm text-[#5C584F] max-w-2xl">
              Submit a requirement for any product or service across 18 industry
              categories to receive structured quotations here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/enquiries/new" className="btn-terracotta">
                <span>Post an Enquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-secondary">
                <span>Browse Business Directory</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

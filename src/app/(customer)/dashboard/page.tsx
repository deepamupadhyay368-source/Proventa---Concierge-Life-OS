'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
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

  async function handleAcceptQuotation(quotationId: string) {
    setStatusMessage(null);
    const res = await fetch(`/api/marketplace/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    if (res.ok) {
      setStatusMessage('QUOTATION ACCEPTED. COMMERCIAL AWARD RECORDED IN LEDGER.');
      await fetchEnquiries();
    }
  }

  const totalQuotations = enquiries.reduce(
    (acc, e) => acc + (e.quotations?.length || 0),
    0,
  );

  return (
    <div className="py-10 lg:py-14">
      <div className="container-wide">
        {/* Header */}
        <div className="border-b-2 border-[#0D0E11] pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="index-code-lime">BUYER WORKSPACE // RFQ LEDGER</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                ENQUIRIES &amp; COMMERCIAL QUOTATIONS
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[-0.04em] text-[#0D0E11]">
              PROCUREMENT &amp; ENQUIRY LEDGER.
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href="/businesses" className="btn-secondary">
              <span>BROWSE DIRECTORY</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/enquiries/new" className="btn-accent">
              <Plus className="h-4 w-4" />
              <span>DISPATCH NEW ENQUIRY</span>
            </Link>
          </div>
        </div>

        {/* Summary Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#0D0E11] bg-[#FAF8F3] divide-y sm:divide-y-0 sm:divide-x divide-[#0D0E11] mb-8 font-mono">
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              DISPATCHED ENQUIRIES
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0D0E11]">
              {String(enquiries.length).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              RECEIVED QUOTATIONS
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0D0E11]">
              {String(totalQuotations).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              BUYER PROTECTION
            </div>
            <div className="mt-2 text-sm font-bold text-[#0D0E11]">
              ACTIVE // CONTACT REDACTED
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 border border-[#0D0E11] bg-[#C8F904] font-mono text-xs font-bold text-[#0D0E11]">
            ✓ {statusMessage}
          </div>
        )}

        {loading ? (
          <div className="border border-[#0D0E11] bg-[#FAF8F3] p-12 font-mono text-xs uppercase tracking-[0.14em]">
            SYNCHRONIZING BUYER LEDGER...
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
                  className="border-2 border-[#0D0E11] bg-[#FAF8F3]"
                >
                  <div className="p-6 border-b border-[#0D0E11]">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#CFCAC0] font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="index-code">{enq.referenceCode}</span>
                        <span className="text-[#52514E] uppercase">
                          {enq.categoryName} · {enq.city}
                        </span>
                      </div>
                      <span className="index-code-lime">{enq.status}</span>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-[#0D0E11]">
                      {enq.title}
                    </h2>
                    <p className="mt-2 text-sm text-[#52514E]">{enq.description}</p>

                    <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#CFCAC0] font-mono text-xs">
                      <div>
                        <dt className="text-[#52514E]">QUANTITY / VOLUME</dt>
                        <dd className="font-bold text-[#0D0E11]">
                          {enq.quantity || 'Standard'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#52514E]">BUDGET</dt>
                        <dd className="font-bold text-[#0D0E11]">{budgetLabel}</dd>
                      </div>
                      <div>
                        <dt className="text-[#52514E]">TIMELINE</dt>
                        <dd className="font-bold text-[#0D0E11]">
                          {enq.timeline || 'Flexible'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#52514E]">QUOTATIONS</dt>
                        <dd className="font-bold text-[#0D0E11]">
                          {quotations.length} RECEIVED
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Quotations Sub-Ledger */}
                  <div className="p-6 bg-[#EAE5DA]/60">
                    <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11] mb-4">
                      VENDOR QUOTATIONS ({quotations.length})
                    </div>

                    {quotations.length > 0 ? (
                      <div className="space-y-3">
                        {quotations.map((q: BusinessQuotationDTO) => (
                          <div
                            key={q.id}
                            className="border border-[#0D0E11] bg-[#FAF8F3] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 font-mono text-xs mb-1">
                                <span className="font-bold text-[#0D0E11]">
                                  {q.referenceCode}
                                </span>
                                <span>·</span>
                                <Link
                                  href={`/business/${q.businessSlug || ''}`}
                                  className="underline font-bold text-[#0D0E11]"
                                >
                                  {q.businessName || 'Verified Vendor'}
                                </Link>
                                <span className="index-code-lime">{q.status}</span>
                              </div>
                              <h3 className="font-display text-lg font-bold text-[#0D0E11]">
                                {q.summary}
                              </h3>
                              <p className="mt-1 text-xs text-[#52514E]">
                                {q.detailedProposal}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#CFCAC0]">
                              <div className="font-mono text-right">
                                <div className="text-lg font-bold text-[#0D0E11]">
                                  {q.priceAmount
                                    ? `₹${q.priceAmount.toLocaleString('en-IN')}`
                                    : 'Custom Estimate'}
                                </div>
                                {q.deliveryTimeline && (
                                  <div className="text-[11px] text-[#52514E]">
                                    ETA: {q.deliveryTimeline}
                                  </div>
                                )}
                              </div>

                              {q.status !== 'ACCEPTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptQuotation(q.id)}
                                  className="btn-accent py-2 px-4"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>ACCEPT QUOTATION</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-[#52514E]">
                        AWAITING VENDOR PROPOSALS. MATCHING BUSINESSES CAN RESPOND WITH FORMAL
                        QUOTATIONS.
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
            <span className="index-code-lime mb-3">EMPTY LEDGER</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
              DISPATCH YOUR FIRST BUYER ENQUIRY OR BROWSE THE DIRECTORY.
            </h2>
            <p className="mt-3 text-sm text-[#52514E] max-w-2xl">
              Submit a requirement for any product or service across 18 industry sectors to
              receive structured quotations here.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/enquiries/new" className="btn-primary">
                <span>POST BUYER ENQUIRY</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-secondary">
                <span>BROWSE BUSINESS DIRECTORY</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

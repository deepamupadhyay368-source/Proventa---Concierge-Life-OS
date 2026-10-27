'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Building2,
  CheckCircle2,
  Star,
  Clock,
  MapPin,
  Loader2,
  ArrowRight,
  MessageSquareQuote,
} from 'lucide-react';
import type {
  CustomerEnquiryDTO,
  BusinessQuotationDTO,
} from '@/lib/marketplace/types';

export default function CustomerDashboardPage() {
  const [enquiries, setEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [quotationsByEnquiry, setQuotationsByEnquiry] = useState<
    Record<string, BusinessQuotationDTO[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enquiries?scope=mine');
      if (res.ok) {
        const data = await res.json();
        const items: CustomerEnquiryDTO[] = data.items || [];
        setEnquiries(items);

        const quotesMap: Record<string, BusinessQuotationDTO[]> = {};
        await Promise.all(
          items.map(async (enq) => {
            const qRes = await fetch(
              `/api/enquiries/${enq.id}/quotations`,
            );
            if (qRes.ok) {
              const qData = await qRes.json();
              quotesMap[enq.id] = qData.quotations || [];
            }
          }),
        );
        setQuotationsByEnquiry(quotesMap);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleQuotationDecision(
    enquiryId: string,
    quotationId: string,
    action: 'SHORTLIST' | 'ACCEPT' | 'DECLINE',
  ) {
    setActionLoading(quotationId);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/quotations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId, action }),
      });
      if (res.ok) {
        await loadDashboard();
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="surface-card py-16 flex items-center justify-center gap-2.5 text-[14px] text-[#696D76]">
        <Loader2 className="w-4 h-4 animate-spin text-[#304FFE]" />
        <span>Loading your enquiries and quotations…</span>
      </div>
    );
  }

  const totalQuotesReceived = Object.values(quotationsByEnquiry).reduce(
    (sum, list) => sum + list.length,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
            Customer Enquiry &amp; Quotation Workspace
          </span>
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.03em] text-[#15171B] mt-1">
            My Requirements &amp; Received Quotes
          </h1>
          <p className="text-[14px] text-[#696D76] mt-1">
            Compare structured quotations from matched businesses, shortlist top offers, or explore verified storefronts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/businesses" className="btn-secondary">
            <Building2 className="w-4 h-4" />
            <span>Explore Businesses</span>
          </Link>
          <Link href="/enquiries/new" className="btn-accent">
            <PlusCircle className="w-4 h-4" />
            <span>Post New Enquiry</span>
          </Link>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Total Enquiries Posted
          </p>
          <p className="text-[28px] font-bold text-[#15171B] mt-1">
            {enquiries.length}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Quotations Received
          </p>
          <p className="text-[28px] font-bold text-[#304FFE] mt-1">
            {totalQuotesReceived}
          </p>
        </div>
        <div className="surface-card p-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
              Own a Business?
            </p>
            <p className="text-[14px] font-semibold text-[#15171B] mt-1">
              Launch your storefront
            </p>
          </div>
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-1 rounded-[8px] border border-[#E8E9ED] bg-[#FAFAF8] hover:bg-[#F2F3F6] px-3 py-2 text-[12px] font-semibold text-[#15171B] transition-colors"
          >
            <span>Business Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Enquiries & Quotations List */}
      {enquiries.length > 0 ? (
        <div className="space-y-6">
          {enquiries.map((enq) => {
            const quotes = quotationsByEnquiry[enq.id] || [];
            return (
              <div key={enq.id} className="surface-card p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E9ED]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-mono font-semibold text-[#304FFE]">
                        {enq.referenceCode}
                      </span>
                      <span className="badge-neutral">{enq.status}</span>
                      {enq.categoryName && (
                        <span className="text-[12px] font-medium text-[#696D76]">
                          {enq.categoryName}
                        </span>
                      )}
                    </div>
                    <h2 className="text-[20px] font-bold text-[#15171B] mt-1.5">
                      {enq.title}
                    </h2>
                  </div>

                  <div className="text-[12px] text-[#696D76] flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {enq.city}, {enq.state}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{' '}
                      {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-[14px] text-[#696D76] leading-relaxed">
                  {enq.description}
                </p>

                {/* Quotations Comparison Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] flex items-center gap-1.5">
                      <MessageSquareQuote className="w-4 h-4 text-[#304FFE]" />
                      <span>Received Quotations ({quotes.length})</span>
                    </h3>
                  </div>

                  {quotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quotes.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] p-5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <Link
                                href={`/business/${q.businessSlug}`}
                                className="font-bold text-[15px] text-[#15171B] hover:text-[#304FFE] transition-colors"
                              >
                                {q.businessName}
                              </Link>
                              <span
                                className={
                                  q.status === 'ACCEPTED'
                                    ? 'badge-verified'
                                    : q.status === 'SHORTLISTED'
                                      ? 'badge-accent'
                                      : 'badge-neutral'
                                }
                              >
                                {q.status}
                              </span>
                            </div>

                            <div className="mt-2.5 text-[18px] font-bold text-[#15171B]">
                              {q.priceAmount
                                ? `₹${q.priceAmount.toLocaleString('en-IN')}`
                                : q.summary}
                              {q.priceUnit ? (
                                <span className="text-[12px] font-normal text-[#696D76]">
                                  {' '}
                                  / {q.priceUnit}
                                </span>
                              ) : null}
                            </div>

                            <p className="text-[13px] text-[#696D76] mt-2 leading-relaxed">
                              {q.detailedProposal || q.summary}
                            </p>

                            {q.deliveryTimeline && (
                              <div className="text-[12px] text-[#696D76] mt-2">
                                <strong className="text-[#15171B]">Timeline:</strong>{' '}
                                {q.deliveryTimeline}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-[#E8E9ED] flex flex-wrap items-center gap-2">
                            <button
                              disabled={actionLoading === q.id}
                              onClick={() =>
                                handleQuotationDecision(
                                  enq.id,
                                  q.id,
                                  'SHORTLIST',
                                )
                              }
                              className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-[8px] border border-[#E8E9ED] bg-[#FFFFFF] hover:bg-[#F2F3F6] text-[#15171B] transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 text-[#304FFE]" />
                              <span>Shortlist</span>
                            </button>
                            <button
                              disabled={actionLoading === q.id}
                              onClick={() =>
                                handleQuotationDecision(enq.id, q.id, 'ACCEPT')
                              }
                              className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#16845B] hover:bg-[#126B49] text-white transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Quote</span>
                            </button>
                            <button
                              disabled={actionLoading === q.id}
                              onClick={() =>
                                handleQuotationDecision(enq.id, q.id, 'DECLINE')
                              }
                              className="text-[12px] font-medium px-2.5 py-1.5 text-[#696D76] hover:text-[#C53B43] transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] p-5 text-[13px] text-[#696D76]">
                      No quotations submitted yet. Matched businesses in this category can view your requirement and respond with structured quotes.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="surface-card p-10 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#EEF1FF] text-[#304FFE]">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
          <h2 className="text-[22px] font-bold text-[#15171B]">
            You haven&apos;t posted any business enquiries yet
          </h2>
          <p className="text-[14px] text-[#696D76] mt-2 max-w-lg mx-auto leading-relaxed">
            Post a product or service requirement to receive structured quotations from relevant businesses, or explore the business directory directly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/enquiries/new" className="btn-accent">
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Enquiry</span>
            </Link>
            <Link href="/businesses" className="btn-secondary">
              <Building2 className="w-4 h-4" />
              <span>Browse Business Directory</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

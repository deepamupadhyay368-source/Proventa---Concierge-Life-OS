'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Building2,
  Bookmark,
  FileText,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type {
  BusinessListingDTO,
  BusinessProfileDTO,
  BusinessQuotationDTO,
  CustomerEnquiryDTO,
} from '@/lib/marketplace/types';

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'enquiries' | 'shortlisted' | 'saved'
  >('enquiries');
  const [enquiries, setEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [savedBusinesses, setSavedBusinesses] = useState<BusinessProfileDTO[]>([]);
  const [savedListings, setSavedListings] = useState<BusinessListingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [enqRes, savRes] = await Promise.all([
        fetch('/api/enquiries'),
        fetch('/api/saved'),
      ]);
      if (enqRes.ok) {
        const enqJson = await enqRes.json();
        setEnquiries(enqJson.items || []);
      }
      if (savRes.ok) {
        const savJson = await savRes.json();
        setSavedBusinesses(savJson.savedBusinesses || []);
        setSavedListings(savJson.savedListings || []);
      }
    } catch {
      // Ignore network errors during initial render
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleQuotationAction(
    quotationId: string,
    action: 'SHORTLIST' | 'ACCEPT' | 'REJECT',
  ) {
    setFeedbackMessage(null);
    const res = await fetch(`/api/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setFeedbackMessage(`Quotation updated (${action.toLowerCase()}ed).`);
      loadData();
    }
  }

  async function handleEnquiryLifecycle(
    enquiryId: string,
    action: 'CLOSE' | 'CANCEL',
  ) {
    setFeedbackMessage(null);
    const res = await fetch(`/api/enquiries/${enquiryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setFeedbackMessage(`Enquiry ${action === 'CLOSE' ? 'closed' : 'cancelled'}.`);
      loadData();
    }
  }

  const allQuotations: Array<{
    enquiry: CustomerEnquiryDTO;
    quotation: BusinessQuotationDTO;
  }> = [];
  for (const enq of enquiries) {
    for (const q of enq.quotations ?? []) {
      allQuotations.push({ enquiry: enq, quotation: q });
    }
  }

  const shortlistedOffers = allQuotations.filter(
    (item) =>
      item.quotation.status === 'SHORTLISTED' ||
      item.quotation.status === 'ACCEPTED',
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Customer Workspace
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Enquiries, Quotations &amp; Saved Businesses
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Post requirements, compare quotations from matched businesses,
            shortlist or accept offers, and manage your saved storefronts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/enquiries/new"
            className="inline-flex items-center gap-2 bg-foreground text-background font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Enquiry
          </Link>
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 border border-border bg-background text-foreground font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Switch to Business Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs text-muted-foreground">My Enquiries</div>
          <div className="font-display text-3xl font-bold text-foreground mt-1">
            {enquiries.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs text-muted-foreground">
            Quotations Received
          </div>
          <div className="font-display text-3xl font-bold text-foreground mt-1">
            {allQuotations.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs text-muted-foreground">Shortlisted Offers</div>
          <div className="font-display text-3xl font-bold text-emerald-700 mt-1">
            {shortlistedOffers.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-xs text-muted-foreground">Saved Items</div>
          <div className="font-display text-3xl font-bold text-foreground mt-1">
            {savedBusinesses.length + savedListings.length}
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="underline text-emerald-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
            activeTab === 'enquiries'
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          My Enquiries &amp; Quotations ({enquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('shortlisted')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
            activeTab === 'shortlisted'
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Shortlisted &amp; Accepted Offers ({shortlistedOffers.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
            activeTab === 'saved'
              ? 'bg-foreground text-background'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Saved Businesses &amp; Listings (
          {savedBusinesses.length + savedListings.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading your marketplace workspace…
        </div>
      ) : activeTab === 'enquiries' ? (
        <div className="space-y-6">
          {enquiries.length > 0 ? (
            enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-card border border-border rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-secondary text-foreground">
                      {enq.referenceCode}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {enq.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {enq.categoryName} &middot; {enq.city}, {enq.state}
                    </span>
                  </div>

                  {enq.status !== 'CLOSED' && enq.status !== 'CANCELLED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEnquiryLifecycle(enq.id, 'CLOSE')}
                        className="text-xs px-3 py-1 rounded border border-border hover:bg-secondary"
                      >
                        Mark Closed
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {enq.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {enq.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Matched Businesses: <strong>{enq.matchedCount}</strong>{' '}
                    &middot; Quotations Received:{' '}
                    <strong>{enq.responsesCount}</strong>
                  </div>
                </div>

                {/* Quotations Comparison List */}
                {(enq.quotations ?? []).length > 0 && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Quotations Received ({(enq.quotations ?? []).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(enq.quotations ?? []).map((q) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl bg-background border border-border flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <Link
                                href={`/business/${q.businessSlug || q.businessId}`}
                                className="font-bold text-sm text-foreground hover:underline"
                              >
                                {q.businessName || 'Matched Business'}
                              </Link>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary">
                                {q.status}
                              </span>
                            </div>

                            <div className="mt-2 text-base font-bold text-foreground">
                              {q.priceAmount
                                ? `₹${q.priceAmount.toLocaleString('en-IN')}`
                                : q.priceType.replace(/_/g, ' ')}
                              <span className="text-xs font-normal text-muted-foreground">
                                {' '}
                                &middot; Delivery: {q.deliveryTimeline}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-foreground mt-2">
                              {q.summary}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {q.detailedProposal}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                            {q.status !== 'SHORTLISTED' &&
                              q.status !== 'ACCEPTED' && (
                                <button
                                  onClick={() =>
                                    handleQuotationAction(q.id, 'SHORTLIST')
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-secondary/80"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Shortlist
                                </button>
                              )}
                            {q.status !== 'ACCEPTED' && (
                              <button
                                onClick={() =>
                                  handleQuotationAction(q.id, 'ACCEPT')
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Accept Quote
                              </button>
                            )}
                            {q.status !== 'REJECTED' &&
                              q.status !== 'ACCEPTED' && (
                                <button
                                  onClick={() =>
                                    handleQuotationAction(q.id, 'REJECT')
                                  }
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive px-2 py-1.5"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Decline
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <h2 className="font-display text-xl font-bold text-foreground">
                You Haven&apos;t Posted Any Enquiries Yet
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                Post what you need — from manufacturing supplies and construction
                contractors to software development or event services — and compare
                business quotations in one place.
              </p>
              <Link
                href="/enquiries/new"
                className="mt-5 inline-flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your First Enquiry
              </Link>
            </div>
          )}
        </div>
      ) : activeTab === 'shortlisted' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortlistedOffers.length > 0 ? (
            shortlistedOffers.map(({ enquiry, quotation }) => (
              <div
                key={quotation.id}
                className="bg-card border border-border rounded-xl p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {quotation.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {quotation.referenceCode}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {quotation.businessName} — {quotation.summary}
                </h3>
                <p className="text-xs text-muted-foreground">
                  For Enquiry: <strong>{enquiry.title}</strong>
                </p>
                <div className="text-sm font-bold text-foreground">
                  {quotation.priceAmount
                    ? `₹${quotation.priceAmount.toLocaleString('en-IN')}`
                    : quotation.priceType}{' '}
                  &middot; {quotation.deliveryTimeline}
                </div>
                {quotation.businessContactPhone && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Direct Business Contact: {quotation.businessContactPhone}{' '}
                    {quotation.businessContactEmail
                      ? `(${quotation.businessContactEmail})`
                      : ''}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
              No shortlisted or accepted quotations yet.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedBusinesses.map((biz) => (
            <Link
              key={biz.id}
              href={`/business/${biz.slug}`}
              className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-foreground/40"
            >
              <div>
                <h3 className="font-bold text-base text-foreground">{biz.name}</h3>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {biz.city}, {biz.state}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
          {savedBusinesses.length === 0 && savedListings.length === 0 && (
            <div className="col-span-2 bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
              You have not saved any businesses or listings yet.{' '}
              <Link href="/businesses" className="text-foreground underline">
                Explore the directory
              </Link>
              .
            </div>
          )}
        </div>
      )}
    </div>
  );
}

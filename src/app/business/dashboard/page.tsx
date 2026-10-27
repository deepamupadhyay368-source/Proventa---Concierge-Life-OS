'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import {
  BusinessProfileDTO,
  CustomerEnquiryDTO,
  PRICE_DISPLAY_LABELS,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';

export default function BusinessDashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessProfileDTO[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [enquiries, setEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'catalog' | 'profile'>('enquiries');

  // New Listing Form State
  const [listingTitle, setListingTitle] = useState('');
  const [listingType, setListingType] = useState<'PRODUCT' | 'SERVICE' | 'PACKAGE'>('PRODUCT');
  const [listingSummary, setListingSummary] = useState('');
  const [priceDisplayType, setPriceDisplayType] = useState<
    'FIXED_PRICE' | 'INDICATIVE_PRICE' | 'PRICE_ON_REQUEST' | 'QUOTE_REQUIRED'
  >('INDICATIVE_PRICE');
  const [priceAmount, setPriceAmount] = useState('');
  const [listingNotice, setListingNotice] = useState<string | null>(null);

  // Quotation Form State
  const [quotingEnquiryId, setQuotingEnquiryId] = useState<string | null>(null);
  const [quoteSummary, setQuoteSummary] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteTimeline, setQuoteTimeline] = useState('5–7 business days');
  const [quoteProposal, setQuoteProposal] = useState('');
  const [quoteNotice, setQuoteNotice] = useState<string | null>(null);

  async function loadWorkspace() {
    setLoading(true);
    try {
      const [bizRes, enqRes] = await Promise.all([
        fetch('/api/marketplace/businesses?includeUnpublished=true&limit=50'),
        fetch('/api/marketplace/enquiries?mode=business'),
      ]);
      const bizData = await bizRes.json();
      const enqData = await enqRes.json();

      const items: BusinessProfileDTO[] = bizData.items || [];
      setBusinesses(items);
      if (items.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(items[0].id);
      }
      setEnquiries(enqData.enquiries || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBusiness =
    businesses.find((b) => b.id === selectedBusinessId) || businesses[0] || null;
  const activeListings = activeBusiness?.listings || [];

  async function handleAddListing(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBusiness) return;
    setListingNotice(null);

    const res = await fetch('/api/marketplace/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: activeBusiness.id,
        categoryId: activeBusiness.primaryCategoryId,
        listingType,
        title: listingTitle,
        shortSummary: listingSummary,
        description: listingSummary,
        priceDisplayType,
        priceAmount: priceAmount ? Number(priceAmount) : undefined,
      }),
    });

    if (res.ok) {
      setListingTitle('');
      setListingSummary('');
      setPriceAmount('');
      setListingNotice('OFFERING PUBLISHED TO STOREFRONT LEDGER.');
      await loadWorkspace();
    }
  }

  async function handleSendQuotation(e: React.FormEvent, enquiryId: string) {
    e.preventDefault();
    if (!activeBusiness) return;
    setQuoteNotice(null);

    const res = await fetch('/api/marketplace/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enquiryId,
        businessId: activeBusiness.id,
        summary: quoteSummary,
        detailedProposal: quoteProposal || quoteSummary,
        priceType: quoteAmount ? 'FIXED' : 'CUSTOM_ESTIMATE',
        priceAmount: quoteAmount ? Number(quoteAmount) : undefined,
        deliveryTimeline: quoteTimeline,
      }),
    });

    if (res.ok) {
      setQuotingEnquiryId(null);
      setQuoteSummary('');
      setQuoteAmount('');
      setQuoteProposal('');
      setQuoteNotice('QUOTATION DISPATCHED TO BUYER.');
      await loadWorkspace();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#0D0E11]">
      <MarketingNav />

      <main className="flex-1 py-10 lg:py-14">
        <div className="container-wide">
          {/* Console Header */}
          <div className="border-b-2 border-[#0D0E11] pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="index-code-lime">VENDOR CONSOLE // LEDGER</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                  STOREFRONT, CATALOG &amp; QUOTATION OPERATIONS
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-[-0.04em] text-[#0D0E11]">
                {activeBusiness ? activeBusiness.name : 'BUSINESS OPERATIONS CONSOLE'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {businesses.length > 1 && (
                <select
                  value={activeBusiness?.id || ''}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="border border-[#0D0E11] bg-[#FAF8F3] px-3 py-2.5 font-mono text-xs text-[#0D0E11]"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      ENTITY: {b.name}
                    </option>
                  ))}
                </select>
              )}
              {activeBusiness && (
                <Link
                  href={`/business/${activeBusiness.slug}`}
                  className="btn-secondary"
                >
                  <span>PUBLIC DOSSIER</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              <Link href="/business/register" className="btn-accent">
                <Plus className="h-4 w-4" />
                <span>REGISTER NEW ENTITY</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="border border-[#0D0E11] bg-[#FAF8F3] p-12 font-mono text-xs uppercase tracking-[0.14em]">
              LOADING VENDOR LEDGER...
            </div>
          ) : !activeBusiness ? (
            <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
              <span className="index-code-lime mb-3">NO REGISTERED ENTITY FOUND</span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
                PUBLISH YOUR FIRST BUSINESS STOREFRONT TO ACTIVATE THIS CONSOLE.
              </h2>
              <p className="mt-3 text-sm text-[#52514E] max-w-2xl">
                Register your company in The Business Index to manage product &amp; service
                listings, inspect buyer enquiries, and issue formal quotations.
              </p>
              <div className="mt-6">
                <Link href="/business/register" className="btn-primary">
                  <span>PUBLISH BUSINESS STOREFRONT</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Telemetry Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#0D0E11] bg-[#FAF8F3] divide-y lg:divide-y-0 divide-x divide-[#0D0E11] mb-8 font-mono">
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                    STOREFRONT STATUS
                  </div>
                  <div className="mt-2 text-lg font-bold text-[#0D0E11]">
                    {activeBusiness.status}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                    VERIFICATION TIER
                  </div>
                  <div className="mt-2 text-lg font-bold text-[#0D0E11] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].shortLabel}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                    PUBLISHED CATALOG ITEMS
                  </div>
                  <div className="mt-2 text-lg font-bold text-[#0D0E11]">
                    {activeListings.length} ITEMS
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                    INCOMING BUYER RFQS
                  </div>
                  <div className="mt-2 text-lg font-bold text-[#0D0E11]">
                    {enquiries.length} ENQUIRIES
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b-2 border-[#0D0E11] mb-8 font-mono text-xs font-bold uppercase tracking-[0.12em]">
                {(['enquiries', 'catalog', 'profile'] as const).map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 border-t border-r first:border-l border-[#0D0E11] transition-colors ${
                      activeTab === tab
                        ? 'bg-[#0D0E11] text-[#C8F904]'
                        : 'bg-[#FAF8F3] text-[#0D0E11] hover:bg-[#EAE5DA]'
                    }`}
                  >
                    0{i + 1} //{' '}
                    {tab === 'enquiries'
                      ? `BUYER ENQUIRIES (${enquiries.length})`
                      : tab === 'catalog'
                        ? `CATALOG LEDGER (${activeListings.length})`
                        : 'STOREFRONT DOSSIER'}
                  </button>
                ))}
              </div>

              {quoteNotice && (
                <div className="mb-6 p-4 border border-[#0D0E11] bg-[#C8F904] font-mono text-xs font-bold text-[#0D0E11]">
                  ✓ {quoteNotice}
                </div>
              )}

              {listingNotice && (
                <div className="mb-6 p-4 border border-[#0D0E11] bg-[#C8F904] font-mono text-xs font-bold text-[#0D0E11]">
                  ✓ {listingNotice}
                </div>
              )}

              {/* TAB 01: BUYER ENQUIRIES & QUOTATION DISPATCH */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  {enquiries.length > 0 ? (
                    enquiries.map((enq) => {
                      const quotesCount = (enq.quotations || []).length;
                      const budgetLabel = enq.budgetMax
                        ? `₹${(enq.budgetMin || 0).toLocaleString('en-IN')} – ₹${enq.budgetMax.toLocaleString('en-IN')}`
                        : 'Open';
                      return (
                        <div
                          key={enq.id}
                          className="border border-[#0D0E11] bg-[#FAF8F3] p-6"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#CFCAC0] font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="index-code">{enq.referenceCode}</span>
                              <span className="text-[#52514E] uppercase">
                                {enq.categoryName} · {enq.city}
                              </span>
                            </div>
                            <span className="index-code-lime">{enq.status}</span>
                          </div>

                          <h3 className="font-display text-xl font-bold text-[#0D0E11]">
                            {enq.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#52514E]">{enq.description}</p>

                          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#CFCAC0] pt-3 font-mono text-xs">
                            <div>
                              <dt className="text-[#52514E]">QUANTITY / SCOPE</dt>
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
                              <dt className="text-[#52514E]">QUOTES ISSUED</dt>
                              <dd className="font-bold text-[#0D0E11]">{quotesCount}</dd>
                            </div>
                          </dl>

                          <div className="mt-5 pt-4 border-t border-[#0D0E11] flex items-center justify-between">
                            <span className="font-mono text-xs text-[#52514E]">
                              BUYER: {enq.customerName || 'Verified Buyer'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuotingEnquiryId(
                                  quotingEnquiryId === enq.id ? null : enq.id,
                                )
                              }
                              className="btn-accent py-2 px-4"
                            >
                              <span>
                                {quotingEnquiryId === enq.id
                                  ? 'CLOSE QUOTATION FORM'
                                  : 'ISSUE QUOTATION →'}
                              </span>
                            </button>
                          </div>

                          {quotingEnquiryId === enq.id && (
                            <form
                              onSubmit={(e) => handleSendQuotation(e, enq.id)}
                              className="mt-5 border-t-2 border-[#0D0E11] pt-5 space-y-4 bg-[#EAE5DA] p-5"
                            >
                              <div className="font-mono text-xs font-bold uppercase">
                                DISPATCH COMMERCIAL QUOTATION FOR {enq.referenceCode}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                                    QUOTATION HEADLINE / SUMMARY *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={quoteSummary}
                                    onChange={(e) => setQuoteSummary(e.target.value)}
                                    placeholder="Turnkey supply & delivery as per specification"
                                    className="input-enterprise"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                                      PRICE (INR)
                                    </label>
                                    <input
                                      type="number"
                                      value={quoteAmount}
                                      onChange={(e) => setQuoteAmount(e.target.value)}
                                      placeholder="45000"
                                      className="input-enterprise font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                                      DELIVERY TIMELINE
                                    </label>
                                    <input
                                      type="text"
                                      value={quoteTimeline}
                                      onChange={(e) => setQuoteTimeline(e.target.value)}
                                      className="input-enterprise"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                                  COMMERCIAL TERMS &amp; INCLUSIONS *
                                </label>
                                <textarea
                                  rows={3}
                                  required
                                  value={quoteProposal}
                                  onChange={(e) => setQuoteProposal(e.target.value)}
                                  placeholder="Specify line-item pricing, warranty, GST terms, and delivery schedule..."
                                  className="input-enterprise"
                                />
                              </div>
                              <button type="submit" className="btn-primary">
                                <Check className="h-4 w-4" />
                                <span>SUBMIT QUOTATION TO BUYER LEDGER</span>
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="border border-[#0D0E11] bg-[#FAF8F3] p-8 font-mono text-xs text-[#52514E]">
                      NO BUYER ENQUIRIES CURRENTLY IN QUEUE. NEW SECTOR AND DIRECT RFQS APPEAR HERE
                      AUTOMATICALLY.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 02: CATALOG MANAGEMENT */}
              {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={handleAddListing}
                    className="lg:col-span-5 border-2 border-[#0D0E11] bg-[#FAF8F3] p-6 space-y-4"
                  >
                    <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] pb-3 border-b border-[#0D0E11]">
                      ADD NEW OFFERING TO CATALOG
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                        OFFERING TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        value={listingTitle}
                        onChange={(e) => setListingTitle(e.target.value)}
                        placeholder="e.g., 5-Axis CNC Aluminum Machining Batch"
                        className="input-enterprise"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                          TYPE
                        </label>
                        <select
                          value={listingType}
                          onChange={(e) =>
                            setListingType(
                              e.target.value as 'PRODUCT' | 'SERVICE' | 'PACKAGE',
                            )
                          }
                          className="input-enterprise font-mono text-xs"
                        >
                          <option value="PRODUCT">PRODUCT</option>
                          <option value="SERVICE">SERVICE</option>
                          <option value="PACKAGE">PACKAGE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                          PRICING MODEL
                        </label>
                        <select
                          value={priceDisplayType}
                          onChange={(e) =>
                            setPriceDisplayType(
                              e.target.value as
                                | 'FIXED_PRICE'
                                | 'INDICATIVE_PRICE'
                                | 'PRICE_ON_REQUEST'
                                | 'QUOTE_REQUIRED',
                            )
                          }
                          className="input-enterprise font-mono text-xs"
                        >
                          <option value="INDICATIVE_PRICE">INDICATIVE PRICE</option>
                          <option value="FIXED_PRICE">FIXED PRICE</option>
                          <option value="PRICE_ON_REQUEST">PRICE ON REQUEST</option>
                          <option value="QUOTE_REQUIRED">QUOTE REQUIRED</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                        PRICE AMOUNT (INR, OPTIONAL)
                      </label>
                      <input
                        type="number"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        placeholder="e.g., 18000"
                        className="input-enterprise font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                        SPECIFICATION SUMMARY *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={listingSummary}
                        onChange={(e) => setListingSummary(e.target.value)}
                        placeholder="Technical overview, deliverables, and turnaround time..."
                        className="input-enterprise"
                      />
                    </div>
                    <button type="submit" className="btn-accent w-full">
                      <Plus className="h-4 w-4" />
                      <span>PUBLISH OFFERING</span>
                    </button>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {activeListings.map((item, idx) => (
                      <div
                        key={item.id}
                        className="border border-[#0D0E11] bg-[#FAF8F3] p-5 flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#52514E]">
                            #{String(idx + 1).padStart(2, '0')} · {item.listingType}
                          </span>
                          <h3 className="font-display text-lg font-bold text-[#0D0E11]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-[#52514E]">
                            {item.shortSummary || item.description}
                          </p>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#0D0E11] shrink-0">
                          {item.priceAmount
                            ? `₹${item.priceAmount.toLocaleString('en-IN')}`
                            : PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 03: STOREFRONT DOSSIER */}
              {activeTab === 'profile' && (
                <div className="border border-[#0D0E11] bg-[#FAF8F3] p-6 sm:p-8">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#0D0E11]">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                      REGISTERED ENTITY DOSSIER
                    </span>
                    <Link
                      href={`/business/${activeBusiness.slug}`}
                      className="btn-secondary py-2 px-3"
                    >
                      <span>OPEN PUBLIC PAGE</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-4 border border-[#CFCAC0] bg-[#F4F1EA]">
                      <dt className="text-[#52514E]">ENTITY NAME</dt>
                      <dd className="mt-1 font-bold text-sm text-[#0D0E11]">
                        {activeBusiness.name}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#CFCAC0] bg-[#F4F1EA]">
                      <dt className="text-[#52514E]">PRIMARY SECTOR</dt>
                      <dd className="mt-1 font-bold text-sm text-[#0D0E11]">
                        {activeBusiness.primaryCategory?.name || activeBusiness.primaryCategoryId}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#CFCAC0] bg-[#F4F1EA]">
                      <dt className="text-[#52514E]">HEADQUARTERS</dt>
                      <dd className="mt-1 font-bold text-sm text-[#0D0E11]">
                        {activeBusiness.city}, {activeBusiness.state}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#CFCAC0] bg-[#F4F1EA]">
                      <dt className="text-[#52514E]">PUBLIC SLUG</dt>
                      <dd className="mt-1 font-bold text-sm text-[#0D0E11]">
                        /business/{activeBusiness.slug}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

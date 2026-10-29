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
      setListingNotice('Offering published to your business storefront.');
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
      setQuoteNotice('Quotation submitted to customer.');
      await loadWorkspace();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E5] text-[#181914]">
      <MarketingNav />

      <main className="flex-1">
        {/* Console Header */}
        <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-10 lg:py-14">
          <div className="container-wide flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2.5 mb-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  Business Operations Dashboard
                </span>
                <span className="text-[#4C4A40]">·</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                  Storefront, Offerings &amp; Quotations
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#F6F0E4]">
                {activeBusiness ? activeBusiness.name : 'Business Workspace'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {businesses.length > 1 && (
                <select
                  value={activeBusiness?.id || ''}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="border border-[#4C4A40] bg-[#20211C] px-3.5 py-2.5 font-mono text-xs text-[#F6F0E4]"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      Business: {b.name}
                    </option>
                  ))}
                </select>
              )}
              {activeBusiness && (
                <Link
                  href={`/business/${activeBusiness.slug}`}
                  className="inline-flex items-center gap-2 border border-[#4C4A40] bg-[#20211C] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F6F0E4] hover:border-[#A98253] transition-colors"
                >
                  <span>Public Storefront</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
              <Link href="/business/register" className="btn-terracotta">
                <Plus className="h-4 w-4" />
                <span>Register New Business</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="container-wide py-10 lg:py-14">
          {loading ? (
            <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-12 font-mono text-xs uppercase tracking-[0.14em] text-[#6B675E]">
              Loading business workspace...
            </div>
          ) : !activeBusiness ? (
            <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D] block mb-3">
                No Business Profile Registered Yet
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#181914]">
                Publish your first business storefront to activate this console.
              </h2>
              <p className="mt-3 text-sm text-[#5C584F] max-w-2xl">
                Register your company on PROVENTA to manage product and service listings,
                inspect incoming customer enquiries, and send quotations.
              </p>
              <div className="mt-6">
                <Link href="/business/register" className="btn-terracotta">
                  <span>List Your Business</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Telemetry Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#D5CBB8] bg-[#FAF6EC] divide-y lg:divide-y-0 divide-x divide-[#D5CBB8] mb-8">
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
                    Storefront Status
                  </div>
                  <div className="mt-2 font-display text-2xl text-[#181914]">
                    {activeBusiness.status}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
                    Verification Tier
                  </div>
                  <div className="mt-2 font-display text-2xl text-[#181914] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#B94E2D]" />
                    {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].shortLabel}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
                    Published Offerings
                  </div>
                  <div className="mt-2 font-display text-2xl text-[#181914]">
                    {activeListings.length} Listings
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
                    Customer Enquiries
                  </div>
                  <div className="mt-2 font-display text-2xl text-[#181914]">
                    {enquiries.length} Enquiries
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-[#D5CBB8] mb-8 font-mono text-xs uppercase tracking-[0.14em]">
                {(['enquiries', 'catalog', 'profile'] as const).map((tab, i) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 border-t border-r first:border-l border-[#D5CBB8] transition-colors ${
                      activeTab === tab
                        ? 'bg-[#171A14] text-[#F6F0E4] font-semibold'
                        : 'bg-[#FAF6EC] text-[#5C584F] hover:bg-[#E9DFCC] hover:text-[#181914]'
                    }`}
                  >
                    0{i + 1} —{' '}
                    {tab === 'enquiries'
                      ? `Customer Enquiries (${enquiries.length})`
                      : tab === 'catalog'
                        ? `Products & Services (${activeListings.length})`
                        : 'Business Profile'}
                  </button>
                ))}
              </div>

              {quoteNotice && (
                <div className="mb-6 p-4 border border-[#B94E2D] bg-[#B94E2D]/10 font-mono text-xs font-medium text-[#181914]">
                  ✓ {quoteNotice}
                </div>
              )}

              {listingNotice && (
                <div className="mb-6 p-4 border border-[#B94E2D] bg-[#B94E2D]/10 font-mono text-xs font-medium text-[#181914]">
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
                          className="border border-[#D5CBB8] bg-[#FAF6EC] p-6"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#D5CBB8] font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="badge-neutral">{enq.referenceCode}</span>
                              {enq.referenceCode.includes('MSN') && (
                                <span className="badge-verified">MISSION RFQ</span>
                              )}
                              <span className="text-[#6B675E] uppercase">
                                {enq.categoryName} · {enq.city}
                              </span>
                            </div>
                            <span className="badge-verified">{enq.status}</span>
                          </div>

                          <h3 className="font-display text-2xl font-normal text-[#181914]">
                            {enq.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#5C584F] leading-relaxed">
                            {enq.description}
                          </p>

                          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#D5CBB8] pt-3 font-mono text-xs">
                            <div>
                              <dt className="text-[#6B675E]">QUANTITY / SCOPE</dt>
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
                              <dt className="text-[#6B675E]">QUOTES SUBMITTED</dt>
                              <dd className="font-semibold text-[#181914] mt-0.5">
                                {quotesCount}
                              </dd>
                            </div>
                          </dl>

                          <div className="mt-5 pt-4 border-t border-[#D5CBB8] flex items-center justify-between">
                            <span className="font-mono text-xs text-[#6B675E]">
                              Customer: {enq.customerName || 'Verified Buyer'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQuotingEnquiryId(
                                  quotingEnquiryId === enq.id ? null : enq.id,
                                )
                              }
                              className="btn-terracotta py-2.5 px-4"
                            >
                              <span>
                                {quotingEnquiryId === enq.id
                                  ? 'Close Quotation Form'
                                  : 'Send Quotation'}
                              </span>
                            </button>
                          </div>

                          {quotingEnquiryId === enq.id && (
                            <form
                              onSubmit={(e) => handleSendQuotation(e, enq.id)}
                              className="mt-5 border-t border-[#D5CBB8] pt-5 space-y-4 bg-[#E9DFCC]/60 p-5"
                            >
                              <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#A98253]">
                                Submit Quotation for {enq.referenceCode}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                                    Quotation Headline / Summary *
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
                                    <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                                      Price (INR)
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
                                    <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                                      Delivery Timeline
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
                                <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                                  Detailed Proposal &amp; Inclusions *
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
                                <span>Submit Quotation</span>
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 font-mono text-xs text-[#6B675E]">
                      No customer enquiries in queue yet. Direct and category-matched
                      enquiries appear here automatically.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 02: CATALOG MANAGEMENT */}
              {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <form
                    onSubmit={handleAddListing}
                    className="lg:col-span-5 border border-[#D5CBB8] bg-[#FAF6EC] p-6 space-y-4"
                  >
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253] pb-3 border-b border-[#D5CBB8]">
                      Add Product or Service Listing
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                        Listing Title *
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
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                          Type
                        </label>
                        <select
                          value={listingType}
                          onChange={(e) =>
                            setListingType(
                              e.target.value as 'PRODUCT' | 'SERVICE' | 'PACKAGE',
                            )
                          }
                          className="input-enterprise"
                        >
                          <option value="PRODUCT">Product</option>
                          <option value="SERVICE">Service</option>
                          <option value="PACKAGE">Package</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                          Pricing Model
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
                          className="input-enterprise"
                        >
                          <option value="INDICATIVE_PRICE">Starting From</option>
                          <option value="FIXED_PRICE">Fixed Price</option>
                          <option value="PRICE_ON_REQUEST">Price on Request</option>
                          <option value="QUOTE_REQUIRED">Custom Quotation</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                        Price Amount (INR, Optional)
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
                      <label className="block text-xs font-medium uppercase tracking-[0.08em] mb-1">
                        Description &amp; Specifications *
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
                    <button type="submit" className="btn-terracotta w-full">
                      <Plus className="h-4 w-4" />
                      <span>Publish Offering</span>
                    </button>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    {activeListings.map((item, idx) => (
                      <div
                        key={item.id}
                        className="border border-[#D5CBB8] bg-[#FAF6EC] p-5 flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#A98253]">
                            #{String(idx + 1).padStart(2, '0')} · {item.listingType}
                          </span>
                          <h3 className="font-display text-2xl font-normal text-[#181914] mt-0.5">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs text-[#5C584F]">
                            {item.shortSummary || item.description}
                          </p>
                        </div>
                        <div className="font-mono text-xs font-semibold text-[#181914] shrink-0">
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
                <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 sm:p-8">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D5CBB8]">
                    <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#A98253]">
                      Registered Business Profile
                    </span>
                    <Link
                      href={`/business/${activeBusiness.slug}`}
                      className="btn-secondary py-2 px-3"
                    >
                      <span>View Public Page</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-4 border border-[#D5CBB8] bg-[#F5F0E5]">
                      <dt className="text-[#6B675E]">BUSINESS NAME</dt>
                      <dd className="mt-1 font-semibold text-sm text-[#181914]">
                        {activeBusiness.name}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#D5CBB8] bg-[#F5F0E5]">
                      <dt className="text-[#6B675E]">PRIMARY INDUSTRY</dt>
                      <dd className="mt-1 font-semibold text-sm text-[#181914]">
                        {activeBusiness.primaryCategory?.name ||
                          activeBusiness.primaryCategoryId}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#D5CBB8] bg-[#F5F0E5]">
                      <dt className="text-[#6B675E]">LOCATION</dt>
                      <dd className="mt-1 font-semibold text-sm text-[#181914]">
                        {activeBusiness.city}, {activeBusiness.state}
                      </dd>
                    </div>
                    <div className="p-4 border border-[#D5CBB8] bg-[#F5F0E5]">
                      <dt className="text-[#6B675E]">PUBLIC STOREFRONT URL</dt>
                      <dd className="mt-1 font-semibold text-sm text-[#181914]">
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

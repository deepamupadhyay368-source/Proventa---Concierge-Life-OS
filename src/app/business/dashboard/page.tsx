'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  FileText,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import {
  VERIFICATION_BADGE_META,
  PRICE_DISPLAY_LABELS,
  type BusinessProfileDTO,
  type BusinessListingDTO,
  type CustomerEnquiryDTO,
  type ListingType,
  type PriceDisplayType,
} from '@/lib/marketplace/types';

export default function BusinessOwnerDashboardPage() {
  const [businesses, setBusinesses] = useState<BusinessProfileDTO[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfileDTO | null>(null);
  const [listings, setListings] = useState<BusinessListingDTO[]>([]);
  const [matchedEnquiries, setMatchedEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'listings' | 'storefront'>('enquiries');

  // Add Listing Form State
  const [showAddListing, setShowAddListing] = useState(false);
  const [listingTitle, setListingTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('PRODUCT');
  const [listingDesc, setListingDesc] = useState('');
  const [priceDisplayType, setPriceDisplayType] = useState<PriceDisplayType>('FIXED_PRICE');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [submittingListing, setSubmittingListing] = useState(false);

  // Send Quotation Modal / Inline State
  const [quotingEnquiryId, setQuotingEnquiryId] = useState<string | null>(null);
  const [quotePriceSummary, setQuotePriceSummary] = useState('');
  const [quotePriceAmount, setQuotePriceAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteTimeline, setQuoteTimeline] = useState('Within 7 working days');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  const loadBusinessWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const bizRes = await fetch('/api/businesses?mine=true');
      if (bizRes.status === 401) {
        window.location.href = '/sign-in?callbackUrl=/business/dashboard';
        return;
      }
      if (bizRes.ok) {
        const bizData = await bizRes.json();
        const myBusinesses: BusinessProfileDTO[] = bizData.items || [];
        setBusinesses(myBusinesses);

        if (myBusinesses.length > 0) {
          const primaryBiz = myBusinesses[0];
          setActiveBusiness(primaryBiz);

          const [listRes, enqRes] = await Promise.all([
            fetch(`/api/listings?businessId=${primaryBiz.id}`),
            fetch(`/api/enquiries?scope=business&businessId=${primaryBiz.id}`),
          ]);

          if (listRes.ok) {
            const listData = await listRes.json();
            setListings(listData.items || []);
          }
          if (enqRes.ok) {
            const enqData = await enqRes.json();
            setMatchedEnquiries(enqData.items || []);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBusinessWorkspace();
  }, [loadBusinessWorkspace]);

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBusiness) return;
    setSubmittingListing(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          categoryId: activeBusiness.primaryCategoryId,
          listingType,
          title: listingTitle,
          description: listingDesc,
          priceDisplayType,
          priceAmount: priceAmount ? Number(priceAmount) : undefined,
          priceUnit: priceUnit || undefined,
          status: 'PUBLISHED',
        }),
      });

      if (res.ok) {
        setListingTitle('');
        setListingDesc('');
        setPriceAmount('');
        setPriceUnit('');
        setShowAddListing(false);
        await loadBusinessWorkspace();
      }
    } finally {
      setSubmittingListing(false);
    }
  }

  async function handleSendQuotation(e: React.FormEvent, enquiryId: string) {
    e.preventDefault();
    if (!activeBusiness) return;
    setSubmittingQuote(true);
    setQuoteSuccessMsg(null);

    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          priceSummary: quotePriceSummary,
          priceAmount: quotePriceAmount ? Number(quotePriceAmount) : undefined,
          message: quoteMessage,
          estimatedTimeline: quoteTimeline,
        }),
      });

      if (res.ok) {
        setQuotingEnquiryId(null);
        setQuotePriceSummary('');
        setQuotePriceAmount('');
        setQuoteMessage('');
        setQuoteSuccessMsg('Quotation sent to customer!');
        await loadBusinessWorkspace();
      }
    } finally {
      setSubmittingQuote(false);
    }
  }

  // Calculate real profile completion score
  const computeProfileCompletion = (
    biz: BusinessProfileDTO,
    catalogCount: number,
  ) => {
    const checks = [
      { label: 'Business name & description', done: Boolean(biz.name && biz.description) },
      { label: 'Location & service areas', done: Boolean(biz.city && biz.serviceAreas?.length) },
      { label: 'Direct contact channels', done: Boolean(biz.contactEmail || biz.contactPhone) },
      { label: 'GSTIN or establishment year', done: Boolean(biz.gstNumber || biz.yearEstablished) },
      { label: 'Published product/service catalog', done: catalogCount > 0 },
    ];
    const completedCount = checks.filter((c) => c.done).length;
    const percent = Math.round((completedCount / checks.length) * 100);
    return { percent, checks };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#15171B]">
      <MarketingNav />

      <main className="flex-1 py-10 md:py-14">
        <div className="container-wide">
          {loading ? (
            <div className="surface-card py-20 flex items-center justify-center gap-2.5 text-[14px] text-[#696D76]">
              <Loader2 className="w-5 h-5 animate-spin text-[#304FFE]" />
              <span>Loading your Business Owner Workspace…</span>
            </div>
          ) : businesses.length === 0 || !activeBusiness ? (
            <div className="surface-card p-10 sm:p-12 text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-[10px] bg-[#EEF1FF] flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-[#304FFE]" />
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#15171B]">
                Launch Your Business Storefront on PROVENTA
              </h1>
              <p className="text-[14px] text-[#696D76] mt-2 max-w-lg mx-auto leading-relaxed">
                You haven&apos;t registered a business profile yet. Create your digital storefront to list your products and services and receive matched customer enquiries.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/business/register" className="btn-accent">
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Your Business Now</span>
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  Switch to Customer Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Business Banner */}
              <div className="surface-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-[#15171B] text-[18px] font-bold text-white">
                    {activeBusiness.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="badge-accent">
                        {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].label}
                      </span>
                      <span
                        className={
                          activeBusiness.status === 'PUBLISHED'
                            ? 'badge-verified'
                            : 'badge-neutral'
                        }
                      >
                        Storefront: {activeBusiness.status}
                      </span>
                      {activeBusiness.primaryCategory?.name && (
                        <span className="badge-neutral">
                          {activeBusiness.primaryCategory.name}
                        </span>
                      )}
                    </div>
                    <h1 className="text-[24px] sm:text-[30px] font-bold tracking-[-0.025em] text-[#15171B]">
                      {activeBusiness.name}
                    </h1>
                    <p className="text-[13px] text-[#696D76] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeBusiness.city}, {activeBusiness.state}
                      {activeBusiness.servesPanIndia && ' · Serves Pan-India'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/business/${activeBusiness.slug}`}
                    className="btn-secondary"
                  >
                    <span>View Public Storefront</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab('listings');
                      setShowAddListing(true);
                    }}
                    className="btn-accent"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Product / Service</span>
                  </button>
                </div>
              </div>

              {/* Real KPI Metrics + Profile Completion Indicator */}
              {(() => {
                const completion = computeProfileCompletion(
                  activeBusiness,
                  listings.length,
                );
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="surface-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                          Storefront Status
                        </div>
                        <div className="text-[20px] font-bold text-[#15171B] mt-2">
                          {activeBusiness.status}
                        </div>
                        <div className="text-[11px] text-[#16845B] mt-1">
                          Public URL Active
                        </div>
                      </div>
                      <div className="surface-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                          Catalog Items
                        </div>
                        <div className="text-[24px] font-bold text-[#15171B] mt-1">
                          {listings.length}
                        </div>
                        <div className="text-[11px] text-[#696D76] mt-1">
                          Products &amp; Services
                        </div>
                      </div>
                      <div className="surface-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                          Matched Enquiries
                        </div>
                        <div className="text-[24px] font-bold text-[#304FFE] mt-1">
                          {matchedEnquiries.length}
                        </div>
                        <div className="text-[11px] text-[#696D76] mt-1">
                          Customer leads
                        </div>
                      </div>
                      <div className="surface-card p-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                          Verification
                        </div>
                        <div className="text-[14px] font-bold text-[#15171B] mt-2">
                          {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].shortLabel}
                        </div>
                        <div className="text-[11px] text-[#696D76] mt-1">
                          Honest Trust Badge
                        </div>
                      </div>
                    </div>

                    {/* Profile Completion Indicator Card */}
                    <div className="lg:col-span-4 surface-card p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B]">
                            Storefront Completion
                          </span>
                          <span className="text-[13px] font-bold text-[#304FFE]">
                            {completion.percent}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#F2F3F6] overflow-hidden mb-3">
                          <div
                            className="h-full bg-[#304FFE] rounded-full transition-all"
                            style={{ width: `${completion.percent}%` }}
                          />
                        </div>
                        <ul className="space-y-1.5">
                          {completion.checks.map((item) => (
                            <li
                              key={item.label}
                              className="flex items-center gap-2 text-[12px]"
                            >
                              <CheckCircle2
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  item.done ? 'text-[#16845B]' : 'text-[#D1D4DC]'
                                }`}
                              />
                              <span
                                className={
                                  item.done
                                    ? 'text-[#15171B]'
                                    : 'text-[#696D76]'
                                }
                              >
                                {item.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {quoteSuccessMsg && (
                <div className="p-4 rounded-[10px] bg-[#ECFDF5] border border-[#16845B]/25 text-[#16845B] text-[13px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{quoteSuccessMsg}</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E9ED] pb-3">
                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[9px] text-[13px] font-semibold transition-colors ${
                    activeTab === 'enquiries'
                      ? 'bg-[#15171B] text-white'
                      : 'bg-[#FFFFFF] border border-[#E8E9ED] text-[#696D76] hover:text-[#15171B]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Matched Customer Enquiries ({matchedEnquiries.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[9px] text-[13px] font-semibold transition-colors ${
                    activeTab === 'listings'
                      ? 'bg-[#15171B] text-white'
                      : 'bg-[#FFFFFF] border border-[#E8E9ED] text-[#696D76] hover:text-[#15171B]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products &amp; Services Catalog ({listings.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('storefront')}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[9px] text-[13px] font-semibold transition-colors ${
                    activeTab === 'storefront'
                      ? 'bg-[#15171B] text-white'
                      : 'bg-[#FFFFFF] border border-[#E8E9ED] text-[#696D76] hover:text-[#15171B]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Storefront Details &amp; Verification</span>
                </button>
              </div>

              {/* TAB 1: MATCHED CUSTOMER ENQUIRIES */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  {matchedEnquiries.length > 0 ? (
                    matchedEnquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="surface-card p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-mono font-semibold text-[#304FFE]">
                                {enq.referenceCode}
                              </span>
                              <span className="badge-neutral">
                                {enq.requirementType}
                              </span>
                              {enq.categoryName && (
                                <span className="text-[12px] text-[#696D76]">
                                  {enq.categoryName}
                                </span>
                              )}
                            </div>
                            <h3 className="text-[18px] font-bold text-[#15171B] mt-1">
                              {enq.title}
                            </h3>
                          </div>

                          <div className="text-[12px] text-[#696D76]">
                            {enq.city}, {enq.state} &middot; Timeline:{' '}
                            <strong className="text-[#15171B]">
                              {enq.timeline || 'Standard'}
                            </strong>
                          </div>
                        </div>

                        <p className="text-[14px] text-[#696D76] leading-relaxed">
                          {enq.description}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-[#E8E9ED] text-[12px] text-[#696D76]">
                          <div className="flex flex-wrap gap-4">
                            {enq.quantity && (
                              <span>
                                <strong className="text-[#15171B]">Quantity:</strong>{' '}
                                {enq.quantity}
                              </span>
                            )}
                            {(enq.budgetMin || enq.budgetMax) && (
                              <span>
                                <strong className="text-[#15171B]">Indicative Budget:</strong>{' '}
                                {enq.budgetMin
                                  ? `₹${enq.budgetMin.toLocaleString('en-IN')}`
                                  : ''}{' '}
                                {enq.budgetMax
                                  ? `– ₹${enq.budgetMax.toLocaleString('en-IN')}`
                                  : ''}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              setQuotingEnquiryId(
                                quotingEnquiryId === enq.id ? null : enq.id,
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#304FFE] hover:bg-[#243FE0] px-4 py-2 text-[12px] font-semibold text-white transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {quotingEnquiryId === enq.id
                                ? 'Cancel Quote'
                                : 'Submit Quotation'}
                            </span>
                          </button>
                        </div>

                        {quotingEnquiryId === enq.id && (
                          <form
                            onSubmit={(e) => handleSendQuotation(e, enq.id)}
                            className="mt-4 pt-4 border-t border-[#E8E9ED] bg-[#FAFAF8] p-5 rounded-[10px] space-y-4"
                          >
                            <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B]">
                              Send Official Quotation from {activeBusiness.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[12px] font-medium text-[#15171B] mb-1">
                                  Price Summary *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={quotePriceSummary}
                                  onChange={(e) =>
                                    setQuotePriceSummary(e.target.value)
                                  }
                                  placeholder="e.g., ₹2,40,000 all-inclusive"
                                  className="input-enterprise"
                                />
                              </div>
                              <div>
                                <label className="block text-[12px] font-medium text-[#15171B] mb-1">
                                  Numeric Quote (INR)
                                </label>
                                <input
                                  type="number"
                                  value={quotePriceAmount}
                                  onChange={(e) =>
                                    setQuotePriceAmount(e.target.value)
                                  }
                                  placeholder="240000"
                                  className="input-enterprise"
                                />
                              </div>
                              <div>
                                <label className="block text-[12px] font-medium text-[#15171B] mb-1">
                                  Delivery / Execution Timeline
                                </label>
                                <input
                                  type="text"
                                  value={quoteTimeline}
                                  onChange={(e) =>
                                    setQuoteTimeline(e.target.value)
                                  }
                                  placeholder="Within 7 working days"
                                  className="input-enterprise"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[12px] font-medium text-[#15171B] mb-1">
                                Proposal Details, Inclusions &amp; Terms *
                              </label>
                              <textarea
                                rows={3}
                                required
                                minLength={10}
                                value={quoteMessage}
                                onChange={(e) => setQuoteMessage(e.target.value)}
                                placeholder="Detail what is included in your quotation, warranty, payment milestones, or any clarifying questions…"
                                className="input-enterprise"
                              />
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={submittingQuote}
                                className="btn-accent"
                              >
                                {submittingQuote
                                  ? 'Sending Quotation…'
                                  : 'Send Quotation to Customer'}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="surface-card p-10 text-center">
                      <p className="text-[14px] text-[#696D76]">
                        No open customer enquiries currently match your category and service area. Keep your catalog updated so customers can discover and message you directly.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS & SERVICES CATALOG */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  {showAddListing && (
                    <form
                      onSubmit={handleCreateListing}
                      className="surface-card p-6 space-y-4"
                    >
                      <h3 className="text-[18px] font-bold text-[#15171B]">
                        Add Product or Service to Your Storefront
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                            Listing Title *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={3}
                            value={listingTitle}
                            onChange={(e) => setListingTitle(e.target.value)}
                            placeholder="e.g., Custom CNC Laser Sheet Metal Cutting"
                            className="input-enterprise"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                            Offering Type *
                          </label>
                          <select
                            value={listingType}
                            onChange={(e) =>
                              setListingType(e.target.value as ListingType)
                            }
                            className="input-enterprise"
                          >
                            <option value="PRODUCT">Product</option>
                            <option value="SERVICE">Service</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                          Description &amp; Specifications *
                        </label>
                        <textarea
                          rows={3}
                          required
                          minLength={15}
                          value={listingDesc}
                          onChange={(e) => setListingDesc(e.target.value)}
                          placeholder="Describe specifications, materials, turnaround time, or deliverables…"
                          className="input-enterprise"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                            Pricing Mode
                          </label>
                          <select
                            value={priceDisplayType}
                            onChange={(e) =>
                              setPriceDisplayType(
                                e.target.value as PriceDisplayType,
                              )
                            }
                            className="input-enterprise"
                          >
                            <option value="FIXED_PRICE">Fixed Price</option>
                            <option value="STARTING_FROM">Starting From</option>
                            <option value="PRICE_RANGE">Price Range</option>
                            <option value="CUSTOM_QUOTE">
                              Custom Quote / Request Pricing
                            </option>
                            <option value="FREE_INITIAL_CONSULTATION">
                              Free Initial Consultation
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                            Price (INR — Optional)
                          </label>
                          <input
                            type="number"
                            value={priceAmount}
                            onChange={(e) => setPriceAmount(e.target.value)}
                            placeholder="15000"
                            className="input-enterprise"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B] mb-1.5">
                            Unit (e.g., piece, project, sq.ft)
                          </label>
                          <input
                            type="text"
                            value={priceUnit}
                            onChange={(e) => setPriceUnit(e.target.value)}
                            placeholder="per project"
                            className="input-enterprise"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddListing(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingListing}
                          className="btn-accent"
                        >
                          {submittingListing
                            ? 'Publishing…'
                            : 'Publish to Storefront'}
                        </button>
                      </div>
                    </form>
                  )}

                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.map((item) => (
                        <div
                          key={item.id}
                          className="surface-card p-5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="badge-neutral">
                                {item.listingType}
                              </span>
                              <span className="text-[12px] text-[#696D76]">
                                {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                              </span>
                            </div>
                            <h4 className="text-[17px] font-bold text-[#15171B]">
                              {item.title}
                            </h4>
                            <p className="text-[13px] text-[#696D76] mt-1.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          {item.priceAmount && (
                            <div className="mt-4 pt-3 border-t border-[#E8E9ED] text-[15px] font-bold text-[#15171B]">
                              ₹{item.priceAmount.toLocaleString('en-IN')}
                              {item.priceUnit ? ` / ${item.priceUnit}` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="surface-card p-10 text-center">
                      <p className="text-[14px] text-[#696D76] mb-4">
                        You haven&apos;t added any products or services to your storefront yet.
                      </p>
                      <button
                        onClick={() => setShowAddListing(true)}
                        className="btn-accent"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Your First Product or Service</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STOREFRONT DETAILS */}
              {activeTab === 'storefront' && (
                <div className="surface-card p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E8E9ED] pb-4">
                    <h3 className="text-[18px] font-bold text-[#15171B]">
                      Storefront Identity &amp; Trust Status
                    </h3>
                    <Link
                      href={`/business/${activeBusiness.slug}`}
                      className="text-[13px] font-semibold text-[#304FFE] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Public Storefront</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                    <div className="p-4 rounded-[10px] bg-[#FAFAF8] border border-[#E8E9ED]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                        Public Storefront URL
                      </div>
                      <div className="font-mono font-medium text-[#15171B] mt-1">
                        /business/{activeBusiness.slug}
                      </div>
                    </div>
                    <div className="p-4 rounded-[10px] bg-[#FAFAF8] border border-[#E8E9ED]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
                        Verification Tier
                      </div>
                      <div className="font-semibold text-[#15171B] mt-1">
                        {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].label}
                      </div>
                      <p className="text-[12px] text-[#696D76] mt-0.5">
                        {VERIFICATION_BADGE_META[activeBusiness.verificationLevel].description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

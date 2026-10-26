'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  Inbox,
  FileText,
  BarChart3,
  CreditCard,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
  Users,
} from 'lucide-react';
import { BRAND_CONFIG, BUSINESS_SUBSCRIPTION_PLANS } from '@/lib/brand';
import {
  PRICE_DISPLAY_LABELS,
  VERIFICATION_BADGE_META,
  type BusinessListingDTO,
  type BusinessProfileDTO,
  type BusinessQuotationDTO,
  type BusinessSubscriptionDTO,
  type CustomerEnquiryDTO,
  type EnquiryMatchDTO,
} from '@/lib/marketplace/types';

interface DashboardData {
  business: BusinessProfileDTO;
  allUserBusinesses: BusinessProfileDTO[];
  analytics: {
    profileViews: number;
    enquiryClicks: number;
    contactClicks: number;
    matchedEnquiriesCount: number;
    quotationsSubmittedCount: number;
    shortlistedCount: number;
    acceptedCount: number;
    publishedListingsCount: number;
    averageRating: number | null;
    reviewCount: number;
  };
  matchedEnquiries: Array<{
    match: EnquiryMatchDTO;
    enquiry: CustomerEnquiryDTO;
    myQuotation: BusinessQuotationDTO | null;
  }>;
  quotations: BusinessQuotationDTO[];
  team: Array<{
    id: string;
    userId: string;
    email?: string;
    name?: string;
    role: string;
  }>;
  subscription?: BusinessSubscriptionDTO;
}

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'listings' | 'enquiries' | 'quotations' | 'subscription' | 'team'
  >('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Listing Form state
  const [listingTitle, setListingTitle] = useState('');
  const [listingType, setListingType] = useState<'PRODUCT' | 'SERVICE'>('SERVICE');
  const [priceDisplayType, setPriceDisplayType] = useState<
    'FIXED_PRICE' | 'INDICATIVE_PRICE' | 'PRICE_ON_REQUEST' | 'QUOTE_REQUIRED'
  >('INDICATIVE_PRICE');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceUnit, setPriceUnit] = useState('per project');
  const [listingDesc, setListingDesc] = useState('');
  const [deliveryTimeframe, setDeliveryTimeframe] = useState('5-7 working days');

  // Quotation modal / composer state
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [quoteSummary, setQuoteSummary] = useState('');
  const [quoteProposal, setQuoteProposal] = useState('');
  const [quotePriceType, setQuotePriceType] = useState<
    'FIXED_QUOTE' | 'INDICATIVE_ESTIMATE' | 'RANGE_ESTIMATE' | 'INSPECTION_REQUIRED'
  >('FIXED_QUOTE');
  const [quotePriceAmount, setQuotePriceAmount] = useState('');
  const [quoteDeliveryTimeline, setQuoteDeliveryTimeline] = useState('7 working days');
  const [quoteExclusions, setQuoteExclusions] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/business/dashboard');
      const json = await res.json();
      setData(json.dashboard || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.business) return;
    setStatusMessage(null);

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: data.business.id,
        categoryId: data.business.primaryCategoryId,
        title: listingTitle,
        listingType,
        priceDisplayType,
        priceAmount: priceAmount ? Number(priceAmount) : undefined,
        priceUnit,
        description: listingDesc,
        deliveryTimeframe,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatusMessage(json.message || json.error || 'Could not create listing');
      return;
    }

    setListingTitle('');
    setPriceAmount('');
    setListingDesc('');
    setStatusMessage('Product/Service listing published to your storefront.');
    loadDashboard();
  }

  async function handleSubmitQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.business || !selectedEnquiryId) return;
    setStatusMessage(null);

    const res = await fetch(`/api/enquiries/${selectedEnquiryId}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: data.business.id,
        summary: quoteSummary,
        detailedProposal: quoteProposal,
        priceType: quotePriceType,
        priceAmount: quotePriceAmount ? Number(quotePriceAmount) : undefined,
        deliveryTimeline: quoteDeliveryTimeline,
        exclusions: quoteExclusions || undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatusMessage(json.message || json.error || 'Failed to submit quotation');
      return;
    }

    setSelectedEnquiryId(null);
    setQuoteSummary('');
    setQuoteProposal('');
    setQuotePriceAmount('');
    setStatusMessage('Quotation submitted to the customer!');
    loadDashboard();
  }

  async function handleUpgradePlan(planTier: 'FREE' | 'PRO' | 'PREMIUM') {
    if (!data?.business) return;
    const res = await fetch('/api/business/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: data.business.id,
        planTier,
        billingCycle: 'MONTHLY',
      }),
    });
    if (res.ok) {
      setStatusMessage(`Subscription updated to ${planTier} plan.`);
      loadDashboard();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading Business Dashboard…
        </div>
      </div>
    );
  }

  if (!data?.business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-lg text-center">
          <Building2 className="w-10 h-10 text-foreground mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            No Business Storefront Registered Yet
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create your official digital storefront on {BRAND_CONFIG.name} to list
            your products and services, receive matched customer enquiries, and
            submit quotations.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/business/register"
              className="bg-foreground text-background text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              Register Your Business
            </Link>
            <Link
              href="/dashboard"
              className="border border-border text-foreground text-sm font-medium px-5 py-2.5 rounded-lg"
            >
              Customer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { business, analytics, matchedEnquiries, quotations, subscription, team } = data;
  const badge = VERIFICATION_BADGE_META[business.verificationLevel];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container-wide h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-lg font-bold text-foreground">
              {BRAND_CONFIG.name}
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm font-semibold text-foreground truncate max-w-[220px]">
              {business.name}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-medium hidden sm:inline">
              {badge.shortLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/business/${business.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
            >
              Public Storefront
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Customer View
            </Link>
          </div>
        </div>
      </header>

      <div className="container-wide py-8">
        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-emerald-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-8">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
            {
              id: 'enquiries',
              label: `Matched Enquiries (${matchedEnquiries.length})`,
              icon: Inbox,
            },
            {
              id: 'listings',
              label: `Products & Services (${(business.listings ?? []).length})`,
              icon: Package,
            },
            {
              id: 'quotations',
              label: `Quotations Sent (${quotations.length})`,
              icon: FileText,
            },
            { id: 'team', label: `Team (${team.length})`, icon: Users },
            { id: 'subscription', label: 'Plan & Billing', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-xs text-muted-foreground">Storefront Views</div>
                <div className="font-display text-3xl font-bold text-foreground mt-1">
                  {analytics.profileViews}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-xs text-muted-foreground">Matched Enquiries</div>
                <div className="font-display text-3xl font-bold text-foreground mt-1">
                  {analytics.matchedEnquiriesCount}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-xs text-muted-foreground">Quotations Sent</div>
                <div className="font-display text-3xl font-bold text-foreground mt-1">
                  {analytics.quotationsSubmittedCount}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="text-xs text-muted-foreground">
                  Shortlisted / Accepted
                </div>
                <div className="font-display text-3xl font-bold text-emerald-700 mt-1">
                  {analytics.shortlistedCount} / {analytics.acceptedCount}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {business.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Storefront URL:{' '}
                    <Link
                      href={`/business/${business.slug}`}
                      className="text-primary underline"
                    >
                      /business/{business.slug}
                    </Link>{' '}
                    &middot; Status: <strong>{business.status}</strong> &middot;
                    Plan: <strong>{subscription?.planTier || 'FREE'}</strong>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-foreground text-background"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Product / Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATCHED ENQUIRIES & QUOTATION COMPOSER */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Matched Customer Enquiries ({matchedEnquiries.length})
              </h2>
              <span className="text-xs text-muted-foreground">
                Monthly Quotations Used: {subscription?.quotationsUsedMonth ?? 0} /{' '}
                {subscription?.quotationsLimitMonth ?? 5}
              </span>
            </div>

            {matchedEnquiries.length > 0 ? (
              <div className="space-y-4">
                {matchedEnquiries.map(({ match, enquiry, myQuotation }) => (
                  <div
                    key={match.id}
                    className="bg-card border border-border rounded-xl p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {match.matchScore}% Match
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Ref: {enquiry.referenceCode}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground">
                          {enquiry.status}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {enquiry.city}, {enquiry.state}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {enquiry.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                        {enquiry.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {enquiry.budgetMax && (
                        <span>
                          Budget: ₹{(enquiry.budgetMin ?? 0).toLocaleString('en-IN')}{' '}
                          – ₹{enquiry.budgetMax.toLocaleString('en-IN')}
                        </span>
                      )}
                      {enquiry.timeline && <span>Timeline: {enquiry.timeline}</span>}
                      {enquiry.quantity && <span>Quantity: {enquiry.quantity}</span>}
                    </div>

                    {myQuotation ? (
                      <div className="p-3.5 rounded-lg bg-secondary/50 border border-border text-xs flex items-center justify-between">
                        <div>
                          <strong className="text-foreground">
                            Your Quotation ({myQuotation.referenceCode}):
                          </strong>{' '}
                          {myQuotation.summary} —{' '}
                          {myQuotation.priceAmount
                            ? `₹${myQuotation.priceAmount.toLocaleString('en-IN')}`
                            : myQuotation.priceType}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-card border border-border font-semibold">
                          {myQuotation.status}
                        </span>
                      </div>
                    ) : selectedEnquiryId === enquiry.id ? (
                      <form
                        onSubmit={handleSubmitQuotation}
                        className="p-4 rounded-xl bg-background border border-border space-y-4"
                      >
                        <h4 className="font-semibold text-sm text-foreground">
                          Submit Quotation for {enquiry.referenceCode}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Quote Type
                            </label>
                            <select
                              value={quotePriceType}
                              onChange={(e) =>
                                setQuotePriceType(
                                  e.target.value as typeof quotePriceType,
                                )
                              }
                              className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg"
                            >
                              <option value="FIXED_QUOTE">Fixed Quote</option>
                              <option value="INDICATIVE_ESTIMATE">
                                Indicative Estimate
                              </option>
                              <option value="INSPECTION_REQUIRED">
                                Site Inspection Required
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Quoted Price (INR)
                            </label>
                            <input
                              type="number"
                              value={quotePriceAmount}
                              onChange={(e) => setQuotePriceAmount(e.target.value)}
                              placeholder="e.g., 45000"
                              className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Delivery / Execution Timeline *
                            </label>
                            <input
                              type="text"
                              required
                              value={quoteDeliveryTimeline}
                              onChange={(e) =>
                                setQuoteDeliveryTimeline(e.target.value)
                              }
                              className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Headline Summary *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={5}
                            value={quoteSummary}
                            onChange={(e) => setQuoteSummary(e.target.value)}
                            placeholder="Complete supply & installation with 2-year warranty"
                            className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Detailed Proposal, Scope &amp; Terms *
                          </label>
                          <textarea
                            rows={3}
                            required
                            minLength={20}
                            value={quoteProposal}
                            onChange={(e) => setQuoteProposal(e.target.value)}
                            placeholder="Specify deliverables, specifications, payment milestones, and validity…"
                            className="w-full px-3 py-2 text-xs bg-card border border-border rounded-lg"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiryId(null)}
                            className="px-3 py-1.5 text-xs border border-border rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-foreground text-background rounded-md"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Quotation
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setSelectedEnquiryId(enquiry.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Respond with Quotation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
                No matched customer enquiries yet. Ensure your products and services
                are listed so our matching engine can connect relevant customer
                enquiries to your business.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS & SERVICES */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <form
                onSubmit={handleCreateListing}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <h3 className="font-display text-lg font-bold text-foreground">
                  Add Product or Service Listing
                </h3>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Offering Title *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={listingTitle}
                    onChange={(e) => setListingTitle(e.target.value)}
                    placeholder="e.g., Commercial Solar Panel Installation"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Listing Type
                    </label>
                    <select
                      value={listingType}
                      onChange={(e) =>
                        setListingType(e.target.value as 'PRODUCT' | 'SERVICE')
                      }
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    >
                      <option value="SERVICE">Service</option>
                      <option value="PRODUCT">Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Price Display Mode
                    </label>
                    <select
                      value={priceDisplayType}
                      onChange={(e) =>
                        setPriceDisplayType(
                          e.target.value as typeof priceDisplayType,
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    >
                      <option value="INDICATIVE_PRICE">Indicative Price</option>
                      <option value="FIXED_PRICE">Fixed Price</option>
                      <option value="PRICE_ON_REQUEST">Price on Request</option>
                      <option value="QUOTE_REQUIRED">Quote Required</option>
                    </select>
                  </div>
                </div>

                {(priceDisplayType === 'FIXED_PRICE' ||
                  priceDisplayType === 'INDICATIVE_PRICE') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Price (INR) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        placeholder="25000"
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value)}
                        placeholder="per unit / per project"
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Description &amp; Specifications (Min 20 chars) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    minLength={20}
                    value={listingDesc}
                    onChange={(e) => setListingDesc(e.target.value)}
                    placeholder="Describe specifications, materials, deliverables, or service scope…"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-foreground text-background text-sm font-semibold py-2.5 rounded-lg hover:bg-foreground/90"
                >
                  Publish Offering
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display text-lg font-bold text-foreground">
                Your Storefront Offerings ({(business.listings ?? []).length} /{' '}
                {subscription?.listingsLimit ?? 5})
              </h3>
              {(business.listings ?? []).map((item: BusinessListingDTO) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary">
                        {item.listingType}
                      </span>
                      <span className="font-semibold text-sm text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-foreground">
                      {item.priceAmount
                        ? `₹${item.priceAmount.toLocaleString('en-IN')}`
                        : PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: QUOTATIONS SENT */}
        {activeTab === 'quotations' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Submitted Quotations ({quotations.length})
            </h2>
            {quotations.length > 0 ? (
              quotations.map((q) => (
                <div
                  key={q.id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {q.referenceCode} &middot; Timeline: {q.deliveryTimeline}
                    </div>
                    <div className="font-semibold text-base text-foreground mt-0.5">
                      {q.summary}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {q.detailedProposal}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                      {q.priceAmount
                        ? `₹${q.priceAmount.toLocaleString('en-IN')}`
                        : q.priceType}
                    </div>
                    <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                You have not submitted any quotations yet.
              </p>
            )}
          </div>
        )}

        {/* TAB 5: TEAM */}
        {activeTab === 'team' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Team Members ({team.length} / {subscription?.teamMembersLimit ?? 1})
            </h2>
            <div className="space-y-2">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-background border border-border flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-foreground">
                    {m.name || m.email || m.userId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-secondary font-semibold">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SUBSCRIPTION & BILLING */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(BUSINESS_SUBSCRIPTION_PLANS).map((plan) => {
              const isCurrent = subscription?.planTier === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`bg-card border rounded-xl p-6 flex flex-col justify-between ${
                    isCurrent ? 'border-foreground ring-1 ring-foreground' : 'border-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      ₹{plan.monthlyPriceInr.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        / month
                      </span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={isCurrent}
                    onClick={() => handleUpgradePlan(plan.tier)}
                    className="mt-6 w-full py-2.5 rounded-lg text-xs font-semibold bg-foreground text-background disabled:opacity-40"
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

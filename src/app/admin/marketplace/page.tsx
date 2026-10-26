'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Package,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  VERIFICATION_BADGE_META,
  type BusinessListingDTO,
  type BusinessProfileDTO,
  type CustomerEnquiryDTO,
  type MarketplaceCategoryDTO,
  type VerificationLevel,
} from '@/lib/marketplace/types';

interface AdminOverviewData {
  metrics: {
    totalBusinesses: number;
    publishedBusinesses: number;
    pendingReviewBusinesses: number;
    suspendedBusinesses: number;
    verifiedBusinesses: number;
    totalListings: number;
    publishedListings: number;
    totalEnquiries: number;
    openEnquiries: number;
    totalQuotations: number;
    openReports: number;
    topLevelCategories: number;
  };
  businesses: BusinessProfileDTO[];
  listings: BusinessListingDTO[];
  enquiries: CustomerEnquiryDTO[];
  reports: Array<{
    id: string;
    targetType: string;
    targetId: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
  }>;
  categories: MarketplaceCategoryDTO[];
}

export default function AdminMarketplaceModerationPage() {
  const [activeTab, setActiveTab] = useState<
    'businesses' | 'enquiries' | 'listings' | 'categories' | 'reports'
  >('businesses');
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplace');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  async function runModerationAction(payload: {
    resourceType: 'BUSINESS' | 'LISTING' | 'ENQUIRY' | 'REPORT';
    resourceId: string;
    action: string;
    verificationLevel?: VerificationLevel;
    note?: string;
  }) {
    setActionMsg(null);
    const res = await fetch('/api/admin/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setActionMsg(`Moderation action ${payload.action} executed.`);
      loadOverview();
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCatName,
        description: newCatDesc,
      }),
    });
    if (res.ok) {
      setNewCatName('');
      setNewCatDesc('');
      setActionMsg('New marketplace category created.');
      loadOverview();
    }
  }

  if (loading || !data) {
    return (
      <div className="p-10 flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading Marketplace Moderation Portal…
      </div>
    );
  }

  const { metrics, businesses, enquiries, listings, categories, reports } = data;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
          Universal Business Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111820] mt-1">
          Marketplace Moderation, Verification &amp; Taxonomy
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review business storefronts, assign honest verification badges, moderate
          listings and customer enquiries, and manage the universal category
          taxonomy.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Businesses</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalBusinesses}
          </div>
          <div className="text-[11px] text-emerald-700">
            {metrics.publishedBusinesses} published
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Verified</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {metrics.verifiedBusinesses}
          </div>
          <div className="text-[11px] text-gray-500">Docs / Full verified</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Listings</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalListings}
          </div>
          <div className="text-[11px] text-gray-500">
            {metrics.publishedListings} active
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Enquiries</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalEnquiries}
          </div>
          <div className="text-[11px] text-emerald-700">
            {metrics.openEnquiries} open
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Quotations</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalQuotations}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Open Reports</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {metrics.openReports}
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionMsg}
          </span>
          <button
            onClick={() => setActionMsg(null)}
            className="underline text-emerald-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          {
            id: 'businesses',
            label: `Businesses & Verification (${businesses.length})`,
            icon: Building2,
          },
          {
            id: 'enquiries',
            label: `Enquiries (${enquiries.length})`,
            icon: FileText,
          },
          {
            id: 'listings',
            label: `Listings (${listings.length})`,
            icon: Package,
          },
          {
            id: 'categories',
            label: `Categories (${categories.length})`,
            icon: Layers,
          },
          {
            id: 'reports',
            label: `Abuse Reports (${reports.length})`,
            icon: AlertTriangle,
          },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold ${
                activeTab === t.id
                  ? 'bg-[#111820] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BUSINESSES & VERIFICATION */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          {businesses.length > 0 ? (
            businesses.map((biz) => {
              const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
              return (
                <div
                  key={biz.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/business/${biz.slug}`}
                        className="font-bold text-base text-gray-900 hover:underline"
                      >
                        {biz.name}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {biz.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Slug: /business/{biz.slug} &middot; City: {biz.city},{' '}
                      {biz.state} &middot; GST: {biz.gstNumber || 'Not provided'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={biz.verificationLevel}
                      onChange={(e) =>
                        runModerationAction({
                          resourceType: 'BUSINESS',
                          resourceId: biz.id,
                          action: 'SET_VERIFICATION_LEVEL',
                          verificationLevel: e.target.value as VerificationLevel,
                        })
                      }
                      aria-label="Set Verification Level"
                      className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
                    >
                      <option value="UNVERIFIED">Unverified</option>
                      <option value="SELF_REPORTED">Self-Reported</option>
                      <option value="CONTACT_VERIFIED">Contact Verified</option>
                      <option value="DOCUMENT_REVIEWED">Document Reviewed</option>
                      <option value="VERIFIED_BUSINESS">Verified Business</option>
                    </select>

                    {biz.status !== 'PUBLISHED' && (
                      <button
                        onClick={() =>
                          runModerationAction({
                            resourceType: 'BUSINESS',
                            resourceId: biz.id,
                            action: 'APPROVE_BUSINESS',
                          })
                        }
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 text-white"
                      >
                        Approve / Publish
                      </button>
                    )}

                    {biz.status !== 'SUSPENDED' && (
                      <button
                        onClick={() =>
                          runModerationAction({
                            resourceType: 'BUSINESS',
                            resourceId: biz.id,
                            action: 'SUSPEND_BUSINESS',
                          })
                        }
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
              No businesses registered yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-3">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs text-gray-500">
                  {enq.referenceCode} &middot; {enq.city}, {enq.state} &middot;
                  Status: <strong>{enq.status}</strong>
                </div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {enq.title}
                </div>
                <p className="text-xs text-gray-600 mt-1">{enq.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() =>
                    runModerationAction({
                      resourceType: 'ENQUIRY',
                      resourceId: enq.id,
                      action: 'FLAG_ENQUIRY',
                    })
                  }
                  className="text-xs px-3 py-1.5 rounded border border-amber-300 bg-amber-50 text-amber-900"
                >
                  Flag
                </button>
                <button
                  onClick={() =>
                    runModerationAction({
                      resourceType: 'ENQUIRY',
                      resourceId: enq.id,
                      action: 'CLOSE_ENQUIRY',
                    })
                  }
                  className="text-xs px-3 py-1.5 rounded border border-gray-300 bg-gray-100 text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-3">
          {listings.map((lst) => (
            <div
              key={lst.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-sm text-gray-900">{lst.title}</div>
                <div className="text-xs text-gray-500">
                  Business: {lst.businessName} &middot; Status: {lst.status}
                </div>
              </div>
              <div className="flex gap-2">
                {lst.status === 'PUBLISHED' ? (
                  <button
                    onClick={() =>
                      runModerationAction({
                        resourceType: 'LISTING',
                        resourceId: lst.id,
                        action: 'SUSPEND_LISTING',
                      })
                    }
                    className="text-xs px-3 py-1.5 rounded bg-red-600 text-white"
                  >
                    Suspend Listing
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      runModerationAction({
                        resourceType: 'LISTING',
                        resourceId: lst.id,
                        action: 'RESTORE_LISTING',
                      })
                    }
                    className="text-xs px-3 py-1.5 rounded bg-emerald-700 text-white"
                  >
                    Restore Listing
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <form
              onSubmit={handleAddCategory}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
            >
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Add Top-Level Category
              </h3>
              <input
                type="text"
                required
                placeholder="Category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Category description"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold bg-[#111820] text-white rounded-lg"
              >
                Create Category
              </button>
            </form>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="font-bold text-sm text-gray-900">{cat.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Slug: {cat.slug} &middot; {(cat.subcategories ?? []).length}{' '}
                  subcategories
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-xs text-gray-500">
                  Target: {rep.targetType} ({rep.targetId}) &middot; Status:{' '}
                  <strong>{rep.status}</strong>
                </div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {rep.reason}
                </div>
                {rep.details && (
                  <p className="text-xs text-gray-600 mt-1">{rep.details}</p>
                )}
              </div>
              {rep.status === 'OPEN' && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      runModerationAction({
                        resourceType: 'REPORT',
                        resourceId: rep.id,
                        action: 'RESOLVE_REPORT',
                      })
                    }
                    className="text-xs px-3 py-1.5 rounded bg-emerald-700 text-white"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() =>
                      runModerationAction({
                        resourceType: 'REPORT',
                        resourceId: rep.id,
                        action: 'DISMISS_REPORT',
                      })
                    }
                    className="text-xs px-3 py-1.5 rounded border border-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

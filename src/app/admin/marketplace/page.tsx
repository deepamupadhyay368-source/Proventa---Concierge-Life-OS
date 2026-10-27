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
  X,
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

interface PendingConfirmAction {
  title: string;
  description: string;
  confirmLabel: string;
  payload: {
    resourceType: 'BUSINESS' | 'LISTING' | 'ENQUIRY' | 'REPORT';
    resourceId: string;
    action: string;
    verificationLevel?: VerificationLevel;
    note?: string;
  };
}

export default function AdminMarketplaceModerationPage() {
  const [activeTab, setActiveTab] = useState<
    'businesses' | 'enquiries' | 'listings' | 'categories' | 'reports'
  >('businesses');
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<PendingConfirmAction | null>(null);

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
    setConfirmDialog(null);
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
      <div className="surface-card p-10 flex items-center gap-2.5 text-[14px] text-[#696D76]">
        <Loader2 className="w-4 h-4 animate-spin text-[#304FFE]" />
        <span>Loading Marketplace Moderation Portal…</span>
      </div>
    );
  }

  const { metrics, businesses, enquiries, listings, categories, reports } = data;

  return (
    <div className="space-y-8 text-[#15171B]">
      {/* Destructive Action Confirmation Dialog Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101319]/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="surface-card max-w-md w-full p-6 space-y-4 shadow-elevated">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-[#C53B43]">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 id="confirm-dialog-title" className="text-[17px] font-bold text-[#15171B]">
                  {confirmDialog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="text-[#696D76] hover:text-[#15171B]"
                aria-label="Close confirmation dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-[#696D76] leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="btn-secondary px-4 py-2 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runModerationAction(confirmDialog.payload)}
                className="inline-flex items-center justify-center rounded-[9px] bg-[#C53B43] hover:bg-[#A82E35] px-4 py-2 text-[13px] font-semibold text-white transition-colors"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
          Universal Business Platform Governance
        </span>
        <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.025em] text-[#15171B] mt-1">
          Marketplace Moderation, Verification &amp; Taxonomy
        </h1>
        <p className="text-[14px] text-[#696D76] mt-1">
          Review business storefronts, assign honest verification badges, moderate
          listings and customer enquiries, and manage the universal category
          taxonomy.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Businesses
          </div>
          <div className="text-[24px] font-bold text-[#15171B] mt-1">
            {metrics.totalBusinesses}
          </div>
          <div className="text-[11px] text-[#16845B] font-medium">
            {metrics.publishedBusinesses} published
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Verified
          </div>
          <div className="text-[24px] font-bold text-[#16845B] mt-1">
            {metrics.verifiedBusinesses}
          </div>
          <div className="text-[11px] text-[#696D76]">Docs / Full verified</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Listings
          </div>
          <div className="text-[24px] font-bold text-[#15171B] mt-1">
            {metrics.totalListings}
          </div>
          <div className="text-[11px] text-[#696D76]">
            {metrics.publishedListings} active
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Enquiries
          </div>
          <div className="text-[24px] font-bold text-[#304FFE] mt-1">
            {metrics.totalEnquiries}
          </div>
          <div className="text-[11px] text-[#16845B] font-medium">
            {metrics.openEnquiries} open
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Quotations
          </div>
          <div className="text-[24px] font-bold text-[#15171B] mt-1">
            {metrics.totalQuotations}
          </div>
          <div className="text-[11px] text-[#696D76]">Submitted responses</div>
        </div>
        <div className="surface-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76]">
            Open Reports
          </div>
          <div className="text-[24px] font-bold text-[#B7791F] mt-1">
            {metrics.openReports}
          </div>
          <div className="text-[11px] text-[#696D76]">Moderation queue</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-[10px] bg-[#ECFDF5] border border-[#16845B]/25 text-[#16845B] text-[13px] font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionMsg}
          </span>
          <button
            onClick={() => setActionMsg(null)}
            className="underline text-[#16845B] text-[12px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E9ED] pb-3">
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[9px] text-[12px] font-semibold transition-colors ${
                activeTab === t.id
                  ? 'bg-[#15171B] text-white'
                  : 'bg-[#FFFFFF] border border-[#E8E9ED] text-[#696D76] hover:text-[#15171B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
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
                  className="surface-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/business/${biz.slug}`}
                        className="font-bold text-[16px] text-[#15171B] hover:text-[#304FFE] transition-colors"
                      >
                        {biz.name}
                      </Link>
                      <span className="badge-neutral">{biz.status}</span>
                      <span className="badge-verified">{badge.label}</span>
                    </div>
                    <div className="text-[12px] text-[#696D76] mt-1">
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
                      className="text-[12px] border border-[#E8E9ED] rounded-[8px] px-3 py-1.5 bg-[#FFFFFF] text-[#15171B]"
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
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#16845B] hover:bg-[#126B49] text-white transition-colors"
                      >
                        Approve / Publish
                      </button>
                    )}

                    {biz.status !== 'SUSPENDED' && (
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            title: `Suspend ${biz.name}?`,
                            description:
                              'Suspending this business will immediately remove its public storefront from search results until restored by an administrator.',
                            confirmLabel: 'Confirm Suspension',
                            payload: {
                              resourceType: 'BUSINESS',
                              resourceId: biz.id,
                              action: 'SUSPEND_BUSINESS',
                            },
                          })
                        }
                        className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#C53B43] hover:bg-[#A82E35] text-white transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="surface-card p-8 text-center text-[14px] text-[#696D76]">
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
              className="surface-card p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-[12px] text-[#696D76]">
                  <span className="font-mono font-semibold text-[#304FFE]">
                    {enq.referenceCode}
                  </span>{' '}
                  &middot; {enq.city}, {enq.state} &middot; Status:{' '}
                  <strong className="text-[#15171B]">{enq.status}</strong>
                </div>
                <div className="font-bold text-[15px] text-[#15171B] mt-0.5">
                  {enq.title}
                </div>
                <p className="text-[13px] text-[#696D76] mt-1">{enq.description}</p>
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
                  className="text-[12px] font-medium px-3 py-1.5 rounded-[8px] border border-[#B7791F]/30 bg-[#FFFBEB] text-[#B7791F]"
                >
                  Flag
                </button>
                <button
                  onClick={() =>
                    setConfirmDialog({
                      title: `Close Enquiry ${enq.referenceCode}?`,
                      description:
                        'Closing this enquiry prevents additional businesses from submitting new quotations.',
                      confirmLabel: 'Close Enquiry',
                      payload: {
                        resourceType: 'ENQUIRY',
                        resourceId: enq.id,
                        action: 'CLOSE_ENQUIRY',
                      },
                    })
                  }
                  className="text-[12px] font-medium px-3 py-1.5 rounded-[8px] border border-[#E8E9ED] bg-[#F2F3F6] text-[#15171B]"
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
              className="surface-card p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-bold text-[15px] text-[#15171B]">
                  {lst.title}
                </div>
                <div className="text-[12px] text-[#696D76]">
                  Business: {lst.businessName} &middot; Status: {lst.status}
                </div>
              </div>
              <div className="flex gap-2">
                {lst.status === 'PUBLISHED' ? (
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        title: `Suspend Listing "${lst.title}"?`,
                        description:
                          'This catalog item will be hidden from public search and storefront views.',
                        confirmLabel: 'Suspend Listing',
                        payload: {
                          resourceType: 'LISTING',
                          resourceId: lst.id,
                          action: 'SUSPEND_LISTING',
                        },
                      })
                    }
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#C53B43] text-white"
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
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#16845B] text-white"
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
              className="surface-card p-5 space-y-3"
            >
              <h3 className="font-bold text-[14px] text-[#15171B] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#304FFE]" />
                <span>Add Top-Level Category</span>
              </h3>
              <input
                type="text"
                required
                placeholder="Category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input-enterprise"
              />
              <textarea
                rows={2}
                placeholder="Category description"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="input-enterprise"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-[13px] font-semibold bg-[#15171B] hover:bg-[#304FFE] text-white rounded-[9px] transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="surface-card p-4">
                <div className="font-bold text-[14px] text-[#15171B]">
                  {cat.name}
                </div>
                <div className="text-[12px] text-[#696D76] mt-0.5">
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
              className="surface-card p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-[12px] text-[#696D76]">
                  Target: {rep.targetType} ({rep.targetId}) &middot; Status:{' '}
                  <strong className="text-[#15171B]">{rep.status}</strong>
                </div>
                <div className="font-bold text-[14px] text-[#15171B] mt-0.5">
                  {rep.reason}
                </div>
                {rep.details && (
                  <p className="text-[13px] text-[#696D76] mt-1">{rep.details}</p>
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
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-[8px] bg-[#16845B] text-white"
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
                    className="text-[12px] font-medium px-3 py-1.5 rounded-[8px] border border-[#E8E9ED] bg-[#FFFFFF]"
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

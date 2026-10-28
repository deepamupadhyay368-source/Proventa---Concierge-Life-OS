'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import {
  BusinessProfileDTO,
  CustomerEnquiryDTO,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';

interface MarketplaceStatsSummary {
  totalPublishedBusinesses: number;
  totalVerifiedBusinesses: number;
  totalActiveListings: number;
  totalOpenEnquiries: number;
  totalQuotationsSent: number;
}

export default function AdminMarketplaceGovernancePage() {
  const [stats, setStats] = useState<MarketplaceStatsSummary | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfileDTO[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  async function fetchGovernanceData() {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/admin');
      const data = await res.json();
      setStats(data.stats || null);
      setBusinesses(data.businesses || []);
      setEnquiries(data.enquiries || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchGovernanceData();
  }, []);

  async function runModerationAction(
    businessId: string,
    payload: Record<string, unknown>,
    label: string,
  ) {
    setActionBanner(null);
    const res = await fetch('/api/marketplace/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, ...payload }),
    });
    if (res.ok) {
      setActionBanner(`Governance action recorded: ${label}`);
      await fetchGovernanceData();
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D5CBB8] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D] block mb-2">
            Admin · Marketplace Governance
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#181914]">
            Marketplace Moderation &amp; Verification
          </h1>
        </div>
        <Link href="/businesses" className="btn-secondary">
          <span>Inspect Public Directory</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {actionBanner && (
        <div className="p-4 border border-[#B94E2D] bg-[#B94E2D]/10 font-mono text-xs font-medium text-[#181914]">
          ✓ {actionBanner}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#D5CBB8] bg-[#FAF6EC] divide-y lg:divide-y-0 divide-x divide-[#D5CBB8]">
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Published Businesses
            </div>
            <div className="mt-1.5 font-display text-3xl text-[#181914]">
              {stats.totalPublishedBusinesses}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Verified Businesses
            </div>
            <div className="mt-1.5 font-display text-3xl text-[#181914]">
              {stats.totalVerifiedBusinesses}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Active Offerings
            </div>
            <div className="mt-1.5 font-display text-3xl text-[#181914]">
              {stats.totalActiveListings}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Open Enquiries
            </div>
            <div className="mt-1.5 font-display text-3xl text-[#181914]">
              {stats.totalOpenEnquiries}
            </div>
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Quotations Sent
            </div>
            <div className="mt-1.5 font-display text-3xl text-[#181914]">
              {stats.totalQuotationsSent}
            </div>
          </div>
        </div>
      )}

      {/* Business Storefront Moderation Table */}
      <div className="border border-[#D5CBB8] bg-[#FAF6EC]">
        <div className="p-4 bg-[#171A14] text-[#F6F0E4] font-mono text-xs uppercase tracking-[0.14em] flex items-center justify-between">
          <span>Registered Businesses ({businesses.length})</span>
          <span className="text-[#A98253]">Verification &amp; Status Controls</span>
        </div>

        {loading ? (
          <div className="p-8 font-mono text-xs text-[#6B675E]">
            Loading marketplace moderation data...
          </div>
        ) : businesses.length > 0 ? (
          <div className="divide-y divide-[#D5CBB8]">
            {businesses.map((biz) => {
              const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
              const categoryLabel =
                biz.primaryCategory?.name || biz.primaryCategoryId;
              return (
                <div
                  key={biz.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] mb-1">
                      <span className="badge-neutral">{biz.status}</span>
                      <span
                        className={
                          badge.isVerified ? 'badge-verified' : 'badge-neutral'
                        }
                      >
                        {badge.isVerified && <ShieldCheck className="h-3 w-3" />}
                        {badge.shortLabel}
                      </span>
                      <span className="text-[#6B675E]">
                        {categoryLabel} · {biz.city}
                      </span>
                    </div>
                    <Link
                      href={`/business/${biz.slug}`}
                      className="font-display text-2xl font-normal text-[#181914] hover:text-[#B94E2D]"
                    >
                      {biz.name}
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        runModerationAction(
                          biz.id,
                          {
                            verificationLevel: 'VERIFIED_BUSINESS',
                            status: 'PUBLISHED',
                          },
                          `${biz.name} -> VERIFIED_BUSINESS`,
                        )
                      }
                      className="px-3.5 py-2 bg-[#B94E2D] text-[#F6F0E4] uppercase tracking-[0.1em] hover:bg-[#9E3F22] transition-colors"
                    >
                      Verify Business
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runModerationAction(
                          biz.id,
                          { featured: !biz.featured },
                          `${biz.name} -> FEATURED=${!biz.featured}`,
                        )
                      }
                      className="px-3.5 py-2 border border-[#D5CBB8] bg-[#F5F0E5] text-[#181914] uppercase tracking-[0.1em] hover:border-[#181914]"
                    >
                      {biz.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runModerationAction(
                          biz.id,
                          {
                            status:
                              biz.status === 'SUSPENDED'
                                ? 'PUBLISHED'
                                : 'SUSPENDED',
                          },
                          `${biz.name} status toggled`,
                        )
                      }
                      className="px-3.5 py-2 border border-[#D5CBB8] bg-[#E9DFCC] text-[#9E2A2B] uppercase tracking-[0.1em]"
                    >
                      {biz.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 font-mono text-xs text-[#6B675E]">
            No businesses registered in this instance yet.
          </div>
        )}
      </div>

      {/* Buyer Enquiries Audit */}
      <div className="border border-[#D5CBB8] bg-[#FAF6EC]">
        <div className="p-4 border-b border-[#D5CBB8] bg-[#E9DFCC] font-mono text-xs uppercase tracking-[0.14em] text-[#181914]">
          Recent Customer Enquiries ({enquiries.length})
        </div>
        <div className="divide-y divide-[#D5CBB8]">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="p-4 flex items-center justify-between font-mono text-xs"
            >
              <div>
                <span className="font-semibold text-[#181914] mr-2">
                  {enq.referenceCode}
                </span>
                <span className="text-[#5C584F]">{enq.title}</span>
              </div>
              <span className="badge-neutral">{enq.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

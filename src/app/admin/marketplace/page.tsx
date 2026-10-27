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
      setActionBanner(`GOVERNANCE ACTION RECORDED: ${label}`);
      await fetchGovernanceData();
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-[#0D0E11] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="index-code-lime mb-2">ADMIN // MARKETPLACE GOVERNANCE</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
            THE BUSINESS INDEX — MODERATION &amp; TRUST LEDGER
          </h1>
        </div>
        <Link href="/businesses" className="btn-secondary">
          <span>INSPECT PUBLIC DIRECTORY</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {actionBanner && (
        <div className="p-4 border border-[#0D0E11] bg-[#C8F904] font-mono text-xs font-bold text-[#0D0E11]">
          ✓ {actionBanner}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#0D0E11] bg-[#FAF8F3] divide-y lg:divide-y-0 divide-x divide-[#0D0E11] font-mono">
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              PUBLISHED ENTITIES
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0D0E11]">
              {stats.totalPublishedBusinesses}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              VERIFIED ENTITIES
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0D0E11]">
              {stats.totalVerifiedBusinesses}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              ACTIVE OFFERINGS
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0D0E11]">
              {stats.totalActiveListings}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              OPEN BUYER RFQS
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0D0E11]">
              {stats.totalOpenEnquiries}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
              ISSUED QUOTATIONS
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0D0E11]">
              {stats.totalQuotationsSent}
            </div>
          </div>
        </div>
      )}

      {/* Business Storefront Moderation Table */}
      <div className="border-2 border-[#0D0E11] bg-[#FAF8F3]">
        <div className="p-4 bg-[#0D0E11] text-[#F4F1EA] font-mono text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-between">
          <span>REGISTERED ENTITIES ({businesses.length})</span>
          <span className="text-[#C8F904]">VERIFICATION &amp; STATUS CONTROLS</span>
        </div>

        {loading ? (
          <div className="p-8 font-mono text-xs">LOADING GOVERNANCE LEDGER...</div>
        ) : businesses.length > 0 ? (
          <div className="divide-y divide-[#0D0E11]">
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
                      <span className="index-code">{biz.status}</span>
                      <span
                        className={
                          badge.isVerified ? 'badge-verified' : 'badge-neutral'
                        }
                      >
                        {badge.isVerified && <ShieldCheck className="h-3 w-3" />}
                        {badge.shortLabel}
                      </span>
                      <span className="text-[#52514E]">
                        {categoryLabel} · {biz.city}
                      </span>
                    </div>
                    <Link
                      href={`/business/${biz.slug}`}
                      className="font-display text-xl font-bold text-[#0D0E11] hover:underline"
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
                          { verificationLevel: 'VERIFIED_BUSINESS', status: 'PUBLISHED' },
                          `${biz.name} -> VERIFIED_BUSINESS`,
                        )
                      }
                      className="px-3 py-1.5 border border-[#0D0E11] bg-[#C8F904] text-[#0D0E11] font-bold uppercase hover:bg-[#0D0E11] hover:text-[#C8F904]"
                    >
                      VERIFY ENTITY
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
                      className="px-3 py-1.5 border border-[#0D0E11] bg-[#FAF8F3] text-[#0D0E11] font-bold uppercase hover:bg-[#EAE5DA]"
                    >
                      {biz.featured ? 'UNFEATURE' : 'FEATURE'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runModerationAction(
                          biz.id,
                          {
                            status:
                              biz.status === 'SUSPENDED' ? 'PUBLISHED' : 'SUSPENDED',
                          },
                          `${biz.name} STATUS TOGGLED`,
                        )
                      }
                      className="px-3 py-1.5 border border-[#0D0E11] bg-[#EAE5DA] text-[#B8232A] font-bold uppercase"
                    >
                      {biz.status === 'SUSPENDED' ? 'RESTORE' : 'SUSPEND'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 font-mono text-xs text-[#52514E]">
            NO ENTITIES REGISTERED IN THIS INSTANCE YET.
          </div>
        )}
      </div>

      {/* Buyer Enquiries Audit */}
      <div className="border border-[#0D0E11] bg-[#FAF8F3]">
        <div className="p-4 border-b border-[#0D0E11] bg-[#EAE5DA] font-mono text-xs font-bold uppercase tracking-[0.14em]">
          RECENT BUYER ENQUIRIES ({enquiries.length})
        </div>
        <div className="divide-y divide-[#CFCAC0]">
          {enquiries.map((enq) => (
            <div key={enq.id} className="p-4 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="font-bold text-[#0D0E11] mr-2">{enq.referenceCode}</span>
                <span>{enq.title}</span>
              </div>
              <span className="index-code">{enq.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { getBusinessBySlug } from '@/lib/marketplace/repository';
import {
  PRICE_DISPLAY_LABELS,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

interface BusinessStorefrontPageProps {
  params: {
    slug: string;
  };
}

export default function BusinessStorefrontPage({
  params,
}: BusinessStorefrontPageProps) {
  const result = getBusinessBySlug(params.slug);

  if (!result) {
    notFound();
  }

  const { business, relatedBusinesses } = result;
  const badge = VERIFICATION_BADGE_META[business.verificationLevel];
  const activeListings = (business.listings || []).filter(
    (l) => l.status === 'PUBLISHED',
  );
  const categoryName =
    business.primaryCategory?.name || 'Commercial Sector';

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11]">
      {/* =====================================================================
          PUBLICATION DOSSIER MASTHEAD
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11] bg-[#FAF8F3]">
        <div className="container-wide py-8 lg:py-12">
          {/* Top Breadcrumb & Dossier Coordinates */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-8 border-b border-[#0D0E11] font-mono text-[11px] uppercase tracking-[0.14em]">
            <div className="flex items-center gap-3">
              <Link
                href="/businesses"
                className="inline-flex items-center gap-1.5 text-[#0D0E11] font-bold hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>INDEX DIRECTORY</span>
              </Link>
              <span className="text-[#CFCAC0]">/</span>
              <span className="text-[#52514E]">{categoryName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="index-code">DOSSIER // {business.slug.toUpperCase()}</span>
              <span
                className={badge.isVerified ? 'badge-verified' : 'badge-neutral'}
              >
                {badge.isVerified && <ShieldCheck className="h-3.5 w-3.5" />}
                {badge.label}
              </span>
            </div>
          </div>

          {/* Main Publication Title Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex flex-wrap items-center gap-2 mb-3 font-mono text-xs uppercase tracking-[0.12em] text-[#52514E]">
                <span className="font-bold text-[#0D0E11]">
                  {categoryName}
                </span>
                <span>—</span>
                <span>{business.businessType} ENTITY</span>
                {business.yearEstablished && (
                  <>
                    <span>—</span>
                    <span>EST. {business.yearEstablished}</span>
                  </>
                )}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-[#0D0E11] uppercase leading-[0.94]">
                {business.name}
              </h1>

              {business.tagline && (
                <p className="mt-4 font-display text-xl sm:text-2xl font-medium text-[#0D0E11] leading-snug">
                  {business.tagline}
                </p>
              )}

              <p className="mt-5 text-sm sm:text-base text-[#52514E] leading-relaxed max-w-3xl whitespace-pre-line">
                {business.description || business.shortDescription}
              </p>

              {business.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {business.tags.map((kw: string) => (
                    <span
                      key={kw}
                      className="font-mono text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 border border-[#0D0E11] bg-[#F4F1EA] text-[#0D0E11]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Primary Commercial Dispatch Box */}
            <div className="lg:col-span-4 border-2 border-[#0D0E11] bg-[#0D0E11] text-[#F4F1EA] p-6 sm:p-8">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2B2D33] font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="text-[#C8F904] font-bold">COMMERCIAL DESK</span>
                <span className="text-[#CFCAC0]">DIRECT RFQ</span>
              </div>

              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-[#F4F1EA]">
                REQUEST A QUOTATION FROM {business.name}
              </h2>
              <p className="mt-2 text-xs text-[#CFCAC0] leading-relaxed">
                Dispatch your requirement, specifications, and target timeline directly to this
                business. Receive a formal quotation in your PROVENTA ledger.
              </p>

              <div className="mt-6 space-y-2.5">
                <Link
                  href={`/enquiries/new?businessId=${business.id}`}
                  className="btn-accent w-full justify-between"
                >
                  <span>DISPATCH ENQUIRY / RFQ</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-between border border-[#3A3D45] bg-[#16181E] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#F4F1EA] hover:border-[#C8F904] hover:text-[#C8F904]"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      OFFICIAL WEBSITE
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <dl className="mt-6 pt-5 border-t border-[#2B2D33] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-[#9E998E]">HEADQUARTERS</dt>
                  <dd className="text-[#F4F1EA] font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#C8F904]" />
                    {business.city}
                    {business.state ? `, ${business.state}` : ''}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#9E998E]">SERVICE COVERAGE</dt>
                  <dd className="text-[#F4F1EA] text-right">
                    {business.serviceAreas.length > 0
                      ? business.serviceAreas.join(', ')
                      : business.city}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#9E998E]">VERIFICATION</dt>
                  <dd className="text-[#C8F904] font-bold">{badge.shortLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CATALOG OF PRODUCTS, SERVICES & PACKAGES
      ===================================================================== */}
      <section className="py-14 lg:py-20 border-b-2 border-[#0D0E11]">
        <div className="container-wide">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-2 border-[#0D0E11]">
            <div>
              <span className="index-code mb-2">SECTION // OFFERINGS LEDGER</span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
                PUBLISHED PRODUCTS &amp; SERVICES ({activeListings.length})
              </h2>
            </div>
            <Link
              href={`/enquiries/new?businessId=${business.id}`}
              className="btn-secondary"
            >
              <span>REQUEST CUSTOM SPECIFICATION</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {activeListings.length > 0 ? (
            <div className="mt-8 divide-y divide-[#0D0E11] border border-[#0D0E11] bg-[#FAF8F3]">
              {activeListings.map((item, idx) => {
                const specRecord: Record<string, string> =
                  item.specifications || {};
                const formattedPrice = item.priceAmount
                  ? `₹${item.priceAmount.toLocaleString('en-IN')}${
                      item.priceUnit ? ` / ${item.priceUnit}` : ''
                    }`
                  : PRICE_DISPLAY_LABELS[item.priceDisplayType];

                return (
                  <article
                    key={item.id}
                    className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:bg-[#EAE5DA]/50 transition-colors"
                  >
                    <div className="lg:col-span-8">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#52514E] mb-2">
                        <span className="bg-[#0D0E11] text-[#F4F1EA] px-2 py-0.5 font-bold">
                          OFFERING #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="border border-[#0D0E11] px-2 py-0.5 text-[#0D0E11] font-semibold">
                          {item.listingType}
                        </span>
                        <span>REF: {item.slug}</span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-[#0D0E11]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#52514E] leading-relaxed">
                        {item.description || item.shortSummary}
                      </p>

                      {item.tags.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-[#CFCAC0]">
                          {item.tags.map((hl: string) => (
                            <div
                              key={hl}
                              className="flex items-center gap-2 text-xs text-[#0D0E11]"
                            >
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                                <Check className="h-2.5 w-2.5 text-[#0D0E11]" />
                              </span>
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {Object.keys(specRecord).length > 0 && (
                        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-[#CFCAC0] pt-3 font-mono text-[11px]">
                          {Object.entries(specRecord).map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-[#52514E] uppercase">{k}</dt>
                              <dd className="font-bold text-[#0D0E11]">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#CFCAC0] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                          PRICING CLASSIFICATION
                        </div>
                        <div className="mt-1 font-display text-2xl font-bold text-[#0D0E11]">
                          {formattedPrice}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#52514E]">
                          {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                        </div>

                        <dl className="mt-4 space-y-1.5 border-t border-[#CFCAC0] pt-3 font-mono text-xs">
                          <div className="flex justify-between">
                            <dt className="text-[#52514E]">AVAILABILITY</dt>
                            <dd className="font-semibold text-[#0D0E11]">
                              {item.availabilityStatus}
                            </dd>
                          </div>
                          {item.deliveryTimeframe && (
                            <div className="flex justify-between">
                              <dt className="text-[#52514E]">TURNAROUND</dt>
                              <dd className="font-semibold text-[#0D0E11]">
                                {item.deliveryTimeframe}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/enquiries/new?businessId=${business.id}&listingId=${item.id}`}
                          className="btn-accent w-full justify-between"
                        >
                          <span>ENQUIRE THIS OFFERING</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 border border-[#0D0E11] bg-[#FAF8F3] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#52514E]">
                CATALOG NOTICE // DIRECT QUOTATION MODE
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-[#0D0E11]">
                This business handles custom requirements via direct buyer enquiry.
              </h3>
              <p className="mt-1 text-sm text-[#52514E]">
                Submit your project scope or product specification to receive a tailored quotation
                directly from {business.name}.
              </p>
              <div className="mt-5">
                <Link
                  href={`/enquiries/new?businessId=${business.id}`}
                  className="btn-primary"
                >
                  <span>DISPATCH DIRECT ENQUIRY</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          ENTITY SPECIFICATIONS & RELATED SECTOR DOSSIERS
      ===================================================================== */}
      <section className="py-14 lg:py-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Entity Technical Metadata Table */}
            <div className="lg:col-span-6 border border-[#0D0E11] bg-[#FAF8F3] p-6 sm:p-8">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11] pb-3 mb-4 border-b border-[#0D0E11]">
                ENTITY REGISTRY SPECIFICATIONS
              </div>
              <dl className="divide-y divide-[#CFCAC0] font-mono text-xs">
                <div className="py-3 flex justify-between">
                  <dt className="text-[#52514E]">PRIMARY SECTOR</dt>
                  <dd className="font-bold text-[#0D0E11]">{categoryName}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#52514E]">OPERATING MODEL</dt>
                  <dd className="font-bold text-[#0D0E11]">{business.businessType}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#52514E]">BASE JURISDICTION</dt>
                  <dd className="font-bold text-[#0D0E11]">
                    {business.city}, {business.state || 'India'}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#52514E]">TRUST CLASSIFICATION</dt>
                  <dd className="font-bold text-[#0D0E11]">{badge.label}</dd>
                </div>
              </dl>

              {business.highlights.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#0D0E11]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#52514E] mb-3">
                    OPERATIONAL HIGHLIGHTS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {business.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="font-mono text-xs px-2.5 py-1 bg-[#EAE5DA] border border-[#0D0E11] text-[#0D0E11]"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Businesses in Same Sector */}
            <div className="lg:col-span-6 border border-[#0D0E11] bg-[#FAF8F3] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11] pb-3 mb-4 border-b border-[#0D0E11]">
                  RELATED ENTITIES IN {categoryName.toUpperCase()}
                </div>
                {relatedBusinesses.length > 0 ? (
                  <div className="divide-y divide-[#CFCAC0]">
                    {relatedBusinesses.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/business/${rel.slug}`}
                        className="py-3.5 flex items-center justify-between hover:bg-[#EAE5DA] px-2 transition-colors"
                      >
                        <div>
                          <div className="font-display text-base font-bold text-[#0D0E11]">
                            {rel.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#52514E]">
                            {rel.city} · {rel.businessType}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#0D0E11]">
                          DOSSIER →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#52514E] leading-relaxed">
                    Explore the full {categoryName} sector index or submit an open
                    sector enquiry to receive quotations from multiple verified businesses.
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#CFCAC0] flex flex-wrap gap-3">
                <Link
                  href={`/businesses?category=${business.primaryCategoryId}`}
                  className="btn-secondary"
                >
                  <span>SECTOR DIRECTORY</span>
                </Link>
                <Link
                  href={`/enquiries/new?categoryId=${business.primaryCategoryId}`}
                  className="btn-primary"
                >
                  <span>OPEN SECTOR ENQUIRY</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

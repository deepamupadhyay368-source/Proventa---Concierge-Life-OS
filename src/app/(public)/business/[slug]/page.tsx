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
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* =====================================================================
          DARK ARCHITECTURAL STOREFRONT MASTHEAD
      ===================================================================== */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]">
        <div className="container-wide py-10 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-8 border-b border-[#4C4A40] font-mono text-[11px] uppercase tracking-[0.18em]">
            <div className="flex items-center gap-3">
              <Link
                href="/businesses"
                className="inline-flex items-center gap-1.5 text-[#F6F0E4] hover:text-[#B94E2D] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Directory</span>
              </Link>
              <span className="text-[#4C4A40]">/</span>
              <span className="text-[#A7A194]">{categoryName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="index-code">STOREFRONT // {business.slug}</span>
              <span
                className={badge.isVerified ? 'badge-verified' : 'badge-bronze'}
              >
                {badge.isVerified && <ShieldCheck className="h-3.5 w-3.5" />}
                {badge.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <div className="inline-flex flex-wrap items-center gap-2.5 mb-3 font-mono text-xs uppercase tracking-[0.18em] text-[#A98253]">
                <span>{categoryName}</span>
                <span>·</span>
                <span>{business.businessType}</span>
                {business.yearEstablished && (
                  <>
                    <span>·</span>
                    <span>EST. {business.yearEstablished}</span>
                  </>
                )}
              </div>

              <h1 className="font-display text-4xl sm:text-6xl text-[#F6F0E4] leading-[0.95]">
                {business.name}
              </h1>

              {business.tagline && (
                <p className="mt-4 font-display text-2xl italic text-[#E9DFCC] leading-snug">
                  {business.tagline}
                </p>
              )}

              <p className="mt-5 text-sm sm:text-base text-[#A7A194] leading-relaxed max-w-3xl whitespace-pre-line">
                {business.description || business.shortDescription}
              </p>

              {business.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {business.tags.map((kw: string) => (
                    <span
                      key={kw}
                      className="font-mono text-[10px] uppercase tracking-[0.14em] px-2.5 py-1 border border-[#4C4A40] bg-[#20211C] text-[#E9DFCC]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Warm Ivory Enquiry Dispatch Panel */}
            <div className="lg:col-span-4 rounded-[2px] border border-[#E9DFCC] bg-[#F5F0E5] text-[#181914] p-6 sm:p-8 shadow-elevated">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D5CBB8] font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-[#B94E2D] font-medium">DIRECT ENQUIRY</span>
                <span className="text-[#5C584F]">REQUEST QUOTATION</span>
              </div>

              <h2 className="font-display text-3xl text-[#181914]">
                Connect with {business.name}
              </h2>
              <p className="mt-2 text-xs text-[#5C584F] leading-relaxed">
                Send your requirement, quantity, and target timeline directly to this business to
                receive a formal quotation.
              </p>

              <div className="mt-6 space-y-2.5">
                <Link
                  href={`/enquiries/new?businessId=${business.id}`}
                  className="btn-terracotta w-full justify-between"
                >
                  <span>Request a Quotation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-between border border-[#D5CBB8] bg-[#FBF8F1] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#181914] hover:border-[#B94E2D]"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-[#B94E2D]" />
                      Official Website
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <dl className="mt-6 pt-5 border-t border-[#D5CBB8] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-[#5C584F]">HEADQUARTERS</dt>
                  <dd className="text-[#181914] font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#B94E2D]" />
                    {business.city}
                    {business.state ? `, ${business.state}` : ''}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#5C584F]">SERVICE AREAS</dt>
                  <dd className="text-[#181914] text-right">
                    {business.serviceAreas.length > 0
                      ? business.serviceAreas.join(', ')
                      : business.city}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#5C584F]">VERIFICATION</dt>
                  <dd className="text-[#B94E2D] font-medium">{badge.shortLabel}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRODUCTS & SERVICES OFFERED
      ===================================================================== */}
      <section className="py-14 lg:py-20 border-b border-[#D5CBB8]">
        <div className="container-wide">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#D5CBB8]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D] mb-2">
                CATALOG // OFFERINGS
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-[#181914]">
                Products &amp; Services ({activeListings.length})
              </h2>
            </div>
            <Link
              href={`/enquiries/new?businessId=${business.id}`}
              className="btn-secondary"
            >
              <span>Request Custom Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {activeListings.length > 0 ? (
            <div className="mt-8 space-y-4">
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
                    className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start hover:border-[#B94E2D] transition-colors"
                  >
                    <div className="lg:col-span-8">
                      <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C584F] mb-2">
                        <span className="text-[#B94E2D] font-medium">
                          {String(idx + 1).padStart(2, '0')} // {item.listingType}
                        </span>
                        <span>·</span>
                        <span>REF: {item.slug}</span>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl text-[#181914]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#5C584F] leading-relaxed">
                        {item.description || item.shortSummary}
                      </p>

                      {item.tags.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-[#E9DFCC]">
                          {item.tags.map((hl: string) => (
                            <div
                              key={hl}
                              className="flex items-center gap-2 text-xs text-[#181914]"
                            >
                              <Check className="h-3.5 w-3.5 text-[#B94E2D] shrink-0" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {Object.keys(specRecord).length > 0 && (
                        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-[#E9DFCC] pt-3 font-mono text-[11px]">
                          {Object.entries(specRecord).map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-[#5C584F] uppercase">{k}</dt>
                              <dd className="font-medium text-[#181914]">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#E9DFCC] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C584F]">
                          COMMERCIAL PRICING
                        </div>
                        <div className="mt-1 font-display text-3xl text-[#181914]">
                          {formattedPrice}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#5C584F]">
                          {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                        </div>

                        <dl className="mt-4 space-y-1.5 border-t border-[#E9DFCC] pt-3 font-mono text-xs">
                          <div className="flex justify-between">
                            <dt className="text-[#5C584F]">AVAILABILITY</dt>
                            <dd className="font-medium text-[#181914]">
                              {item.availabilityStatus}
                            </dd>
                          </div>
                          {item.deliveryTimeframe && (
                            <div className="flex justify-between">
                              <dt className="text-[#5C584F]">TURNAROUND</dt>
                              <dd className="font-medium text-[#181914]">
                                {item.deliveryTimeframe}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/enquiries/new?businessId=${business.id}&listingId=${item.id}`}
                          className="btn-terracotta w-full justify-between"
                        >
                          <span>Enquire This Offering</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#B94E2D]">
                DIRECT QUOTATION MODE
              </p>
              <h3 className="mt-2 font-display text-2xl text-[#181914]">
                Custom Requirements &amp; Bespoke Quotations
              </h3>
              <p className="mt-1 text-sm text-[#5C584F]">
                Submit your project scope or product specification to receive a tailored quotation
                directly from {business.name}.
              </p>
              <div className="mt-5">
                <Link
                  href={`/enquiries/new?businessId=${business.id}`}
                  className="btn-terracotta"
                >
                  <span>Send Direct Enquiry</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          BUSINESS CREDENTIALS & RELATED BUSINESSES
      ===================================================================== */}
      <section className="py-14 lg:py-20 bg-[#E9DFCC]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 rounded-[2px] border border-[#D5CBB8] bg-[#F5F0E5] p-6 sm:p-8">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#B94E2D] pb-3 mb-4 border-b border-[#D5CBB8]">
                Business Profile Specifications
              </div>
              <dl className="divide-y divide-[#E9DFCC] font-mono text-xs">
                <div className="py-3 flex justify-between">
                  <dt className="text-[#5C584F]">PRIMARY INDUSTRY</dt>
                  <dd className="font-medium text-[#181914]">{categoryName}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#5C584F]">OPERATING MODEL</dt>
                  <dd className="font-medium text-[#181914]">{business.businessType}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#5C584F]">LOCATION</dt>
                  <dd className="font-medium text-[#181914]">
                    {business.city}, {business.state || 'India'}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-[#5C584F]">VERIFICATION STATUS</dt>
                  <dd className="font-medium text-[#B94E2D]">{badge.label}</dd>
                </div>
              </dl>

              {business.highlights.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#D5CBB8]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C584F] mb-3">
                    KEY HIGHLIGHTS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {business.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="font-mono text-xs px-2.5 py-1 bg-[#E9DFCC] border border-[#D5CBB8] text-[#181914]"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 rounded-[2px] border border-[#D5CBB8] bg-[#F5F0E5] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#B94E2D] pb-3 mb-4 border-b border-[#D5CBB8]">
                  Related Businesses in {categoryName}
                </div>
                {relatedBusinesses.length > 0 ? (
                  <div className="divide-y divide-[#E9DFCC]">
                    {relatedBusinesses.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/business/${rel.slug}`}
                        className="py-3.5 flex items-center justify-between hover:bg-[#E9DFCC] px-2 transition-colors"
                      >
                        <div>
                          <div className="font-display text-xl text-[#181914]">
                            {rel.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#5C584F]">
                            {rel.city} · {rel.businessType}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#B94E2D]">
                          View →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5C584F] leading-relaxed">
                    Explore the full {categoryName} directory or submit an open enquiry to receive
                    quotations from multiple verified providers.
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#D5CBB8] flex flex-wrap gap-3">
                <Link
                  href={`/businesses?category=${business.primaryCategoryId}`}
                  className="btn-secondary"
                >
                  <span>Browse Industry</span>
                </Link>
                <Link
                  href={`/enquiries/new?categoryId=${business.primaryCategoryId}`}
                  className="btn-terracotta"
                >
                  <span>Post Open Industry Enquiry</span>
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

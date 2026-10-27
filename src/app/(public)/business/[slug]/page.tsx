import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  CheckCircle2,
  Globe,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  ArrowUpRight,
  Package,
  ShieldCheck,
  Clock,
  Tag,
  MessageSquareQuote,
} from 'lucide-react';
import { getBusinessBySlug } from '@/lib/marketplace/repository';
import {
  VERIFICATION_BADGE_META,
  PRICE_DISPLAY_LABELS,
} from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

export default async function BusinessStorefrontPage({
  params: paramsInput,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const params = await Promise.resolve(paramsInput);
  const result = getBusinessBySlug(params.slug);

  if (!result) {
    notFound();
  }

  const { business } = result;
  const badgeMeta = VERIFICATION_BADGE_META[business.verificationLevel];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] pb-24">
      {/* =====================================================================
          STOREFRONT HEADER WITH ARCHITECTURAL COVER BANNER
      ===================================================================== */}
      <section className="border-b border-[#E8E9ED] bg-[#FFFFFF]">
        {/* Architectural Cover Placeholder / Banner */}
        <div className="h-32 sm:h-40 bg-[#101319] relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,#252A36_1px,transparent_1px),linear-gradient(to_bottom,#252A36_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-50"
          />
          <div className="container-wide h-full flex items-end justify-between pb-4 relative">
            <div className="flex items-center gap-2 text-[12px] text-[#9CA1AE]">
              <Link href="/businesses" className="hover:text-white transition-colors">
                Business Directory
              </Link>
              <span>/</span>
              <Link
                href={`/businesses?category=${business.primaryCategory?.slug || ''}`}
                className="hover:text-white transition-colors"
              >
                {business.primaryCategory?.name || 'Category'}
              </Link>
              <span>/</span>
              <span className="text-white font-medium truncate max-w-[200px]">
                {business.name}
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#252A36] bg-[#181C24] px-2.5 py-1 text-[11px] font-medium text-[#9CA1AE]">
              Storefront ID: {business.slug}
            </span>
          </div>
        </div>

        {/* Storefront Identity Bar */}
        <div className="container-wide pb-10">
          <div className="-mt-10 sm:-mt-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Monogram / Logo Card */}
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-[14px] border-2 border-[#FFFFFF] bg-[#15171B] text-[26px] sm:text-[30px] font-bold text-white shadow-elevated">
                {business.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="pt-2 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="badge-accent">
                    {business.primaryCategory?.name || 'Business'}
                  </span>
                  <span className="badge-neutral">{business.businessType}</span>
                  {badgeMeta.isVerified ? (
                    <span className="badge-verified">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {badgeMeta.label}
                    </span>
                  ) : (
                    <span className="badge-neutral">{badgeMeta.label}</span>
                  )}
                </div>

                <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#15171B]">
                  {business.name}
                </h1>

                {business.tagline && (
                  <p className="mt-1 text-[16px] text-[#696D76] font-medium">
                    {business.tagline}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#696D76]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#15171B]" />
                    {business.city}, {business.state}, {business.country}
                  </span>
                  {business.yearEstablished && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#15171B]" />
                      Est. {business.yearEstablished}
                    </span>
                  )}
                  {business.serviceAreas && business.serviceAreas.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-[#15171B]" />
                      Serves: {business.serviceAreas.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Storefront CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={`/enquiries/new?businessId=${business.id}&category=${
                  business.primaryCategory?.slug || ''
                }`}
                className="btn-accent px-5 py-3"
              >
                <MessageSquareQuote className="h-4 w-4" />
                <span>Send Enquiry / Request Quote</span>
              </Link>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-4 py-3"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STOREFRONT MAIN CONTENT GRID
      ===================================================================== */}
      <div className="container-wide pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): About & Structured Products/Services */}
          <div className="lg:col-span-8 space-y-8">
            {/* About / Overview Section */}
            <section className="surface-card p-6 sm:p-8">
              <h2 className="text-[18px] font-bold text-[#15171B] mb-3">
                About {business.name}
              </h2>
              <p className="text-[15px] text-[#696D76] leading-relaxed whitespace-pre-line">
                {business.description || business.shortDescription}
              </p>

              {business.highlights && business.highlights.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#E8E9ED]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#696D76] mb-2.5">
                    Key Highlights
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {business.highlights.map((h) => (
                      <div
                        key={h}
                        className="flex items-center gap-2 text-[13px] font-medium text-[#15171B]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {business.tags && business.tags.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#E8E9ED]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#696D76] mb-2.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Specialties &amp; Capabilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {business.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[7px] border border-[#E8E9ED] bg-[#FAFAF8] px-3 py-1 text-[12px] font-medium text-[#15171B]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Structured Products & Services Catalog */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[20px] font-bold text-[#15171B]">
                    Products, Services &amp; Offerings
                  </h2>
                  <p className="text-[13px] text-[#696D76]">
                    {business.listings?.length || 0} published{' '}
                    {business.listings?.length === 1 ? 'offering' : 'offerings'} available for enquiry
                  </p>
                </div>
                <Link
                  href={`/enquiries/new?businessId=${business.id}&category=${
                    business.primaryCategory?.slug || ''
                  }`}
                  className="text-[13px] font-semibold text-[#304FFE] hover:underline inline-flex items-center gap-1"
                >
                  Request Custom Specification <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {business.listings && business.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.listings.map((item) => {
                    const priceText = item.priceAmount
                      ? `₹${item.priceAmount.toLocaleString('en-IN')}${
                          item.priceMaxAmount
                            ? ` – ₹${item.priceMaxAmount.toLocaleString('en-IN')}`
                            : ''
                        }${item.priceUnit ? ` / ${item.priceUnit}` : ''}`
                      : PRICE_DISPLAY_LABELS[item.priceDisplayType];

                    return (
                      <div
                        key={item.id}
                        className="surface-card-interactive p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="badge-neutral">
                              {item.listingType}
                            </span>
                            {item.deliveryTimeframe && (
                              <span className="text-[12px] text-[#696D76] inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.deliveryTimeframe}
                              </span>
                            )}
                          </div>

                          <h3 className="text-[17px] font-bold text-[#15171B]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-[13px] text-[#696D76] leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#E8E9ED] flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.06em] text-[#696D76]">
                              Pricing
                            </p>
                            <p className="text-[15px] font-bold text-[#15171B]">
                              {priceText}
                            </p>
                          </div>
                          <Link
                            href={`/enquiries/new?businessId=${business.id}&listingId=${item.id}&category=${
                              business.primaryCategory?.slug || ''
                            }`}
                            className="inline-flex items-center gap-1 rounded-[8px] bg-[#15171B] hover:bg-[#304FFE] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors"
                          >
                            <span>{item.ctaLabel || 'Enquire'}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="surface-card p-8 text-center">
                  <Package className="h-8 w-8 text-[#696D76] mx-auto mb-3" />
                  <h3 className="text-[16px] font-bold text-[#15171B]">
                    Custom Products &amp; Services on Request
                  </h3>
                  <p className="mt-1 text-[13px] text-[#696D76] max-w-md mx-auto">
                    {business.name} has not published individual catalog items yet. Send a direct enquiry to request their catalog or receive a custom quotation.
                  </p>
                  <Link
                    href={`/enquiries/new?businessId=${business.id}&category=${
                      business.primaryCategory?.slug || ''
                    }`}
                    className="mt-4 btn-primary"
                  >
                    <span>Send Direct Enquiry</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Right Column (4 cols): Contact, Location & Trust Verification */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Direct Enquiry CTA Card */}
            <div className="rounded-[12px] bg-[#101319] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                Direct Connection
              </p>
              <h3 className="mt-1.5 text-[18px] font-bold text-white">
                Contact {business.name}
              </h3>
              <p className="mt-1.5 text-[13px] text-[#9CA1AE] leading-relaxed">
                Submit your requirement to receive a structured quotation with pricing, delivery timeline, and terms.
              </p>
              <Link
                href={`/enquiries/new?businessId=${business.id}&category=${
                  business.primaryCategory?.slug || ''
                }`}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#304FFE] hover:bg-[#243FE0] px-4 py-3 text-[14px] font-semibold text-white transition-colors"
              >
                <span>Request Quotation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Contact & Location Details */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#15171B]">
                Business Details &amp; Contact
              </h3>

              <div className="space-y-3.5 text-[13px]">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#696D76] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#15171B]">Location</p>
                    <p className="text-[#696D76]">
                      {business.addressLine1 ? `${business.addressLine1}, ` : ''}
                      {business.area ? `${business.area}, ` : ''}
                      {business.city}, {business.state}{' '}
                      {business.postalCode || ''}
                    </p>
                  </div>
                </div>

                {business.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-[#696D76] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#15171B]">Phone</p>
                      <a
                        href={`tel:${business.contactPhone}`}
                        className="text-[#304FFE] hover:underline"
                      >
                        {business.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {business.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-[#696D76] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#15171B]">Business Email</p>
                      <a
                        href={`mailto:${business.contactEmail}`}
                        className="text-[#304FFE] hover:underline break-all"
                      >
                        {business.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-[#696D76] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#15171B]">Website</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#304FFE] hover:underline break-all"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}

                {business.gstNumber && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-[#696D76] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#15171B]">GSTIN</p>
                      <p className="font-mono text-[12px] text-[#696D76]">
                        {business.gstNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust & Transparency Card */}
            <div className="surface-card p-6 bg-[#FAFAF8]">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#15171B] mb-2">
                <ShieldCheck
                  className={`h-4 w-4 ${
                    badgeMeta.isVerified ? 'text-[#16845B]' : 'text-[#696D76]'
                  }`}
                />
                <span>PROVENTA Trust &amp; Transparency</span>
              </div>
              <p className="text-[12px] text-[#696D76] leading-relaxed">
                {badgeMeta.description}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Send,
  Star,
  Calendar,
  Building2,
  ShieldAlert,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { getBusinessBySlug } from '@/lib/marketplace/repository';
import {
  PRICE_DISPLAY_LABELS,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';
import { getSession, isAdminOrModerator, type SessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { business } = getBusinessBySlug(slug, { incrementView: false });
    return {
      title: `${business.name} (${business.city}) — Digital Storefront`,
      description:
        business.shortDescription ||
        business.tagline ||
        `Explore products, services, and send direct enquiries to ${business.name} in ${business.city}, ${business.state} on PROVENTA.`,
      openGraph: {
        title: `${business.name} | PROVENTA Storefront`,
        description: business.shortDescription || business.tagline || '',
      },
    };
  } catch {
    return {
      title: 'Business Storefront Not Found',
    };
  }
}

export default async function BusinessStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const viewer = session?.user as SessionUser | undefined;

  let data;
  try {
    data = getBusinessBySlug(slug, {
      viewerUserId: viewer?.id ?? null,
      isAdmin: isAdminOrModerator(viewer),
      incrementView: true,
    });
  } catch {
    notFound();
  }

  const { business, relatedBusinesses } = data;
  const badge = VERIFICATION_BADGE_META[business.verificationLevel];
  const listings = business.listings ?? [];
  const reviews = business.reviews ?? [];

  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-border bg-card/60 py-3">
        <div className="container-wide flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1 hover:text-foreground font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Directory
            </Link>
            <span>/</span>
            {business.primaryCategory && (
              <>
                <Link
                  href={`/businesses?category=${business.primaryCategory.slug}`}
                  className="hover:text-foreground"
                >
                  {business.primaryCategory.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {business.name}
            </span>
          </div>

          {business.status !== 'PUBLISHED' && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
              Preview Mode ({business.status})
            </span>
          )}
        </div>
      </div>

      {/* Storefront Hero Header */}
      <section className="border-b border-border bg-card py-10 md:py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground">
                  {business.primaryCategory?.name || business.businessType}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {business.businessType} BUSINESS
                </span>
                <span
                  title={badge.description}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    badge.isVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-secondary text-muted-foreground border-border'
                  }`}
                >
                  {badge.label}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {business.name}
              </h1>

              {business.tagline && (
                <p className="text-base sm:text-lg font-medium text-muted-foreground mt-2">
                  {business.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  {business.area ? `${business.area}, ` : ''}
                  {business.city}, {business.state}
                </span>
                {business.yearEstablished && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Est. {business.yearEstablished}
                  </span>
                )}
                {business.averageRating && (
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    {business.averageRating} ({business.reviewCount} reviews)
                  </span>
                )}
              </div>

              {/* Honest Verification Disclosure */}
              <div className="mt-5 p-3.5 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">{badge.label}:</strong>{' '}
                  {badge.description}
                </div>
              </div>
            </div>

            {/* Storefront Primary Enquiry CTA Box */}
            <div className="lg:col-span-4 bg-background border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connect &amp; Request Quote
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {business.operatingStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                Send a structured requirement directly to{' '}
                <strong className="text-foreground">{business.name}</strong> and
                receive a customized quotation or response on PROVENTA.
              </p>

              <Link
                href={`/enquiries/new?businessId=${business.id}&category=${
                  business.primaryCategory?.slug || ''
                }`}
                className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-sm px-5 py-3 rounded-lg hover:bg-foreground/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Enquiry / Request Quote
              </Link>

              <div className="mt-5 pt-4 border-t border-border space-y-2.5 text-xs">
                {business.contactPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </span>
                    <span className="font-medium text-foreground">
                      {business.contactPhone}
                    </span>
                  </div>
                )}
                {business.contactEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">
                      {business.contactEmail}
                    </span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </span>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline truncate max-w-[180px]"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storefront Body */}
      <div className="container-wide pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-10">
            {/* About the Business */}
            <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                About {business.name}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                {business.description || business.shortDescription}
              </p>

              {business.highlights && business.highlights.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Key Highlights &amp; Capabilities
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {business.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Products & Services Showcase */}
            <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Products &amp; Services ({listings.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Structured offerings with transparent pricing modes and direct
                    enquiry actions.
                  </p>
                </div>
              </div>

              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-foreground">
                            {item.listingType}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                          </span>
                        </div>

                        <h3 className="font-semibold text-base text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
                          {item.shortSummary || item.description}
                        </p>

                        {item.priceAmount ? (
                          <div className="mt-3 text-sm font-bold text-foreground">
                            ₹{item.priceAmount.toLocaleString('en-IN')}
                            {item.priceMaxAmount
                              ? ` – ₹${item.priceMaxAmount.toLocaleString('en-IN')}`
                              : ''}
                            {item.priceUnit ? (
                              <span className="text-xs font-normal text-muted-foreground">
                                {' '}
                                / {item.priceUnit}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs font-semibold text-primary">
                            {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {item.deliveryTimeframe || 'Available for enquiry'}
                        </span>
                        <Link
                          href={`/enquiries/new?businessId=${business.id}&listingId=${item.id}&category=${
                            business.primaryCategory?.slug || ''
                          }`}
                          className="text-xs font-semibold text-foreground hover:text-primary underline-offset-2 hover:underline"
                        >
                          {item.ctaLabel || 'Send Enquiry'} &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-background border border-border text-center">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Custom Requirements Accepted
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {business.name} accepts direct customer enquiries and custom
                    project briefs. Click &ldquo;Send Enquiry&rdquo; to request a
                    tailored quotation.
                  </p>
                </div>
              )}
            </section>

            {/* Customer Reviews */}
            <section className="bg-card border border-border rounded-xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Customer Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {rev.userName}
                          </span>
                          {rev.verifiedInteraction && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Verified Enquiry Interaction
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-amber-600">
                          {'★'.repeat(rev.rating)}
                        </span>
                      </div>
                      {rev.title && (
                        <div className="text-xs font-semibold text-foreground mb-1">
                          {rev.title}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No customer reviews have been submitted for this business yet.
                  Reviews on PROVENTA are collected from real customer interactions.
                </p>
              )}
            </section>
          </div>

          {/* Right Column: Service Areas, Business Hours, Related Businesses */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Location &amp; Service Coverage
              </h3>
              <div className="text-sm text-foreground font-medium">
                {business.addressLine1 ? `${business.addressLine1}, ` : ''}
                {business.area ? `${business.area}, ` : ''}
                {business.city}, {business.state}{' '}
                {business.postalCode ? `– ${business.postalCode}` : ''}
              </div>

              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Service Areas Served:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {business.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                  {business.servesPanIndia && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      Pan-India Delivery
                    </span>
                  )}
                </div>
              </div>
            </div>

            {business.businessHours && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-xs">
                  {Object.entries(business.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="font-medium text-foreground">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedBusinesses.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Related Businesses
                </h3>
                <div className="space-y-3">
                  {relatedBusinesses.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/business/${rel.slug}`}
                      className="block p-3 rounded-lg bg-background border border-border hover:border-foreground/40 transition-colors"
                    >
                      <div className="font-semibold text-sm text-foreground">
                        {rel.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {rel.city}, {rel.state}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

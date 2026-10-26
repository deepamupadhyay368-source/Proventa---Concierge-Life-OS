import Link from 'next/link';
import {
  Search,
  Building2,
  PlusCircle,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers,
  Send,
  Handshake,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { getCategories, searchBusinesses } from '@/lib/marketplace/repository';
import { VERIFICATION_BADGE_META } from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const categories = getCategories({ onlyTopLevel: true });
  const { items: featuredBusinesses, total: totalPublishedBusinesses } =
    searchBusinesses({
      sortBy: 'relevance',
      limit: 6,
    });

  return (
    <div className="pt-16 md:pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-secondary/40 py-16 md:py-24 lg:py-28">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-foreground mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{BRAND_CONFIG.category} &middot; Launching Across Gujarat &amp; India</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
              {BRAND_CONFIG.tagline}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              PROVENTA helps businesses showcase their products and services, get
              discovered by customers, and receive real business enquiries in one
              connected marketplace.
            </p>

            {/* Primary, Secondary, and Additional CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/businesses"
                className="inline-flex items-center gap-2 bg-foreground text-background font-medium px-6 py-3.5 rounded-lg hover:bg-foreground/90 transition-colors shadow-sm text-sm sm:text-base"
              >
                Explore Businesses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/business/register"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3.5 rounded-lg hover:opacity-95 transition-opacity shadow-sm text-sm sm:text-base"
              >
                <Building2 className="w-4 h-4" />
                Register Your Business
              </Link>
              <Link
                href="/enquiries/new"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-medium px-6 py-3.5 rounded-lg hover:bg-secondary transition-colors text-sm sm:text-base"
              >
                <PlusCircle className="w-4 h-4" />
                Post an Enquiry
              </Link>
            </div>

            {/* 2. PROMINENT SEARCH SECTION */}
            <div className="mt-10 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-md max-w-3xl mx-auto">
              <form
                action="/businesses"
                method="GET"
                className="grid grid-cols-1 md:grid-cols-12 gap-3"
              >
                <div className="md:col-span-5 relative flex items-center">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for products, services, or businesses…"
                    aria-label="Search for products, services, or businesses"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    name="category"
                    aria-label="Filter by category"
                    defaultValue=""
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    name="city"
                    aria-label="Filter by location"
                    defaultValue=""
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Cities</option>
                    {BRAND_CONFIG.initialCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[42px] bg-foreground text-background font-medium text-sm rounded-lg hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-foreground">Popular cities:</span>
                  {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'].map(
                    (city) => (
                      <Link
                        key={city}
                        href={`/businesses?city=${encodeURIComponent(city)}`}
                        className="hover:text-foreground underline-offset-2 hover:underline"
                      >
                        {city}
                      </Link>
                    ),
                  )}
                </div>
                <Link
                  href="/listings"
                  className="text-foreground font-medium hover:underline inline-flex items-center gap-1"
                >
                  Browse Products &amp; Services Catalog &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Universal Taxonomy
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Explore by Industry &amp; Category
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-2xl">
                From manufacturing and construction to software, professional
                services, retail, and logistics — discover businesses across every
                vertical.
              </p>
            </div>
            <Link
              href="/businesses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              View Full Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/businesses?category=${cat.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:border-foreground/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0">
                      {(cat.subcategories ?? []).length} specialties
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-secondary/70 text-muted-foreground"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="text-[11px] px-1.5 py-0.5 text-muted-foreground">
                        +{cat.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED BUSINESSES SECTION (Zero fabrication — real published profiles or honest onboarding state) */}
      <section className="py-16 md:py-24 border-b border-border bg-secondary/20">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Digital Storefronts
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Published Business Storefronts
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-2xl">
                Every storefront on PROVENTA represents a business profile with
                transparent verification status, structured offerings, and direct
                enquiry support.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/business/register"
                className="text-sm font-medium px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
              >
                Create Storefront
              </Link>
              <Link
                href="/businesses"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Browse All ({totalPublishedBusinesses})
              </Link>
            </div>
          </div>

          {featuredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((biz) => {
                const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-foreground/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-foreground">
                          {biz.primaryCategory?.name || biz.businessType}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                            badge.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-secondary text-muted-foreground border-border'
                          }`}
                        >
                          {badge.shortLabel}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {biz.name}
                      </h3>
                      {biz.tagline && (
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {biz.tagline}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2">
                        {biz.shortDescription || biz.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {biz.city}, {biz.state}
                      </span>
                      <span className="font-semibold text-foreground group-hover:underline">
                        View Storefront &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Be Among the First Published Storefronts on PROVENTA
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xl mx-auto leading-relaxed">
                We never display fabricated or placeholder company profiles. Register
                your business today to publish your official digital storefront,
                showcase your products and services, and receive matched customer
                enquiries across Gujarat and India.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/business/register"
                  className="inline-flex items-center gap-2 bg-foreground text-background font-medium px-5 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Register Your Business
                </Link>
                <Link
                  href="/enquiries/new"
                  className="inline-flex items-center gap-2 border border-border bg-background text-foreground font-medium px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Customer Enquiry
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Simple, Structured Workflow
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
              How PROVENTA Works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              {BRAND_CONFIG.centralValueProposition}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-7 relative">
              <div className="w-11 h-11 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-base mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Step 1
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Discover businesses
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search by industry, category, product, service, or location. Explore
                verified digital storefronts, compare specifications, and check
                indicative pricing.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-7 relative">
              <div className="w-11 h-11 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-base mb-5">
                <Send className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Step 2
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Post what you need
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Submit a structured enquiry with your category, location, budget, and
                timeline. Our matching engine notifies relevant published businesses
                while keeping your personal contact details protected.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-7 relative">
              <div className="w-11 h-11 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-base mb-5">
                <Handshake className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Step 3
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Connect and grow
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare structured quotations, delivery timelines, and terms side by
                side. Shortlist or accept the right business response and move
                forward with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BUSINESS ACQUISITION SECTION */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-background/10 text-background/90 mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                For Product, Service &amp; Hybrid Businesses
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Make your business discoverable.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-background/80 leading-relaxed max-w-2xl">
                Create your digital storefront, list your products and services, and
                receive relevant customer enquiries. Start free with your own shareable
                PROVENTA URL and upgrade as you grow.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-background/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated SEO-friendly `/business/[slug]` storefront</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Showcase products, services, and indicative prices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Receive matched customer enquiries in your city</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Submit structured quotations &amp; track conversions</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/business/register"
                  className="inline-flex items-center gap-2 bg-background text-foreground font-semibold px-6 py-3.5 rounded-lg hover:bg-background/90 transition-colors text-sm sm:text-base"
                >
                  Create Your Business Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/for-businesses"
                  className="inline-flex items-center gap-2 border border-background/30 text-background font-medium px-5 py-3.5 rounded-lg hover:bg-background/10 transition-colors text-sm sm:text-base"
                >
                  Compare Business Plans
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-background/5 border border-background/15 rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b border-background/15 pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-background/60">
                      Storefront Preview
                    </div>
                    <div className="font-display text-lg font-bold text-background mt-0.5">
                      proventa.in/business/your-company
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Free to Start
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3.5 rounded-lg bg-background/5 border border-background/10">
                    <div className="font-semibold text-background">
                      1. Complete Guided Onboarding
                    </div>
                    <div className="text-xs text-background/70 mt-0.5">
                      Add your brand identity, categories, service areas, and contact
                      channels in minutes.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-background/5 border border-background/10">
                    <div className="font-semibold text-background">
                      2. Publish Products &amp; Services
                    </div>
                    <div className="text-xs text-background/70 mt-0.5">
                      Display fixed prices, indicative ranges, or quote-required
                      industrial &amp; professional offerings.
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-background/5 border border-background/10">
                    <div className="font-semibold text-background">
                      3. Respond to Matched Enquiries
                    </div>
                    <div className="text-xs text-background/70 mt-0.5">
                      Get notified when customers post matching requirements and send
                      professional quotations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

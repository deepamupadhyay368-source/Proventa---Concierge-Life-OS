import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Check,
  Compass,
  Factory,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Ship,
} from 'lucide-react';
import {
  getCategories,
  searchBusinesses,
  searchListings,
} from '@/lib/marketplace/repository';
import {
  PRICE_DISPLAY_LABELS,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';
import { BRAND_CONFIG } from '@/lib/brand';

export const dynamic = 'force-dynamic';

const HERO_INDUSTRY_PANELS = [
  {
    index: '01',
    title: 'Construction & Infrastructure',
    subtitle: 'Architecture, civil engineering & building materials',
    categorySlug: 'real-estate-construction',
    accent: 'from-[#3B2E23]/90 via-[#241E18]/80 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 80% 20%, rgba(185, 78, 45, 0.35), transparent 60%)',
    Icon: Building2,
  },
  {
    index: '02',
    title: 'Manufacturing & Industry',
    subtitle: 'Precision machinery, fabrication & industrial supply',
    categorySlug: 'manufacturing-industrial',
    accent: 'from-[#2A2D25]/90 via-[#1D201A]/85 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 75% 25%, rgba(169, 130, 83, 0.32), transparent 60%)',
    Icon: Factory,
  },
  {
    index: '03',
    title: 'Retail & Consumer Brands',
    subtitle: 'Apparel, lifestyle goods & wholesale distribution',
    categorySlug: 'retail-consumer-goods',
    accent: 'from-[#382920]/90 via-[#221C17]/85 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 80% 20%, rgba(233, 223, 204, 0.22), transparent 60%)',
    Icon: ShoppingBag,
  },
  {
    index: '04',
    title: 'Exports & Trade',
    subtitle: 'Freight, warehousing, supply chain & global trade',
    categorySlug: 'logistics-supply-chain',
    accent: 'from-[#252A27]/90 via-[#1B1E1B]/85 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 80% 20%, rgba(185, 78, 45, 0.28), transparent 60%)',
    Icon: Ship,
  },
  {
    index: '05',
    title: 'Hospitality & Travel',
    subtitle: 'Hotels, destination venues, dining & corporate travel',
    categorySlug: 'hospitality-travel',
    accent: 'from-[#362C20]/90 via-[#211D17]/85 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 80% 25%, rgba(169, 130, 83, 0.35), transparent 60%)',
    Icon: Compass,
  },
  {
    index: '06',
    title: 'Professional Services',
    subtitle: 'Legal, financial advisory, consulting & B2B operations',
    categorySlug: 'business-professional-services',
    accent: 'from-[#2D2A24]/90 via-[#1E1D18]/85 to-[#171A14]/95',
    pattern:
      'radial-gradient(circle at 80% 20%, rgba(245, 240, 229, 0.2), transparent 60%)',
    Icon: Briefcase,
  },
];

export default function HomePage() {
  const categories = getCategories({ onlyTopLevel: true });
  const featuredBusinessesResult = searchBusinesses({
    limit: 6,
    sortBy: 'popular',
  });
  const recentBusinessesResult = searchBusinesses({
    limit: 6,
    sortBy: 'newest',
  });
  const recentListingsResult = searchListings({
    limit: 6,
  });

  const displayBusinesses =
    featuredBusinessesResult.items.length > 0
      ? featuredBusinessesResult.items
      : recentBusinessesResult.items;

  return (
    <div className="bg-[#F5F0E5] text-[#181914]">
      {/* =====================================================================
          HERO SECTION — ARCHITECTURAL EDITORIAL COMPOSITION
      ===================================================================== */}
      <section className="relative bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40] overflow-hidden">
        {/* Subtle Architectural Grid Lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #4C4A40 1px, transparent 1px), linear-gradient(to bottom, #4C4A40 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />

        <div className="container-wide relative z-10 pt-8 sm:pt-12 lg:pt-16 pb-10 lg:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Side: Stacked Labels, Editorial Serif Headline, Supporting Statements */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between space-y-8">
              {/* Stacked Supporting Micro-Labels */}
              <div className="flex items-start gap-4 border-l-2 border-[#B94E2D] pl-4">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#A98253]">
                    PROVENTA // UNIVERSAL PLATFORM
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#A7A194]">
                    Every Business. One Place.
                  </div>
                </div>
              </div>

              {/* Large Editorial Serif Headline */}
              <div>
                <h1 className="font-display text-[3.75rem] sm:text-[5.25rem] lg:text-[6rem] xl:text-[6.75rem] font-normal leading-[0.92] tracking-[-0.02em]">
                  <span className="block text-[#F6F0E4]">Business</span>
                  <span className="block text-[#B94E2D] italic mt-1">
                    without limits.
                  </span>
                </h1>

                <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#E9DFCC] font-normal leading-relaxed max-w-md">
                  The complete business discovery and opportunity platform.
                </p>

                <div className="mt-5 inline-flex items-center gap-3 pt-4 border-t border-[#4C4A40]">
                  <span className="h-2 w-2 rounded-full bg-[#B94E2D]" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A7A194]">
                    Discover. Connect. Collaborate. Grow.
                  </span>
                </div>
              </div>

              {/* Secondary Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/business/register" className="btn-terracotta">
                  <span>List Your Business</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/enquiries/new"
                  className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#4C4A40] bg-[#20211C] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F6F0E4] transition-colors hover:border-[#F5F0E5]"
                >
                  <span>Post an Enquiry</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Side: Monumental Curved Arch Revealing Sunlit City & Waterfront */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="relative mx-auto max-w-3xl lg:max-w-none">
                {/* Outer Sculptural Architectural Frame */}
                <div className="relative rounded-t-[220px] sm:rounded-t-[280px] rounded-b-[2px] border border-[#4C4A40] bg-[#20211C] p-2 sm:p-3 shadow-elevated overflow-hidden">
                  {/* Inner Archway Viewport */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[210px] sm:rounded-t-[270px] rounded-b-[2px] bg-[#171A14]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/hero-arch-cityscape.jpg"
                      alt="Monumental architectural archway framing a warm sunlit waterfront cityscape"
                      className="h-full w-full object-cover object-center brightness-95 contrast-105"
                    />
                    {/* Warm Sunlight & Architectural Vignette Overlay */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171A14]/75 via-transparent to-[#171A14]/25"
                    />

                    {/* Bottom Architectural Caption Bar Inside Arch */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-[#F6F0E4]/20 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F6F0E4]/90">
                      <span>UNIVERSAL COMMERCIAL EXCHANGE</span>
                      <span className="text-[#E9DFCC]">
                        {categories.length} INDUSTRIES · PAN-INDIA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              WARM IVORY FUNCTIONAL SEARCH INTERFACE
          ===================================================================== */}
          <div className="mt-10 lg:mt-12">
            <div className="rounded-[2px] bg-[#F5F0E5] text-[#181914] p-2 sm:p-3 shadow-elevated border border-[#E9DFCC]">
              <form
                action="/businesses"
                method="GET"
                className="grid grid-cols-1 md:grid-cols-12 items-stretch divide-y md:divide-y-0 md:divide-x divide-[#D5CBB8]"
              >
                {/* Input 1: Search businesses, products or services */}
                <div className="md:col-span-5 px-4 py-3 flex flex-col justify-center">
                  <label
                    htmlFor="hero-search-q"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
                  >
                    Search Directory
                  </label>
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <input
                      id="hero-search-q"
                      type="text"
                      name="q"
                      placeholder="Search businesses, products or services..."
                      className="w-full bg-transparent text-sm text-[#181914] placeholder:text-[#7D786C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Input 2: Select city or location */}
                <div className="md:col-span-3 px-4 py-3 flex flex-col justify-center">
                  <label
                    htmlFor="hero-search-city"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
                  >
                    City / Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#A98253] shrink-0" />
                    <select
                      id="hero-search-city"
                      name="city"
                      defaultValue=""
                      className="w-full bg-transparent text-sm text-[#181914] focus:outline-none"
                    >
                      <option value="">All Locations (India)</option>
                      {BRAND_CONFIG.initialCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Input 3: Select industry / category */}
                <div className="md:col-span-2 px-4 py-3 flex flex-col justify-center">
                  <label
                    htmlFor="hero-search-category"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
                  >
                    Industry
                  </label>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#A98253] shrink-0" />
                    <select
                      id="hero-search-category"
                      name="category"
                      defaultValue=""
                      className="w-full bg-transparent text-sm text-[#181914] focus:outline-none"
                    >
                      <option value="">All Industries</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="md:col-span-2 pt-3 md:pt-0 md:pl-3 flex items-stretch">
                  <button
                    type="submit"
                    className="w-full rounded-[2px] bg-[#B94E2D] hover:bg-[#A14122] text-[#F6F0E4] px-5 py-4 font-mono text-xs font-medium uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* =====================================================================
            BOTTOM HERO STRIP — SIX NUMBERED INDUSTRY PANELS
        ===================================================================== */}
        <div className="border-t border-[#4C4A40] bg-[#20211C]/90">
          <div className="container-wide py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A7A194]">
                CORE INDUSTRY SECTORS // 01 — 06
              </span>
              <Link
                href="/#industries"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#E9DFCC] hover:text-[#B94E2D] transition-colors"
              >
                View All {categories.length} Industries →
              </Link>
            </div>

            <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto pb-2 lg:pb-0 snap-x snap-mandatory">
              {HERO_INDUSTRY_PANELS.map((panel) => {
                const IconComponent = panel.Icon;
                return (
                  <Link
                    key={panel.index}
                    href={`/businesses?category=${panel.categorySlug}`}
                    className="group relative min-w-[240px] sm:min-w-[260px] lg:min-w-0 snap-start rounded-[2px] border border-[#4C4A40] bg-[#171A14] p-5 flex flex-col justify-between min-h-[168px] overflow-hidden transition-all duration-200 hover:border-[#B94E2D]"
                  >
                    {/* Textured Architectural Gradient Layer */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${panel.accent}`}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundImage: panel.pattern }}
                    />

                    {/* Top Row: Index Number & Icon */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-mono text-xs font-medium tracking-[0.18em] text-[#B94E2D]">
                        {panel.index}
                      </span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#4C4A40] bg-[#20211C]/80 text-[#E9DFCC] group-hover:border-[#B94E2D] group-hover:bg-[#B94E2D] group-hover:text-[#F6F0E4] transition-colors">
                        <IconComponent className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Bottom Row: Title & Directional Indicator */}
                    <div className="relative z-10 mt-8">
                      <h2 className="font-serif text-xl leading-snug text-[#F6F0E4] group-hover:text-[#E9DFCC]">
                        {panel.title}
                      </h2>
                      <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-[#4C4A40]/70">
                        <span className="text-[11px] text-[#A7A194] line-clamp-1">
                          {panel.subtitle}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#A98253] group-hover:text-[#B94E2D] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 // FEATURED OR RECENTLY PUBLISHED BUSINESSES
      ===================================================================== */}
      <section className="py-16 lg:py-24 border-b border-[#D5CBB8] bg-[#F5F0E5]">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#D5CBB8]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#B94E2D] mb-2">
                01 // VERIFIED COMMERCIAL DIRECTORY
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#181914] leading-tight">
                Featured &amp; Recently Published Businesses
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/businesses" className="btn-secondary">
                <span>Explore Directory</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/business/register" className="btn-terracotta">
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {displayBusinesses.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayBusinesses.map((biz) => {
                const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                const categoryLabel =
                  biz.primaryCategory?.name || 'Commercial Enterprise';
                return (
                  <article
                    key={biz.id}
                    className="group flex flex-col justify-between rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-6 transition-all hover:border-[#B94E2D]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[#E9DFCC]">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C584F]">
                          {categoryLabel}
                        </span>
                        <span
                          className={
                            badge.isVerified ? 'badge-verified' : 'badge-neutral'
                          }
                        >
                          {badge.isVerified && <ShieldCheck className="h-3 w-3" />}
                          {badge.shortLabel}
                        </span>
                      </div>

                      <Link href={`/business/${biz.slug}`}>
                        <h3 className="font-display text-2xl sm:text-3xl text-[#181914] group-hover:text-[#B94E2D] transition-colors">
                          {biz.name}
                        </h3>
                      </Link>

                      {biz.tagline && (
                        <p className="mt-1.5 text-xs font-medium text-[#181914]">
                          {biz.tagline}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-[#5C584F] line-clamp-3 leading-relaxed">
                        {biz.description || biz.shortDescription}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E9DFCC] flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#5C584F] inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#B94E2D]" />
                        {biz.city}
                        {biz.state ? `, ${biz.state}` : ''}
                      </span>
                      <Link
                        href={`/business/${biz.slug}`}
                        className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#B94E2D] inline-flex items-center gap-1 hover:underline"
                      >
                        <span>View Storefront</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Honest Onboarding State when 0 businesses are published */
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 rounded-[2px] border border-[#D5CBB8] bg-[#E9DFCC] overflow-hidden">
              <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                <div>
                  <span className="index-code-terracotta mb-4">
                    FOUNDING DIRECTORY OPEN
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl text-[#181914] leading-tight">
                    Establish Your Digital Storefront on PROVENTA.
                  </h3>
                  <p className="mt-4 text-sm sm:text-base text-[#5C584F] leading-relaxed max-w-2xl">
                    PROVENTA maintains strict data authenticity—we never populate our platform
                    with synthetic companies, fabricated reviews, or placeholder metrics. Register
                    your business to publish your verified storefront, showcase your products and
                    services, and receive customer enquiries.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/business/register" className="btn-terracotta">
                    <span>Register Your Business</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/enquiries/new" className="btn-secondary">
                    <span>Submit a Buyer Enquiry</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#20211C] text-[#F6F0E4] p-8 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#4C4A40]">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A98253] pb-3 border-b border-[#4C4A40]">
                    STOREFRONT CAPABILITIES
                  </div>
                  <ul className="mt-5 space-y-4 text-xs text-[#E9DFCC]">
                    <li className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                      <span>
                        Dedicated storefront URL (<code className="font-mono">/business/[slug]</code>)
                        indexed by industry and location.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                      <span>
                        Complete product, service, and package catalog with flexible pricing
                        modes.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#B94E2D] shrink-0 mt-0.5" />
                      <span>
                        Deterministic enquiry matching and structured quotation management.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#4C4A40] font-mono text-[10px] uppercase tracking-[0.18em] text-[#A7A194]">
                  EVERY BUSINESS. ONE PLACE.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 // COMPLETE INDUSTRY & CATEGORY INDEX (18 SECTORS)
      ===================================================================== */}
      <section id="industries" className="py-16 lg:py-24 border-b border-[#D5CBB8] bg-[#E9DFCC]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-8 border-b border-[#CFC5B2]">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#B94E2D] mb-2">
                02 // INDUSTRY TAXONOMY
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#181914] leading-tight">
                Discover Businesses Across {categories.length} Industries
              </h2>
            </div>
            <div className="lg:col-span-5 flex lg:justify-end">
              <p className="text-sm text-[#5C584F] max-w-md">
                Browse structured industry sectors from manufacturing and construction to
                technology, hospitality, healthcare, and professional services.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#CFC5B2]">
            {categories.map((cat, idx) => {
              const subcats = cat.subcategories || [];
              return (
                <Link
                  key={cat.id}
                  href={`/businesses?category=${cat.slug}`}
                  className="group flex flex-col justify-between border-r border-b border-[#CFC5B2] bg-[#F5F0E5] p-6 transition-colors hover:bg-[#171A14] hover:text-[#F6F0E4]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-medium tracking-[0.18em] text-[#B94E2D]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#5C584F] group-hover:text-[#B94E2D] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h3 className="font-display text-2xl text-[#181914] group-hover:text-[#F6F0E4]">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#5C584F] group-hover:text-[#A7A194] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {subcats.length > 0 && (
                    <div className="mt-5 pt-3 border-t border-[#E9DFCC] group-hover:border-[#4C4A40] flex flex-wrap gap-1.5">
                      {subcats.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 bg-[#E9DFCC] text-[#181914] group-hover:bg-[#20211C] group-hover:text-[#E9DFCC]"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 // PRODUCT & SERVICE DISCOVERY
      ===================================================================== */}
      <section className="py-16 lg:py-24 border-b border-[#D5CBB8] bg-[#F5F0E5]">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#D5CBB8]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#B94E2D] mb-2">
                03 // CATALOG &amp; OFFERINGS
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-[#181914] leading-tight">
                Product &amp; Service Discovery
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/listings?type=PRODUCT" className="btn-secondary">
                <span>Browse Products</span>
              </Link>
              <Link href="/listings?type=SERVICE" className="btn-secondary">
                <span>Browse Services</span>
              </Link>
              <Link href="/listings" className="btn-dark">
                <span>Full Catalog</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {recentListingsResult.items.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentListingsResult.items.slice(0, 6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-[#5C584F] mb-2">
                      <span className="text-[#B94E2D]">{item.listingType}</span>
                      <span>{item.categoryName}</span>
                    </div>
                    <h3 className="font-display text-2xl text-[#181914]">{item.title}</h3>
                    <p className="mt-2 text-xs text-[#5C584F] line-clamp-2">
                      {item.shortSummary || item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E9DFCC] flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-[#181914]">
                      {item.priceAmount
                        ? `₹${item.priceAmount.toLocaleString('en-IN')}`
                        : PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </span>
                    <Link
                      href={`/enquiries/new?listingId=${item.id}&businessId=${item.businessId}`}
                      className="text-[#B94E2D] uppercase tracking-[0.12em] hover:underline"
                    >
                      Request Quote →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  CATEGORY // PRODUCTS
                </span>
                <h3 className="mt-2 font-display text-2xl text-[#181914]">
                  Industrial &amp; Commercial Products
                </h3>
                <p className="mt-2 text-xs text-[#5C584F] leading-relaxed">
                  Source raw materials, equipment, retail goods, and custom-manufactured items with
                  fixed or volume pricing.
                </p>
                <Link
                  href="/listings?type=PRODUCT"
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B94E2D]"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  CATEGORY // SERVICES
                </span>
                <h3 className="mt-2 font-display text-2xl text-[#181914]">
                  Professional &amp; Specialist Services
                </h3>
                <p className="mt-2 text-xs text-[#5C584F] leading-relaxed">
                  Engage verified agencies, contractors, consultants, logistics partners, and
                  hospitality providers.
                </p>
                <Link
                  href="/listings?type=SERVICE"
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B94E2D]"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B94E2D]">
                  DIRECT RFQ // CUSTOM SCOPE
                </span>
                <h3 className="mt-2 font-display text-2xl text-[#181914]">
                  Custom Enquiry &amp; Quotations
                </h3>
                <p className="mt-2 text-xs text-[#5C584F] leading-relaxed">
                  Have a bespoke requirement? Post a single enquiry and receive tailored
                  quotations from matched businesses.
                </p>
                <Link
                  href="/enquiries/new"
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#B94E2D]"
                >
                  <span>Post an Enquiry</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 // HOW PROVENTA WORKS & DUAL BENEFITS
      ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A98253] mb-2">
              04 // PLATFORM ARCHITECTURE
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-[#F6F0E4] leading-tight">
              How PROVENTA Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A7A194]">
              A structured workflow connecting buyers seeking reliable providers with businesses
              ready to deliver.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 border border-[#4C4A40] bg-[#20211C] divide-y lg:divide-y-0 lg:divide-x divide-[#4C4A40]">
            <div className="p-8 lg:p-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#B94E2D]">
                STEP 01 // DISCOVER
              </div>
              <h3 className="mt-3 font-display text-3xl text-[#F6F0E4]">
                Search Industries, Storefronts &amp; Offerings
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#A7A194] leading-relaxed">
                Query the directory by keyword, city, and industry classification. Inspect
                verified business profiles, product specifications, and service coverage areas.
              </p>
            </div>

            <div className="p-8 lg:p-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#B94E2D]">
                STEP 02 // CONNECT
              </div>
              <h3 className="mt-3 font-display text-3xl text-[#F6F0E4]">
                Submit Targeted or Open Enquiries
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#A7A194] leading-relaxed">
                Send a direct enquiry to a specific storefront or post an open requirement. Our
                deterministic matching engine routes your enquiry to relevant businesses while
                protecting your contact privacy.
              </p>
            </div>

            <div className="p-8 lg:p-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#B94E2D]">
                STEP 03 // COLLABORATE &amp; GROW
              </div>
              <h3 className="mt-3 font-display text-3xl text-[#F6F0E4]">
                Compare Quotations &amp; Award Business
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#A7A194] leading-relaxed">
                Receive structured quotations with transparent pricing, timelines, and terms.
                Shortlist, compare, and accept the right proposal directly from your dashboard.
              </p>
            </div>
          </div>

          {/* Dual Benefits: For Customers & For Business Owners */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-[2px] border border-[#4C4A40] bg-[#20211C] p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="index-code-terracotta mb-4">FOR CUSTOMERS &amp; BUYERS</span>
                <h3 className="font-display text-3xl sm:text-4xl text-[#F6F0E4]">
                  Source with Clarity and Confidence.
                </h3>
                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#E9DFCC]">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Unified access to products and services across 18 industries</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Privacy-protected enquiries—share contact details only when ready</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Side-by-side quotation comparison with zero buyer fees</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/enquiries/new" className="btn-ivory">
                  <span>Post a Customer Enquiry</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2px] border border-[#B94E2D]/50 bg-[#20211C] p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="index-code-terracotta mb-4">FOR BUSINESS OWNERS</span>
                <h3 className="font-display text-3xl sm:text-4xl text-[#F6F0E4]">
                  Expand Your Commercial Reach.
                </h3>
                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[#E9DFCC]">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Editorial digital storefront showcasing your brand and credentials</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Structured catalog for products, services, and custom solutions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-[#B94E2D] shrink-0" />
                    <span>Matched buyer enquiries and formal quotation builder</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/business/register" className="btn-terracotta">
                  <span>List Your Business</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

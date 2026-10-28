import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { getCategories, searchBusinesses } from '@/lib/marketplace/repository';
import {
  BusinessType,
  VERIFICATION_BADGE_META,
} from '@/lib/marketplace/types';
import { BRAND_CONFIG } from '@/lib/brand';

export const dynamic = 'force-dynamic';

interface BusinessesDirectoryPageProps {
  searchParams?: {
    q?: string;
    category?: string;
    city?: string;
    type?: string;
    verified?: string;
    sort?: string;
    page?: string;
  };
}

export default function BusinessesDirectoryPage({
  searchParams = {},
}: BusinessesDirectoryPageProps) {
  const query = searchParams.q?.trim() || '';
  const selectedCategory = searchParams.category?.trim() || '';
  const selectedCity = searchParams.city?.trim() || '';
  const selectedType = (searchParams.type?.toUpperCase() || '') as BusinessType | '';
  const verifiedOnly = searchParams.verified === 'true';
  const rawSort = searchParams.sort || 'relevance';
  const sortBy: 'relevance' | 'newest' | 'popular' | 'rating' | 'name' =
    rawSort === 'newest' ||
    rawSort === 'popular' ||
    rawSort === 'rating' ||
    rawSort === 'name'
      ? rawSort
      : 'relevance';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const categories = getCategories({ onlyTopLevel: true });
  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory,
  );
  const activeCategoryIndex = categories.findIndex(
    (c) => c.slug === selectedCategory || c.id === selectedCategory,
  );

  const searchResult = searchBusinesses({
    query: query || undefined,
    categorySlug: selectedCategory || undefined,
    city: selectedCity || undefined,
    businessType:
      selectedType && ['PRODUCT', 'SERVICE', 'HYBRID'].includes(selectedType)
        ? selectedType
        : undefined,
    verificationLevel: verifiedOnly ? 'VERIFIED_BUSINESS' : undefined,
    sortBy,
    page,
    limit: 24,
  });

  const hasActiveFilters = Boolean(
    query || selectedCategory || selectedCity || selectedType || verifiedOnly,
  );

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* =====================================================================
          DARK ARCHITECTURAL DIRECTORY HEADER & WARM IVORY SEARCH BAR
      ===================================================================== */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]">
        <div className="container-wide py-12 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#4C4A40] font-mono text-[11px] uppercase tracking-[0.18em] text-[#A7A194]">
            <div className="flex items-center gap-3">
              <span className="index-code-terracotta">DIRECTORY</span>
              <span>PROVENTA // EVERY BUSINESS. ONE PLACE.</span>
            </div>
            <div>
              <span>
                MATCHED BUSINESSES:{' '}
                <strong className="text-[#F6F0E4]">
                  {String(searchResult.total).padStart(2, '0')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              {activeCategoryObj && (
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#B94E2D]">
                    INDUSTRY {String(activeCategoryIndex + 1).padStart(2, '0')} //
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#E9DFCC]">
                    {activeCategoryObj.slug}
                  </span>
                </div>
              )}
              <h1 className="font-display text-4xl sm:text-6xl text-[#F6F0E4] leading-[0.95]">
                {activeCategoryObj ? (
                  activeCategoryObj.name
                ) : (
                  <>
                    Business Directory{' '}
                    <span className="italic text-[#B94E2D]">without limits.</span>
                  </>
                )}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#A7A194] max-w-2xl leading-relaxed">
                {activeCategoryObj
                  ? activeCategoryObj.description
                  : 'Discover verified businesses across 18 industries. Filter by location, category, and business model, or post a direct customer enquiry.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <Link href="/enquiries/new" className="btn-ivory">
                <span>Post Enquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/business/register" className="btn-terracotta">
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Warm Ivory Search Bar */}
          <form
            action="/businesses"
            method="GET"
            className="mt-8 grid grid-cols-1 md:grid-cols-12 rounded-[2px] border border-[#E9DFCC] bg-[#F5F0E5] text-[#181914] p-2 divide-y md:divide-y-0 md:divide-x divide-[#D5CBB8]"
          >
            <div className="md:col-span-4 px-3.5 py-2.5">
              <label
                htmlFor="dir-q"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Search Businesses, Products or Services
              </label>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#B94E2D] mr-2 shrink-0" />
                <input
                  id="dir-q"
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Company name, capability, keyword..."
                  className="w-full bg-transparent text-sm text-[#181914] placeholder:text-[#7D786C] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 px-3.5 py-2.5">
              <label
                htmlFor="dir-cat"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Industry / Category
              </label>
              <select
                id="dir-cat"
                name="category"
                defaultValue={selectedCategory}
                className="w-full bg-transparent text-xs font-mono text-[#181914] focus:outline-none"
              >
                <option value="">All 18 Industries</option>
                {categories.map((cat, idx) => (
                  <option key={cat.id} value={cat.slug}>
                    {String(idx + 1).padStart(2, '0')} — {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 px-3.5 py-2.5">
              <label
                htmlFor="dir-city"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                City / Location
              </label>
              <select
                id="dir-city"
                name="city"
                defaultValue={selectedCity}
                className="w-full bg-transparent text-xs font-mono text-[#181914] focus:outline-none"
              >
                <option value="">All India</option>
                {BRAND_CONFIG.initialCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 px-3.5 py-2.5">
              <label
                htmlFor="dir-type"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Model
              </label>
              <select
                id="dir-type"
                name="type"
                defaultValue={selectedType}
                className="w-full bg-transparent text-xs font-mono text-[#181914] focus:outline-none"
              >
                <option value="">All</option>
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2 md:pt-0 md:pl-2 flex">
              <button
                type="submit"
                className="w-full rounded-[2px] bg-[#B94E2D] text-[#F6F0E4] font-mono text-xs font-medium uppercase tracking-[0.16em] px-4 py-3 hover:bg-[#A14122] transition-colors flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================================
          DIRECTORY CONTENT: INDUSTRY SIDEBAR + BUSINESS PROFILES
      ===================================================================== */}
      <section className="py-12 lg:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar: 18 Industries */}
            <aside className="lg:col-span-3 rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] overflow-hidden">
              <div className="p-4 bg-[#20211C] text-[#F6F0E4] flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  Industries (18)
                </span>
                {hasActiveFilters && (
                  <Link
                    href="/businesses"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B94E2D] underline"
                  >
                    Reset
                  </Link>
                )}
              </div>

              <div className="divide-y divide-[#E9DFCC] max-h-[560px] overflow-y-auto">
                <Link
                  href="/businesses"
                  className={`flex items-center justify-between px-4 py-3 font-mono text-xs transition-colors ${
                    !selectedCategory
                      ? 'bg-[#B94E2D] text-[#F6F0E4] font-medium'
                      : 'text-[#181914] hover:bg-[#E9DFCC]'
                  }`}
                >
                  <span>00 — All Industries</span>
                  <span>→</span>
                </Link>
                {categories.map((cat, idx) => {
                  const active = selectedCategory === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={`/businesses?category=${cat.slug}${
                        selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : ''
                      }`}
                      className={`flex items-center justify-between gap-2 px-4 py-2.5 text-xs transition-colors ${
                        active
                          ? 'bg-[#171A14] text-[#F6F0E4] font-medium'
                          : 'text-[#181914] hover:bg-[#E9DFCC]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`font-mono text-[10px] ${
                            active ? 'text-[#B94E2D]' : 'text-[#A98253]'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="font-mono text-[10px] shrink-0">→</span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Right Column: Business Results */}
            <div className="lg:col-span-9">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[#D5CBB8] bg-[#E9DFCC] px-4 py-3 mb-6 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[#181914]">
                    SHOWING {searchResult.items.length} OF {searchResult.total} BUSINESSES
                  </span>
                  {selectedCategory && (
                    <span className="bg-[#171A14] text-[#F6F0E4] px-2 py-0.5 text-[10px] uppercase">
                      INDUSTRY: {selectedCategory}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="bg-[#B94E2D] text-[#F6F0E4] px-2 py-0.5 text-[10px] uppercase">
                      CITY: {selectedCity}
                    </span>
                  )}
                </div>
                <Link
                  href="/listings"
                  className="underline font-medium text-[#181914] hover:text-[#B94E2D]"
                >
                  Browse Products &amp; Services →
                </Link>
              </div>

              {searchResult.items.length > 0 ? (
                <div className="space-y-4">
                  {searchResult.items.map((biz, idx) => {
                    const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                    const catIdx = categories.findIndex(
                      (c) => c.id === biz.primaryCategoryId || c.slug === biz.primaryCategoryId,
                    );
                    const catName =
                      biz.primaryCategory?.name ||
                      categories[catIdx]?.name ||
                      'Commercial Enterprise';
                    const listingsCount = (biz.listings || []).length;

                    return (
                      <article
                        key={biz.id}
                        className="group rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-6 sm:p-8 hover:border-[#B94E2D] transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#E9DFCC] font-mono text-[11px]">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[#B94E2D] font-medium">
                              {String((page - 1) * 24 + idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[#181914] uppercase tracking-[0.12em]">
                              {catName}
                            </span>
                            <span className="text-[#7D786C]">·</span>
                            <span className="text-[#5C584F] uppercase">
                              {biz.businessType}
                            </span>
                          </div>

                          <span
                            className={
                              badge.isVerified ? 'badge-verified' : 'badge-neutral'
                            }
                          >
                            {badge.isVerified && <ShieldCheck className="h-3 w-3" />}
                            {badge.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          <div className="lg:col-span-8">
                            <Link href={`/business/${biz.slug}`} className="inline-block">
                              <h2 className="font-display text-3xl text-[#181914] group-hover:text-[#B94E2D] transition-colors">
                                {biz.name}
                              </h2>
                            </Link>
                            {biz.tagline && (
                              <p className="mt-1 text-sm font-medium text-[#181914]">
                                {biz.tagline}
                              </p>
                            )}
                            <p className="mt-2.5 text-sm text-[#5C584F] leading-relaxed line-clamp-2">
                              {biz.description || biz.shortDescription}
                            </p>

                            {biz.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {biz.tags.slice(0, 6).map((kw: string) => (
                                  <span
                                    key={kw}
                                    className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 border border-[#D5CBB8] bg-[#F5F0E5] text-[#5C584F]"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#E9DFCC] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full">
                            <dl className="space-y-2 font-mono text-xs">
                              <div className="flex items-center justify-between">
                                <dt className="text-[#5C584F]">LOCATION</dt>
                                <dd className="font-medium text-[#181914] flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#B94E2D]" />
                                  {biz.city}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-[#5C584F]">COVERAGE</dt>
                                <dd className="text-[#181914]">
                                  {biz.serviceAreas.length > 0
                                    ? biz.serviceAreas.slice(0, 2).join(', ')
                                    : biz.city}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-[#5C584F]">OFFERINGS</dt>
                                <dd className="font-medium text-[#181914]">
                                  {listingsCount} Listed
                                </dd>
                              </div>
                            </dl>

                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <Link
                                href={`/business/${biz.slug}`}
                                className="btn-secondary py-2 px-3 text-[10px]"
                              >
                                <span>Storefront</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/enquiries/new?businessId=${biz.id}`}
                                className="btn-terracotta py-2 px-3 text-[10px]"
                              >
                                <span>Enquire</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-8 sm:p-12">
                  <span className="index-code-terracotta mb-4">
                    DIRECTORY STATUS // 0 MATCHES
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl text-[#181914]">
                    {hasActiveFilters
                      ? 'No businesses match your current filter selection.'
                      : 'The PROVENTA directory is open for business registrations.'}
                  </h2>
                  <p className="mt-3 text-sm text-[#5C584F] max-w-2xl leading-relaxed">
                    {hasActiveFilters
                      ? 'Reset one or more filters to broaden your search, or post a customer enquiry so verified businesses in this industry can respond with quotations.'
                      : 'We never populate our platform with synthetic profiles. Register your business to publish your digital storefront or post a buyer enquiry today.'}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {hasActiveFilters && (
                      <Link href="/businesses" className="btn-secondary">
                        Reset All Filters
                      </Link>
                    )}
                    <Link
                      href={`/enquiries/new${
                        activeCategoryObj ? `?categoryId=${activeCategoryObj.id}` : ''
                      }`}
                      className="btn-dark"
                    >
                      <span>Post Customer Enquiry</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/business/register" className="btn-terracotta">
                      <span>List Your Business</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11]">
      {/* =====================================================================
          DIRECTORY MASTHEAD & QUERY BAR
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11] bg-[#FAF8F3]">
        <div className="container-wide py-10 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#CFCAC0] font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
            <div className="flex items-center gap-2">
              <span className="index-code">DIRECTORY // 01</span>
              <span>ENTITY REGISTRY &amp; COMMERCIAL INDEX</span>
            </div>
            <div>
              <span>
                RECORDS MATCHED:{' '}
                <strong className="text-[#0D0E11]">
                  {String(searchResult.total).padStart(3, '0')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              {activeCategoryObj && (
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="index-code-lime">
                    SECTOR CAT/{String(activeCategoryIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#52514E]">
                    {activeCategoryObj.slug}
                  </span>
                </div>
              )}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-[#0D0E11] uppercase leading-[0.94]">
                {activeCategoryObj ? activeCategoryObj.name : 'THE BUSINESS DIRECTORY.'}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#52514E] max-w-2xl leading-relaxed">
                {activeCategoryObj
                  ? activeCategoryObj.description
                  : 'Inspect verified commercial entities across 18 industry sectors. Filter by sector code, operating city, and offering model—or dispatch a structured buyer enquiry.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2.5">
              <Link href="/enquiries/new" className="btn-primary">
                <span>POST BUYER ENQUIRY</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/business/register" className="btn-accent">
                <span>PUBLISH BUSINESS</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Structured Filter Terminal */}
          <form
            action="/businesses"
            method="GET"
            className="mt-8 grid grid-cols-1 md:grid-cols-12 border-2 border-[#0D0E11] bg-[#F4F1EA]"
          >
            <div className="md:col-span-4 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="dir-q"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                01 // KEYWORD OR CAPABILITY
              </label>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#52514E] mr-2 shrink-0" />
                <input
                  id="dir-q"
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Company name, product, service, tag..."
                  className="w-full bg-transparent text-sm text-[#0D0E11] placeholder:text-[#78756F] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="dir-cat"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                02 // SECTOR CODE
              </label>
              <select
                id="dir-cat"
                name="category"
                defaultValue={selectedCategory}
                className="w-full bg-transparent font-mono text-xs text-[#0D0E11] focus:outline-none"
              >
                <option value="">ALL 18 SECTORS</option>
                {categories.map((cat, idx) => (
                  <option key={cat.id} value={cat.slug}>
                    [{String(idx + 1).padStart(2, '0')}] {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="dir-city"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                03 // CITY
              </label>
              <select
                id="dir-city"
                name="city"
                defaultValue={selectedCity}
                className="w-full bg-transparent font-mono text-xs text-[#0D0E11] focus:outline-none"
              >
                <option value="">ALL INDIA</option>
                {BRAND_CONFIG.initialCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="dir-type"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                04 // MODEL
              </label>
              <select
                id="dir-type"
                name="type"
                defaultValue={selectedType}
                className="w-full bg-transparent font-mono text-xs text-[#0D0E11] focus:outline-none"
              >
                <option value="">ALL</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="SERVICE">SERVICE</option>
                <option value="HYBRID">HYBRID</option>
              </select>
            </div>

            <div className="md:col-span-2 flex">
              <button
                type="submit"
                className="w-full bg-[#0D0E11] text-[#F4F1EA] font-mono text-xs font-bold uppercase tracking-[0.14em] px-4 py-3 hover:bg-[#C8F904] hover:text-[#0D0E11] transition-colors flex items-center justify-center gap-2"
              >
                <span>FILTER INDEX</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================================
          MAIN SPLIT LAYOUT: SECTOR INDEX SIDEBAR + TABULAR ENTITY LEDGER
      ===================================================================== */}
      <section className="py-12 lg:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar (3 Cols): Sector Classification Codes */}
            <aside className="lg:col-span-3 border border-[#0D0E11] bg-[#FAF8F3]">
              <div className="p-4 border-b border-[#0D0E11] bg-[#0D0E11] text-[#F4F1EA] flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                  SECTOR INDEX (18)
                </span>
                {hasActiveFilters && (
                  <Link
                    href="/businesses"
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C8F904] underline"
                  >
                    RESET
                  </Link>
                )}
              </div>

              <div className="divide-y divide-[#CFCAC0] max-h-[560px] overflow-y-auto">
                <Link
                  href="/businesses"
                  className={`flex items-center justify-between px-4 py-2.5 font-mono text-xs transition-colors ${
                    !selectedCategory
                      ? 'bg-[#C8F904] text-[#0D0E11] font-bold'
                      : 'text-[#0D0E11] hover:bg-[#EAE5DA]'
                  }`}
                >
                  <span>00 // ALL SECTORS</span>
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
                          ? 'bg-[#0D0E11] text-[#C8F904] font-bold'
                          : 'text-[#0D0E11] hover:bg-[#EAE5DA]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`font-mono text-[10px] ${
                            active ? 'text-[#C8F904]' : 'text-[#52514E]'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate font-medium">{cat.name}</span>
                      </div>
                      <span className="font-mono text-[10px] shrink-0">→</span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Right Column (9 Cols): Structured Entity Ledger */}
            <div className="lg:col-span-9">
              {/* Ledger Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-[#0D0E11] bg-[#EAE5DA] px-4 py-3 mb-6 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0D0E11]">
                    SHOWING {searchResult.items.length} OF {searchResult.total} ENTITIES
                  </span>
                  {selectedCategory && (
                    <span className="bg-[#0D0E11] text-[#C8F904] px-2 py-0.5 text-[10px] uppercase">
                      SECTOR: {selectedCategory}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="bg-[#0D0E11] text-[#F4F1EA] px-2 py-0.5 text-[10px] uppercase">
                      CITY: {selectedCity}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <Link
                    href="/listings"
                    className="underline font-bold text-[#0D0E11] hover:text-[#52514E]"
                  >
                    SWITCH TO OFFERINGS CATALOG →
                  </Link>
                </div>
              </div>

              {searchResult.items.length > 0 ? (
                <div className="divide-y divide-[#0D0E11] border border-[#0D0E11] bg-[#FAF8F3]">
                  {searchResult.items.map((biz, idx) => {
                    const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                    const catIdx = categories.findIndex(
                      (c) => c.id === biz.primaryCategoryId || c.slug === biz.primaryCategoryId,
                    );
                    const catCode =
                      catIdx >= 0 ? `SEC-${String(catIdx + 1).padStart(2, '0')}` : 'SEC-00';
                    const catName =
                      biz.primaryCategory?.name ||
                      categories[catIdx]?.name ||
                      'Commercial Entity';
                    const listingsCount = (biz.listings || []).length;

                    return (
                      <article
                        key={biz.id}
                        className="group p-6 sm:p-8 hover:bg-[#EAE5DA]/60 transition-colors"
                      >
                        {/* Top Metadata Strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#CFCAC0] font-mono text-[11px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#0D0E11] text-[#F4F1EA] px-2 py-0.5 font-bold">
                              #{String((page - 1) * 24 + idx + 1).padStart(3, '0')}
                            </span>
                            <span className="border border-[#0D0E11] bg-[#F4F1EA] px-2 py-0.5 font-semibold text-[#0D0E11]">
                              {catCode} // {catName}
                            </span>
                            <span className="text-[#52514E] uppercase">
                              MODEL: {biz.businessType}
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

                        {/* Main Entity Content Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          <div className="lg:col-span-8">
                            <Link href={`/business/${biz.slug}`} className="inline-block">
                              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#0D0E11] group-hover:underline">
                                {biz.name}
                              </h2>
                            </Link>
                            {biz.tagline && (
                              <p className="mt-1 text-sm font-semibold text-[#0D0E11]">
                                {biz.tagline}
                              </p>
                            )}
                            <p className="mt-2.5 text-sm text-[#52514E] leading-relaxed line-clamp-2">
                              {biz.description || biz.shortDescription}
                            </p>

                            {biz.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {biz.tags.slice(0, 6).map((kw: string) => (
                                  <span
                                    key={kw}
                                    className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 border border-[#CFCAC0] bg-[#F4F1EA] text-[#52514E]"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right Specification & Action Column */}
                          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#CFCAC0] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full">
                            <dl className="space-y-2 font-mono text-xs">
                              <div className="flex items-center justify-between">
                                <dt className="text-[#52514E]">JURISDICTION</dt>
                                <dd className="font-bold text-[#0D0E11] flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {biz.city}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-[#52514E]">COVERAGE</dt>
                                <dd className="text-[#0D0E11]">
                                  {biz.serviceAreas.length > 0
                                    ? biz.serviceAreas.slice(0, 2).join(', ')
                                    : biz.city}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-[#52514E]">CATALOG ITEMS</dt>
                                <dd className="font-bold text-[#0D0E11]">
                                  {listingsCount} PUBLISHED
                                </dd>
                              </div>
                            </dl>

                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <Link
                                href={`/business/${biz.slug}`}
                                className="inline-flex items-center justify-center gap-1 border border-[#0D0E11] bg-[#FAF8F3] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#0D0E11] hover:bg-[#0D0E11] hover:text-[#F4F1EA] transition-colors"
                              >
                                <span>DOSSIER</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href={`/enquiries/new?businessId=${biz.id}`}
                                className="inline-flex items-center justify-center gap-1 border border-[#0D0E11] bg-[#C8F904] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#0D0E11] hover:bg-[#0D0E11] hover:text-[#C8F904] transition-colors"
                              >
                                <span>ENQUIRE</span>
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
                /* Empty / Founding Directory State */
                <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="index-code-lime">INDEX QUERY RESULT // 0 MATCHES</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
                    {hasActiveFilters
                      ? 'NO REGISTERED ENTITIES MATCH YOUR CURRENT FILTER PARAMETERS.'
                      : 'THE DIRECTORY IS OPEN FOR FOUNDING BUSINESS REGISTRATIONS.'}
                  </h2>
                  <p className="mt-3 text-sm text-[#52514E] max-w-2xl leading-relaxed">
                    {hasActiveFilters
                      ? 'Clear one or more filter constraints to broaden your search, or submit an open buyer enquiry and our registry will route it to matching businesses in this sector.'
                      : 'PROVENTA maintains strict data integrity—we never display fabricated placeholder companies. Register your business storefront today or dispatch a buyer requirement.'}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {hasActiveFilters && (
                      <Link href="/businesses" className="btn-secondary">
                        RESET ALL FILTERS
                      </Link>
                    )}
                    <Link
                      href={`/enquiries/new${
                        activeCategoryObj ? `?categoryId=${activeCategoryObj.id}` : ''
                      }`}
                      className="btn-primary"
                    >
                      <span>DISPATCH OPEN BUYER ENQUIRY</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/business/register" className="btn-accent">
                      <span>PUBLISH BUSINESS STOREFRONT</span>
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

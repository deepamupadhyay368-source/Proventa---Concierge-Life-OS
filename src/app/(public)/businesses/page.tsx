import Link from 'next/link';
import {
  Search,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { getCategories, searchBusinesses } from '@/lib/marketplace/repository';
import {
  VERIFICATION_BADGE_META,
  type BusinessType,
  type DirectorySearchParams,
} from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

interface BusinessesDirectoryPageProps {
  searchParams:
    | Promise<{
        q?: string;
        category?: string;
        city?: string;
        type?: string;
        verified?: string;
        sort?: string;
        page?: string;
      }>
    | {
        q?: string;
        category?: string;
        city?: string;
        type?: string;
        verified?: string;
        sort?: string;
        page?: string;
      };
}

export default async function BusinessesDirectoryPage({
  searchParams: searchParamsInput,
}: BusinessesDirectoryPageProps) {
  const searchParams = await Promise.resolve(searchParamsInput);
  const page = Number(searchParams.page) || 1;
  const sortBy: DirectorySearchParams['sortBy'] =
    searchParams.sort === 'newest' ||
    searchParams.sort === 'name' ||
    searchParams.sort === 'popular' ||
    searchParams.sort === 'rating'
      ? searchParams.sort
      : 'relevance';

  const categories = getCategories({ onlyTopLevel: true });
  const result = searchBusinesses({
    query: searchParams.q,
    categorySlug: searchParams.category,
    city: searchParams.city,
    businessType: (searchParams.type as BusinessType) || undefined,
    verificationLevel:
      searchParams.verified === 'true' ? 'VERIFIED_BUSINESS' : undefined,
    sortBy,
    page,
    limit: 12,
  });

  const activeCategory = categories.find((c) => c.slug === searchParams.category);
  const hasFilters = Boolean(
    searchParams.q ||
      searchParams.category ||
      searchParams.city ||
      searchParams.type ||
      searchParams.verified === 'true',
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] pb-20">
      {/* =====================================================================
          SEARCH & FILTER HEADER
      ===================================================================== */}
      <section className="border-b border-[#E8E9ED] bg-[#FFFFFF] py-10">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE] mb-2">
                <span>Business Directory</span>
                <span className="text-[#E8E9ED]">•</span>
                <span className="text-[#696D76]">
                  {result.total} {result.total === 1 ? 'Business' : 'Businesses'} Found
                </span>
              </div>
              <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#15171B]">
                {activeCategory
                  ? activeCategory.name
                  : 'Explore Businesses Across Industries'}
              </h1>
              <p className="mt-1.5 text-[15px] text-[#696D76] max-w-2xl">
                {activeCategory
                  ? activeCategory.description
                  : 'Search verified storefronts, compare products and services, and connect directly with providers.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/enquiries/new" className="btn-secondary">
                Post a Custom Requirement
              </Link>
              <Link href="/business/register" className="btn-primary">
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Filter Form */}
          <form
            action="/businesses"
            method="GET"
            className="rounded-[12px] border border-[#E8E9ED] bg-[#FAFAF8] p-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
              {/* Query */}
              <div className="lg:col-span-4 relative flex items-center">
                <Search className="h-4 w-4 text-[#696D76] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams.q || ''}
                  placeholder="Business name, product, service, or keyword..."
                  className="input-enterprise pl-10"
                />
              </div>

              {/* Category */}
              <div className="lg:col-span-3">
                <select
                  name="category"
                  aria-label="Filter by category"
                  defaultValue={searchParams.category || ''}
                  className="input-enterprise"
                >
                  <option value="">All Categories ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="lg:col-span-2">
                <select
                  name="city"
                  aria-label="Filter by city"
                  defaultValue={searchParams.city || ''}
                  className="input-enterprise"
                >
                  <option value="">All Cities</option>
                  {BRAND_CONFIG.initialCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Type */}
              <div className="lg:col-span-2">
                <select
                  name="type"
                  aria-label="Filter by business type"
                  defaultValue={searchParams.type || ''}
                  className="input-enterprise"
                >
                  <option value="">All Business Types</option>
                  <option value="PRODUCT">Products / Manufacturing / Retail</option>
                  <option value="SERVICE">Services / Consulting / Agency</option>
                  <option value="HYBRID">Hybrid (Product + Service)</option>
                </select>
              </div>

              {/* Submit */}
              <div className="lg:col-span-1">
                <button
                  type="submit"
                  className="w-full h-full min-h-[42px] rounded-[10px] bg-[#304FFE] hover:bg-[#243FE0] text-white font-semibold text-[14px] px-4 transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Secondary Controls Bar: Verified Only + Sort + Reset */}
            <div className="mt-3 pt-3 border-t border-[#E8E9ED] flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-[#15171B] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    name="verified"
                    value="true"
                    defaultChecked={searchParams.verified === 'true'}
                    className="rounded border-[#D1D4DC] text-[#304FFE] focus:ring-[#304FFE]"
                  />
                  <span>Verified businesses only</span>
                </label>

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#696D76]" />
                  <span className="text-[#696D76]">Sort by:</span>
                  <select
                    name="sort"
                    aria-label="Sort businesses"
                    defaultValue={sortBy}
                    className="rounded-[7px] border border-[#E8E9ED] bg-[#FFFFFF] px-2.5 py-1 text-[12px] font-medium text-[#15171B]"
                  >
                    <option value="relevance">Relevance &amp; Verified First</option>
                    <option value="newest">Recently Listed</option>
                    <option value="popular">Most Viewed</option>
                    <option value="name">Alphabetical (A–Z)</option>
                  </select>
                </div>
              </div>

              {hasFilters && (
                <Link
                  href="/businesses"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#696D76] hover:text-[#15171B] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset all filters</span>
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================================
          MAIN DIRECTORY BODY (Category Sidebar + Business Cards Grid)
      ===================================================================== */}
      <div className="container-wide pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Industry Categories */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="surface-card p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B] mb-3">
                Industry Categories
              </h2>
              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
                <Link
                  href="/businesses"
                  className={`block px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                    !searchParams.category
                      ? 'bg-[#15171B] text-white'
                      : 'text-[#696D76] hover:bg-[#F2F3F6] hover:text-[#15171B]'
                  }`}
                >
                  All Categories ({categories.length})
                </Link>
                {categories.map((cat) => {
                  const isSelected = searchParams.category === cat.slug;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/businesses?category=${cat.slug}${
                        searchParams.city ? `&city=${searchParams.city}` : ''
                      }`}
                      className={`block px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#304FFE] text-white'
                          : 'text-[#696D76] hover:bg-[#F2F3F6] hover:text-[#15171B]'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Enquiry Prompt */}
            <div className="rounded-[12px] bg-[#101319] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                Custom Requirement
              </p>
              <h3 className="mt-1.5 text-[16px] font-bold text-white">
                Need quotes from multiple providers?
              </h3>
              <p className="mt-1.5 text-[13px] text-[#9CA1AE] leading-relaxed">
                Post your specification once and receive structured quotations from matching businesses.
              </p>
              <Link
                href={`/enquiries/new${
                  searchParams.category ? `?category=${searchParams.category}` : ''
                }`}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-[9px] bg-[#304FFE] hover:bg-[#243FE0] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors"
              >
                <span>Post an Enquiry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          {/* Right Column: Business Results */}
          <div className="lg:col-span-9">
            {result.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {result.items.map((biz) => {
                  const badgeMeta = VERIFICATION_BADGE_META[biz.verificationLevel];

                  return (
                    <div
                      key={biz.id}
                      className="surface-card-interactive p-6 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Top: Monogram + Verification Badge */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] text-[15px] font-bold text-[#15171B]">
                              {biz.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[12px] font-semibold text-[#304FFE]">
                                  {biz.primaryCategory?.name || 'Business'}
                                </span>
                                <span className="text-[#D1D4DC]">•</span>
                                <span className="text-[12px] text-[#696D76]">
                                  {biz.businessType}
                                </span>
                              </div>
                              <Link
                                href={`/business/${biz.slug}`}
                                className="text-[18px] font-bold text-[#15171B] hover:text-[#304FFE] transition-colors line-clamp-1"
                              >
                                {biz.name}
                              </Link>
                            </div>
                          </div>

                          {badgeMeta.isVerified ? (
                            <span className="badge-verified shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {badgeMeta.shortLabel}
                            </span>
                          ) : (
                            <span className="badge-neutral shrink-0">
                              {badgeMeta.shortLabel}
                            </span>
                          )}
                        </div>

                        {/* Tagline & Summary */}
                        {biz.tagline && (
                          <p className="text-[13px] font-medium text-[#15171B] mb-1.5 line-clamp-1">
                            {biz.tagline}
                          </p>
                        )}
                        <p className="text-[13px] text-[#696D76] line-clamp-2 leading-relaxed">
                          {biz.shortDescription || biz.description}
                        </p>

                        {/* Offerings Preview */}
                        {biz.listings && biz.listings.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-[#E8E9ED]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#696D76] mb-2">
                              Featured Offerings ({biz.listings.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {biz.listings.slice(0, 3).map((item) => (
                                <span
                                  key={item.id}
                                  className="inline-flex items-center rounded-[6px] bg-[#FAFAF8] border border-[#E8E9ED] px-2.5 py-1 text-[12px] font-medium text-[#15171B]"
                                >
                                  {item.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 pt-4 border-t border-[#E8E9ED] flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#696D76]">
                          <MapPin className="h-3.5 w-3.5 text-[#696D76]" />
                          {biz.city}, {biz.state}
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/enquiries/new?businessId=${biz.id}&category=${
                              biz.primaryCategory?.slug || ''
                            }`}
                            className="rounded-[8px] border border-[#E8E9ED] bg-[#FAFAF8] hover:bg-[#F2F3F6] px-3 py-1.5 text-[12px] font-medium text-[#15171B] transition-colors"
                          >
                            Enquire
                          </Link>
                          <Link
                            href={`/business/${biz.slug}`}
                            className="inline-flex items-center gap-1 rounded-[8px] bg-[#15171B] hover:bg-[#304FFE] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors"
                          >
                            <span>View Business</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Polished Empty State */
              <div className="surface-card p-10 sm:p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F2F3F6] text-[#15171B]">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="text-[22px] font-bold text-[#15171B]">
                  No published businesses match this filter yet
                </h2>
                <p className="mt-2 text-[14px] text-[#696D76] max-w-lg mx-auto leading-relaxed">
                  PROVENTA displays only authentic registered businesses. You can post a customer enquiry for this category so businesses can respond with quotations, or register your own business storefront.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/enquiries/new${
                      searchParams.category ? `?category=${searchParams.category}` : ''
                    }`}
                    className="btn-accent"
                  >
                    <span>Post a Customer Enquiry</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/business/register" className="btn-secondary">
                    List Your Business in This Category
                  </Link>
                  {hasFilters && (
                    <Link href="/businesses" className="btn-secondary">
                      Clear Filters
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

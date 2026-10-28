import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import {
  getCategories,
  searchListings,
} from '@/lib/marketplace/repository';
import {
  ListingType,
  PRICE_DISPLAY_LABELS,
} from '@/lib/marketplace/types';
import { BRAND_CONFIG } from '@/lib/brand';

export const dynamic = 'force-dynamic';

interface ListingsPageProps {
  searchParams?: {
    q?: string;
    category?: string;
    city?: string;
    type?: string;
    page?: string;
  };
}

export default function ListingsCatalogPage({
  searchParams = {},
}: ListingsPageProps) {
  const query = searchParams.q?.trim() || '';
  const selectedCategorySlug = searchParams.category?.trim() || '';
  const selectedCity = searchParams.city?.trim() || '';
  const selectedType = (searchParams.type?.toUpperCase() || '') as ListingType | '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const categories = getCategories({ onlyTopLevel: true });
  const activeCategory = categories.find(
    (c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug,
  );

  const listingsResult = searchListings({
    query: query || undefined,
    categorySlug: activeCategory?.slug || selectedCategorySlug || undefined,
    city: selectedCity || undefined,
    listingType:
      selectedType &&
      ['PRODUCT', 'SERVICE', 'PACKAGE', 'CUSTOM_SOLUTION'].includes(selectedType)
        ? selectedType
        : undefined,
    page,
    limit: 24,
  });

  const hasFilters = Boolean(query || selectedCategorySlug || selectedCity || selectedType);

  return (
    <div className="min-h-screen bg-[#F5F0E5] text-[#181914]">
      {/* =====================================================================
          DARK ARCHITECTURAL CATALOG HEADER & WARM IVORY SEARCH BAR
      ===================================================================== */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]">
        <div className="container-wide py-12 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#4C4A40] font-mono text-[11px] uppercase tracking-[0.18em] text-[#A7A194]">
            <div className="flex items-center gap-3">
              <span className="index-code-terracotta">CATALOG</span>
              <span>PRODUCTS, SERVICES &amp; COMMERCIAL PACKAGES</span>
            </div>
            <div>
              <span>
                PUBLISHED OFFERINGS:{' '}
                <strong className="text-[#F6F0E4]">
                  {String(listingsResult.total).padStart(2, '0')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-display text-4xl sm:text-6xl text-[#F6F0E4] leading-[0.95]">
                {activeCategory ? (
                  `${activeCategory.name} — Offerings`
                ) : selectedType === 'PRODUCT' ? (
                  <>
                    Products{' '}
                    <span className="italic text-[#B94E2D]">without limits.</span>
                  </>
                ) : selectedType === 'SERVICE' ? (
                  <>
                    Services{' '}
                    <span className="italic text-[#B94E2D]">without limits.</span>
                  </>
                ) : (
                  <>
                    Products &amp; Services{' '}
                    <span className="italic text-[#B94E2D]">Catalog.</span>
                  </>
                )}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#A7A194] max-w-2xl leading-relaxed">
                Explore structured commercial offerings with transparent pricing, technical
                specifications, turnaround times, and direct quotation requests.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
              <Link href="/enquiries/new" className="btn-ivory">
                <span>Post Enquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-terracotta">
                <span>Browse Businesses</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Warm Ivory Filter Bar */}
          <form
            action="/listings"
            method="GET"
            className="mt-8 grid grid-cols-1 md:grid-cols-12 rounded-[2px] border border-[#E9DFCC] bg-[#F5F0E5] text-[#181914] p-2 divide-y md:divide-y-0 md:divide-x divide-[#D5CBB8]"
          >
            <div className="md:col-span-4 px-3.5 py-2.5">
              <label
                htmlFor="cat-q"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Product or Service Keyword
              </label>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#B94E2D] mr-2 shrink-0" />
                <input
                  id="cat-q"
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search product, service, specification..."
                  className="w-full bg-transparent text-sm text-[#181914] placeholder:text-[#7D786C] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 px-3.5 py-2.5">
              <label
                htmlFor="cat-sector"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Industry
              </label>
              <select
                id="cat-sector"
                name="category"
                defaultValue={selectedCategorySlug}
                className="w-full bg-transparent font-mono text-xs text-[#181914] focus:outline-none"
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
                htmlFor="cat-type"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                Offering Type
              </label>
              <select
                id="cat-type"
                name="type"
                defaultValue={selectedType}
                className="w-full bg-transparent font-mono text-xs text-[#181914] focus:outline-none"
              >
                <option value="">All Offerings</option>
                <option value="PRODUCT">Products</option>
                <option value="SERVICE">Services</option>
                <option value="PACKAGE">Packages</option>
                <option value="CUSTOM_SOLUTION">Custom Solutions</option>
              </select>
            </div>

            <div className="md:col-span-1 px-3.5 py-2.5">
              <label
                htmlFor="cat-city"
                className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5C584F] mb-1"
              >
                City
              </label>
              <select
                id="cat-city"
                name="city"
                defaultValue={selectedCity}
                className="w-full bg-transparent font-mono text-xs text-[#181914] focus:outline-none"
              >
                <option value="">All</option>
                {BRAND_CONFIG.initialCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
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
          CATALOG RESULTS
      ===================================================================== */}
      <section className="py-12 lg:py-16">
        <div className="container-wide">
          {listingsResult.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsResult.items.map((item, idx) => {
                const formattedPrice = item.priceAmount
                  ? `₹${item.priceAmount.toLocaleString('en-IN')}${
                      item.priceUnit ? ` / ${item.priceUnit}` : ''
                    }`
                  : PRICE_DISPLAY_LABELS[item.priceDisplayType];
                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-6 hover:border-[#B94E2D] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E9DFCC] font-mono text-[10px] uppercase tracking-[0.16em]">
                        <span className="text-[#B94E2D] font-medium">
                          {String(idx + 1).padStart(2, '0')} // {item.listingType}
                        </span>
                        <span className="text-[#5C584F]">{item.categoryName}</span>
                      </div>

                      <h2 className="font-display text-2xl text-[#181914]">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-xs text-[#5C584F] leading-relaxed line-clamp-3">
                        {item.shortSummary || item.description}
                      </p>

                      {item.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-[#E9DFCC]">
                          {item.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 bg-[#E9DFCC] text-[#181914]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#D5CBB8]">
                      <div className="flex items-baseline justify-between mb-3 font-mono">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-[#5C584F]">
                          PRICING
                        </span>
                        <span className="text-sm font-semibold text-[#181914]">
                          {formattedPrice}
                        </span>
                      </div>

                      {item.businessName && item.businessSlug && (
                        <div className="mb-4 flex items-center justify-between text-xs border-y border-[#E9DFCC] py-2">
                          <span className="font-mono text-[10px] uppercase text-[#5C584F]">
                            BUSINESS:
                          </span>
                          <Link
                            href={`/business/${item.businessSlug}`}
                            className="font-medium text-[#181914] hover:text-[#B94E2D] underline truncate max-w-[200px]"
                          >
                            {item.businessName}
                            {item.businessCity ? ` (${item.businessCity})` : ''}
                          </Link>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {item.businessSlug ? (
                          <Link
                            href={`/business/${item.businessSlug}`}
                            className="btn-secondary py-2 px-3 text-[10px]"
                          >
                            <span>Storefront</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span />
                        )}
                        <Link
                          href={`/enquiries/new?listingId=${item.id}&businessId=${item.businessId}`}
                          className="btn-terracotta py-2 px-3 text-[10px]"
                        >
                          <span>Request Quote</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2px] border border-[#D5CBB8] bg-[#FBF8F1] p-8 sm:p-12">
              <span className="index-code-terracotta mb-4">CATALOG // 0 MATCHING ITEMS</span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#181914]">
                {hasFilters
                  ? 'No product or service listings match your current filters.'
                  : 'Publish products & services or submit a custom buyer enquiry.'}
              </h2>
              <p className="mt-3 text-sm text-[#5C584F] max-w-2xl leading-relaxed">
                {hasFilters
                  ? 'Reset your filter parameters or post a customer enquiry so matched businesses can send you tailored quotations.'
                  : 'Business owners can add products, services, and packages from their console. Customers can post an enquiry for any requirement immediately.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {hasFilters && (
                  <Link href="/listings" className="btn-secondary">
                    Reset Filters
                  </Link>
                )}
                <Link href="/enquiries/new" className="btn-dark">
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
      </section>
    </div>
  );
}

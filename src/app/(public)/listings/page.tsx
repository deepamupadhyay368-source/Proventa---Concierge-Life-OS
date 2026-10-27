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
    <div className="min-h-screen bg-[#F4F1EA] text-[#0D0E11]">
      {/* =====================================================================
          OFFERINGS CATALOG MASTHEAD & QUERY BAR
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11] bg-[#FAF8F3]">
        <div className="container-wide py-10 lg:py-14">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#CFCAC0] font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
            <div className="flex items-center gap-2">
              <span className="index-code-lime">CATALOG // 02</span>
              <span>PRODUCTS, SERVICES &amp; COMMERCIAL PACKAGES</span>
            </div>
            <div>
              <span>
                INDEXED OFFERINGS:{' '}
                <strong className="text-[#0D0E11]">
                  {String(listingsResult.total).padStart(3, '0')}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] text-[#0D0E11] uppercase leading-[0.94]">
                {activeCategory
                  ? `${activeCategory.name} — CATALOG.`
                  : 'PRODUCTS & SERVICES CATALOG.'}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#52514E] max-w-2xl leading-relaxed">
                Inspect structured commercial offerings with transparent pricing models, technical
                specifications, turnaround timeframes, and direct RFQ dispatch.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-2.5">
              <Link href="/enquiries/new" className="btn-primary">
                <span>POST CUSTOM RFQ</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/businesses" className="btn-secondary">
                <span>ENTITY DIRECTORY</span>
              </Link>
            </div>
          </div>

          {/* Search & Classification Filter Bar */}
          <form
            action="/listings"
            method="GET"
            className="mt-8 grid grid-cols-1 md:grid-cols-12 border-2 border-[#0D0E11] bg-[#F4F1EA]"
          >
            <div className="md:col-span-4 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="cat-q"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                01 // OFFERING KEYWORD OR SKU
              </label>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#52514E] mr-2 shrink-0" />
                <input
                  id="cat-q"
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search product name, service scope, specification..."
                  className="w-full bg-transparent text-sm text-[#0D0E11] placeholder:text-[#78756F] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="cat-sector"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                02 // SECTOR CLASSIFICATION
              </label>
              <select
                id="cat-sector"
                name="category"
                defaultValue={selectedCategorySlug}
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
                htmlFor="cat-type"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                03 // CLASSIFICATION
              </label>
              <select
                id="cat-type"
                name="type"
                defaultValue={selectedType}
                className="w-full bg-transparent font-mono text-xs text-[#0D0E11] focus:outline-none"
              >
                <option value="">ALL TYPES</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="SERVICE">SERVICE</option>
                <option value="PACKAGE">PACKAGE</option>
                <option value="CUSTOM_SOLUTION">CUSTOM SOLUTION</option>
              </select>
            </div>

            <div className="md:col-span-1 p-3.5 border-b md:border-b-0 md:border-r border-[#0D0E11]">
              <label
                htmlFor="cat-city"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514E] mb-1"
              >
                04 // CITY
              </label>
              <select
                id="cat-city"
                name="city"
                defaultValue={selectedCity}
                className="w-full bg-transparent font-mono text-xs text-[#0D0E11] focus:outline-none"
              >
                <option value="">ALL</option>
                {BRAND_CONFIG.initialCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex">
              <button
                type="submit"
                className="w-full bg-[#0D0E11] text-[#F4F1EA] font-mono text-xs font-bold uppercase tracking-[0.14em] px-4 py-3 hover:bg-[#C8F904] hover:text-[#0D0E11] transition-colors flex items-center justify-center gap-2"
              >
                <span>QUERY CATALOG</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================================
          CATALOG SPECIFICATION LEDGER
      ===================================================================== */}
      <section className="py-12 lg:py-16">
        <div className="container-wide">
          {listingsResult.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#0D0E11]">
              {listingsResult.items.map((item, idx) => {
                const formattedPrice = item.priceAmount
                  ? `₹${item.priceAmount.toLocaleString('en-IN')}${
                      item.priceUnit ? ` / ${item.priceUnit}` : ''
                    }`
                  : PRICE_DISPLAY_LABELS[item.priceDisplayType];
                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between border-r border-b border-[#0D0E11] bg-[#FAF8F3] p-6 hover:bg-[#EAE5DA]/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#CFCAC0] font-mono text-[10px] uppercase tracking-[0.12em]">
                        <span className="bg-[#0D0E11] text-[#F4F1EA] px-1.5 py-0.5 font-bold">
                          ITEM // {String(idx + 1).padStart(3, '0')} · {item.listingType}
                        </span>
                        <span className="text-[#52514E]">{item.categoryName}</span>
                      </div>

                      <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#0D0E11]">
                        {item.title}
                      </h2>

                      <p className="mt-2 text-xs text-[#52514E] leading-relaxed line-clamp-3">
                        {item.shortSummary || item.description}
                      </p>

                      {item.tags.length > 0 && (
                        <ul className="mt-4 space-y-1 border-t border-[#CFCAC0] pt-3 font-mono text-[11px] text-[#0D0E11]">
                          {item.tags.slice(0, 3).map((tag: string) => (
                            <li key={tag} className="truncate">
                              + {tag}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#0D0E11]">
                      <div className="flex items-baseline justify-between mb-3 font-mono">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[#52514E]">
                          COMMERCIAL TERMS
                        </span>
                        <span className="text-sm font-bold text-[#0D0E11]">
                          {formattedPrice}
                        </span>
                      </div>

                      {item.businessName && item.businessSlug && (
                        <div className="mb-4 flex items-center justify-between text-xs border-y border-[#CFCAC0] py-2">
                          <span className="font-mono text-[10px] uppercase text-[#52514E]">
                            VENDOR:
                          </span>
                          <Link
                            href={`/business/${item.businessSlug}`}
                            className="font-semibold text-[#0D0E11] underline truncate max-w-[200px]"
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
                            className="inline-flex items-center justify-center gap-1 border border-[#0D0E11] bg-[#FAF8F3] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] hover:bg-[#0D0E11] hover:text-[#F4F1EA]"
                          >
                            <span>STOREFRONT</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span />
                        )}
                        <Link
                          href={`/enquiries/new?listingId=${item.id}&businessId=${item.businessId}`}
                          className="inline-flex items-center justify-center gap-1 border border-[#0D0E11] bg-[#C8F904] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] hover:bg-[#0D0E11] hover:text-[#C8F904]"
                        >
                          <span>REQUEST QUOTE</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-[#0D0E11] bg-[#FAF8F3] p-8 sm:p-12">
              <span className="index-code-lime mb-4">CATALOG STATUS // 0 MATCHING ITEMS</span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-[-0.03em] text-[#0D0E11]">
                {hasFilters
                  ? 'NO CATALOG LISTINGS MATCH YOUR FILTER PARAMETERS.'
                  : 'PUBLISH PRODUCTS & SERVICES OR SUBMIT A CUSTOM BUYER ENQUIRY.'}
              </h2>
              <p className="mt-3 text-sm text-[#52514E] max-w-2xl leading-relaxed">
                {hasFilters
                  ? 'Reset your search filters or post a direct buyer enquiry so verified vendors can respond with custom quotations.'
                  : 'Businesses can publish unlimited structured product and service listings from their vendor console. Buyers can immediately submit an enquiry for any requirement.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {hasFilters && (
                  <Link href="/listings" className="btn-secondary">
                    RESET FILTERS
                  </Link>
                )}
                <Link href="/enquiries/new" className="btn-primary">
                  <span>POST BUYER ENQUIRY</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/business/register" className="btn-accent">
                  <span>REGISTER BUSINESS &amp; PUBLISH CATALOG</span>
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

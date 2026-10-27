import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  Package,
  MapPin,
  PlusCircle,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { getCategories, searchListings } from '@/lib/marketplace/repository';
import {
  PRICE_DISPLAY_LABELS,
  type ListingSearchParams,
  type ListingType,
  type PriceDisplayType,
} from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Products & Services Marketplace Catalog',
  description:
    'Search products, industrial supplies, and professional services with transparent pricing modes across Gujarat and India on PROVENTA.',
};

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    priceMode?: string;
    city?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ListingsCatalogPage({
  searchParams: searchParamsPromise,
}: ListingsPageProps) {
  const searchParams = await searchParamsPromise;
  const categories = getCategories({ onlyTopLevel: true });

  const params: ListingSearchParams = {
    query: searchParams.q,
    categorySlug: searchParams.category,
    listingType: (searchParams.type as ListingType) || undefined,
    priceDisplayType:
      (searchParams.priceMode as PriceDisplayType) || undefined,
    city: searchParams.city,
    sortBy: (searchParams.sort as ListingSearchParams['sortBy']) || 'relevance',
    page: Number(searchParams.page || 1),
    limit: 12,
  };

  const results = searchListings(params);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B] pb-20">
      <section className="border-b border-[#E8E9ED] bg-[#FFFFFF] py-10">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                Catalog &amp; Offerings
              </span>
              <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.03em] text-[#15171B] mt-1">
                Products &amp; Services Catalog
              </h1>
              <p className="text-[15px] text-[#696D76] mt-1.5 max-w-2xl">
                Compare products, service packages, and B2B capabilities with fixed prices, indicative ranges, or custom quote options.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/businesses" className="btn-secondary">
                Browse Storefronts
              </Link>
              <Link href="/enquiries/new" className="btn-primary">
                <PlusCircle className="w-4 h-4" />
                <span>Post Custom Requirement</span>
              </Link>
            </div>
          </div>

          <form
            action="/listings"
            method="GET"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 bg-[#FAFAF8] border border-[#E8E9ED] p-3 rounded-[12px]"
          >
            <div className="lg:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-[#696D76] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ''}
                placeholder="Search products, equipment, or services…"
                className="input-enterprise pl-10"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                name="category"
                defaultValue={searchParams.category || ''}
                aria-label="Category"
                className="input-enterprise"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                name="type"
                defaultValue={searchParams.type || ''}
                aria-label="Listing Type"
                className="input-enterprise"
              >
                <option value="">Products &amp; Services</option>
                <option value="PRODUCT">Products Only</option>
                <option value="SERVICE">Services Only</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                name="city"
                defaultValue={searchParams.city || ''}
                aria-label="City"
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

            <div className="lg:col-span-1">
              <button
                type="submit"
                className="w-full h-full min-h-[42px] bg-[#304FFE] hover:bg-[#243FE0] text-white text-[14px] font-semibold rounded-[10px] transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container-wide pt-8">
        {results.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.items.map((item) => (
              <div
                key={item.id}
                className="surface-card-interactive p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="badge-neutral">{item.listingType}</span>
                    <span className="text-[12px] font-medium text-[#696D76]">
                      {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </span>
                  </div>

                  <h2 className="text-[18px] font-bold text-[#15171B]">
                    {item.title}
                  </h2>

                  <p className="text-[13px] text-[#696D76] mt-2 line-clamp-3 leading-relaxed">
                    {item.shortSummary || item.description}
                  </p>

                  {item.priceAmount ? (
                    <div className="mt-4 text-[16px] font-bold text-[#15171B]">
                      ₹{item.priceAmount.toLocaleString('en-IN')}
                      {item.priceMaxAmount
                        ? ` – ₹${item.priceMaxAmount.toLocaleString('en-IN')}`
                        : ''}
                      {item.priceUnit ? (
                        <span className="text-[12px] font-normal text-[#696D76]">
                          {' '}
                          / {item.priceUnit}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 text-[13px] font-semibold text-[#304FFE]">
                      {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8E9ED] flex items-center justify-between gap-2">
                  <div className="text-[12px] text-[#696D76] truncate">
                    {item.businessSlug ? (
                      <Link
                        href={`/business/${item.businessSlug}`}
                        className="font-semibold text-[#15171B] hover:text-[#304FFE] transition-colors"
                      >
                        {item.businessName}
                      </Link>
                    ) : (
                      <span>{item.businessName}</span>
                    )}
                    {item.businessCity && (
                      <span className="block text-[11px] text-[#696D76] inline-flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {item.businessCity}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/enquiries/new?businessId=${item.businessId}&listingId=${item.id}&category=${
                      item.categorySlug || ''
                    }`}
                    className="inline-flex items-center gap-1 rounded-[8px] bg-[#15171B] hover:bg-[#304FFE] px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors shrink-0"
                  >
                    <span>{item.ctaLabel || 'Send Enquiry'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 sm:p-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-[10px] bg-[#F2F3F6] flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-[#15171B]" />
            </div>
            <h2 className="text-[22px] font-bold text-[#15171B]">
              No published product or service listings match yet
            </h2>
            <p className="text-[14px] text-[#696D76] mt-2 leading-relaxed">
              Post a customer enquiry describing the product or service you need so businesses can send you custom quotes, or register your business to list your offerings.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/enquiries/new" className="btn-accent">
                <PlusCircle className="w-4 h-4" />
                <span>Post an Enquiry</span>
              </Link>
              <Link href="/business/register" className="btn-secondary">
                <Building2 className="w-4 h-4" />
                <span>Add Your Products &amp; Services</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

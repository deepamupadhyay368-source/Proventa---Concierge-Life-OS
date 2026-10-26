import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  Package,
  MapPin,
  PlusCircle,
  Building2,
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
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      <section className="border-b border-border bg-card py-10">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Catalog &amp; Offerings
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
                Products &amp; Services
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Compare products and services with fixed prices, indicative ranges,
                or custom quote options directly from published businesses.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/enquiries/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Post Custom Requirement
              </Link>
            </div>
          </div>

          <form
            action="/listings"
            method="GET"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-background border border-border p-3 rounded-xl"
          >
            <div className="lg:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ''}
                placeholder="Search products, equipment, or services…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                name="category"
                defaultValue={searchParams.category || ''}
                aria-label="Category"
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
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
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
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
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
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
                className="w-full h-full min-h-[38px] bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Find
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="container-wide pt-8">
        {results.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-foreground/40 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary text-foreground">
                      {item.listingType}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-foreground">
                    {item.title}
                  </h2>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                    {item.shortSummary || item.description}
                  </p>

                  {item.priceAmount ? (
                    <div className="mt-4 text-base font-bold text-foreground">
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
                    <div className="mt-4 text-xs font-semibold text-primary">
                      {PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground truncate">
                    {item.businessSlug ? (
                      <Link
                        href={`/business/${item.businessSlug}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {item.businessName}
                      </Link>
                    ) : (
                      <span>{item.businessName}</span>
                    )}
                    {item.businessCity && (
                      <span className="block text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {item.businessCity}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/enquiries/new?businessId=${item.businessId}&listingId=${item.id}&category=${
                      item.categorySlug || ''
                    }`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors shrink-0"
                  >
                    {item.ctaLabel || 'Send Enquiry'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              No Published Product or Service Listings Match Yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Post a customer enquiry describing the product or service you need so
              businesses can send you custom quotes, or register your business to
              list your offerings.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/enquiries/new"
                className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-5 py-2.5 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                Post an Enquiry
              </Link>
              <Link
                href="/business/register"
                className="inline-flex items-center gap-2 border border-border bg-background text-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-secondary"
              >
                <Building2 className="w-4 h-4" />
                Add Your Products &amp; Services
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

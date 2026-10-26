import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  MapPin,
  Building2,
  PlusCircle,
  Filter,
  ArrowRight,
  Star,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import {
  getCategories,
  getCategoryBySlugOrId,
  searchBusinesses,
} from '@/lib/marketplace/repository';
import {
  VERIFICATION_BADGE_META,
  type BusinessType,
  type DirectorySearchParams,
} from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Businesses — Universal Business Directory',
  description:
    'Search and discover verified product, service, and hybrid businesses across Gujarat and India on PROVENTA.',
};

interface BusinessesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    city?: string;
    type?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BusinessesDirectoryPage({
  searchParams: searchParamsPromise,
}: BusinessesPageProps) {
  const searchParams = await searchParamsPromise;
  const categories = getCategories({ onlyTopLevel: true });
  const activeCategory = searchParams.category
    ? getCategoryBySlugOrId(searchParams.category)
    : null;

  const queryParams: DirectorySearchParams = {
    query: searchParams.q,
    categorySlug: searchParams.category,
    subcategorySlug: searchParams.subcategory,
    city: searchParams.city,
    businessType: (searchParams.type as BusinessType) || undefined,
    sortBy:
      (searchParams.sort as DirectorySearchParams['sortBy']) || 'relevance',
    page: Number(searchParams.page || 1),
    limit: 12,
  };

  const results = searchBusinesses(queryParams);

  return (
    <div className="pt-20 md:pt-24 pb-20 min-h-screen bg-background">
      {/* Header & Search Bar */}
      <section className="border-b border-border bg-card py-10">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Universal Business Directory
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
                {activeCategory
                  ? `${activeCategory.name} Businesses`
                  : 'Explore Businesses'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {activeCategory?.description ||
                  'Discover product manufacturers, service providers, agencies, retailers, and suppliers across Gujarat and India.'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/enquiries/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Post an Enquiry
              </Link>
              <Link
                href="/business/register"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                List Your Business
              </Link>
            </div>
          </div>

          {/* Search & Filter Form */}
          <form
            action="/businesses"
            method="GET"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-background border border-border p-3 rounded-xl"
          >
            <div className="lg:col-span-4 relative flex items-center">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q || ''}
                placeholder="Search business name, product, service, keyword…"
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

            <div className="lg:col-span-2">
              <select
                name="sort"
                defaultValue={searchParams.sort || 'relevance'}
                aria-label="Sort results"
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="newest">Sort: Newest</option>
                <option value="popular">Sort: Most Viewed</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <button
                type="submit"
                className="w-full h-full min-h-[38px] bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-wide pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Categories
                </h2>
                {searchParams.category && (
                  <Link
                    href="/businesses"
                    className="text-xs text-primary hover:underline"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <ul className="space-y-1 max-h-96 overflow-y-auto pr-1">
                <li>
                  <Link
                    href="/businesses"
                    className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      !searchParams.category
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/businesses?category=${cat.slug}${
                        searchParams.city ? `&city=${encodeURIComponent(searchParams.city)}` : ''
                      }`}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        searchParams.category === cat.slug
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-display text-base font-bold text-foreground">
                Need Custom Quotes?
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Post your requirement once and receive structured quotations from
                matched businesses in your category and city.
              </p>
              <Link
                href="/enquiries/new"
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-95 transition-opacity"
              >
                Post an Enquiry
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Directory Results */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{results.items.length}</strong> of{' '}
                <strong className="text-foreground">{results.total}</strong> published
                businesses
              </span>
              {(searchParams.q || searchParams.category || searchParams.city) && (
                <Link
                  href="/businesses"
                  className="text-foreground font-medium hover:underline"
                >
                  Clear all filters
                </Link>
              )}
            </div>

            {results.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.items.map((biz) => {
                  const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                  return (
                    <div
                      key={biz.id}
                      className="bg-card border border-border rounded-xl p-6 hover:border-foreground/40 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-foreground">
                            {biz.primaryCategory?.name || biz.businessType}
                          </span>
                          <span
                            title={badge.description}
                            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                              badge.isVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-secondary text-muted-foreground border-border'
                            }`}
                          >
                            {badge.shortLabel}
                          </span>
                        </div>

                        <Link
                          href={`/business/${biz.slug}`}
                          className="group block"
                        >
                          <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {biz.name}
                          </h2>
                        </Link>

                        {biz.tagline && (
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">
                            {biz.tagline}
                          </p>
                        )}

                        <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2">
                          {biz.shortDescription || biz.description}
                        </p>

                        {biz.tags && biz.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {biz.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] px-2 py-0.5 rounded bg-secondary/70 text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {biz.city}, {biz.state}
                          </span>
                          {biz.averageRating && (
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              {biz.averageRating} ({biz.reviewCount})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/enquiries/new?businessId=${biz.id}&category=${biz.primaryCategory?.slug || ''}`}
                            className="text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                          >
                            Send Enquiry
                          </Link>
                          <Link
                            href={`/business/${biz.slug}`}
                            className="text-xs font-medium px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                          >
                            Storefront
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  No Published Businesses Match Your Filter Yet
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                  Can&apos;t find the exact business you are looking for? Post a
                  customer enquiry so newly onboarded businesses in this category can
                  respond, or register your own business storefront.
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
                    Register Your Business
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

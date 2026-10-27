import Link from 'next/link';
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  FileText,
  Store,
  Briefcase,
  Globe,
  SlidersHorizontal,
  MessageSquareQuote,
  BadgeCheck,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { getCategories, searchBusinesses, searchListings } from '@/lib/marketplace/repository';
import { VERIFICATION_BADGE_META, PRICE_DISPLAY_LABELS } from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = getCategories({ onlyTopLevel: true });
  const featuredResult = searchBusinesses({ limit: 6, sortBy: 'popular' });
  const listingsResult = searchListings({ limit: 4 });

  const featuredBusinesses = featuredResult.items;
  const recentListings = listingsResult.items;
  const quickCategories = categories.slice(0, 6);

  return (
    <div className="bg-[#FAFAF8] text-[#15171B]">
      {/* =====================================================================
          1. HERO SECTION — Universal Discovery & Marketplace Preview
      ===================================================================== */}
      <section className="relative overflow-hidden border-b border-[#E8E9ED] pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle structural grid accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#E8E9ED_1px,transparent_1px),linear-gradient(to_bottom,#E8E9ED_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_40%,transparent_100%)] opacity-45"
        />

        <div className="container-wide relative">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8E9ED] bg-[#FFFFFF] px-3.5 py-1.5 shadow-card">
              <span className="h-2 w-2 rounded-full bg-[#304FFE]" />
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#15171B]">
                PROVENTA Universal Business Platform
              </span>
              <span className="hidden sm:inline text-[#E8E9ED]">|</span>
              <span className="hidden sm:inline text-[12px] font-medium text-[#696D76]">
                Storefronts • Discovery • Quotations
              </span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-[40px] sm:text-[54px] lg:text-[64px] font-bold tracking-[-0.035em] text-[#15171B] leading-[1.06]">
              Every Business. One Place.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 text-[17px] sm:text-[19px] text-[#696D76] leading-[1.6] max-w-2xl mx-auto font-normal">
              Discover businesses, explore products and services, and connect with the right providers—all in one place.
            </p>
          </div>

          {/* Universal Search Bar */}
          <div className="mt-9 mx-auto max-w-4xl">
            <form
              action="/businesses"
              method="GET"
              className="rounded-[14px] border border-[#E8E9ED] bg-[#FFFFFF] p-2 shadow-elevated"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                {/* Search Query Input */}
                <div className="md:col-span-5 flex items-center gap-3 rounded-[10px] bg-[#FAFAF8] px-3.5 py-3 border border-transparent focus-within:border-[#304FFE] focus-within:bg-[#FFFFFF] transition-colors">
                  <Search className="h-4 w-4 text-[#696D76] shrink-0" />
                  <input
                    type="text"
                    name="q"
                    aria-label="Search businesses, products, or services"
                    placeholder="Search businesses, products, or services..."
                    className="w-full bg-transparent text-[14px] text-[#15171B] placeholder:text-[#696D76] focus:outline-none"
                  />
                </div>

                {/* Category Selector */}
                <div className="md:col-span-3 flex items-center gap-2.5 rounded-[10px] bg-[#FAFAF8] px-3.5 py-3 border border-transparent focus-within:border-[#304FFE] focus-within:bg-[#FFFFFF] transition-colors">
                  <Building2 className="h-4 w-4 text-[#696D76] shrink-0" />
                  <select
                    name="category"
                    aria-label="Filter by category"
                    defaultValue=""
                    className="w-full bg-transparent text-[14px] text-[#15171B] focus:outline-none truncate"
                  >
                    <option value="">All Categories ({categories.length})</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City / Location Selector */}
                <div className="md:col-span-2 flex items-center gap-2.5 rounded-[10px] bg-[#FAFAF8] px-3.5 py-3 border border-transparent focus-within:border-[#304FFE] focus-within:bg-[#FFFFFF] transition-colors">
                  <MapPin className="h-4 w-4 text-[#696D76] shrink-0" />
                  <select
                    name="city"
                    aria-label="Filter by city or location"
                    defaultValue=""
                    className="w-full bg-transparent text-[14px] text-[#15171B] focus:outline-none truncate"
                  >
                    <option value="">All Cities</option>
                    {BRAND_CONFIG.initialCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Action */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#304FFE] hover:bg-[#243FE0] text-white font-semibold text-[14px] px-4 transition-colors shadow-card"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Popular Category Shortcuts */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[12px] font-medium text-[#696D76] mr-1">
                Popular sectors:
              </span>
              {quickCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/businesses?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E8E9ED] bg-[#FFFFFF] px-3 py-1 text-[12px] font-medium text-[#15171B] hover:border-[#304FFE]/40 hover:text-[#304FFE] transition-colors"
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
              <Link
                href="#categories"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-semibold text-[#304FFE] hover:underline"
              >
                <span>View all {categories.length} categories</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Refined Marketplace Architecture Preview */}
          <div className="mt-14 mx-auto max-w-6xl">
            <div className="rounded-[14px] border border-[#E8E9ED] bg-[#FFFFFF] p-5 sm:p-7 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E8E9ED]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EEF1FF] text-[#304FFE]">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#15171B]">
                      Unified Commerce &amp; Discovery Architecture
                    </h2>
                    <p className="text-[12px] text-[#696D76]">
                      Structured business profiles, searchable catalogs, and direct quotation workflows
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-neutral">
                    {categories.length} Industry Sectors Configured
                  </span>
                  <span className="badge-verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Authentic Verification Badges
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Preview Pillar 1 */}
                <div className="rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                        01 • Digital Storefronts
                      </span>
                      <Store className="h-4 w-4 text-[#696D76]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#15171B]">
                      Verified Business Profiles
                    </h3>
                    <p className="mt-1.5 text-[13px] text-[#696D76] leading-relaxed">
                      Every business receives a dedicated SEO-indexed storefront displaying legal identity, service coverage, operating hours, and transparent verification status.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-[#E8E9ED] flex items-center justify-between text-[12px]">
                    <span className="text-[#696D76]">B2C, B2B &amp; Hybrid support</span>
                    <Link
                      href="/businesses"
                      className="font-semibold text-[#15171B] hover:text-[#304FFE] inline-flex items-center gap-1"
                    >
                      Browse Directory <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Preview Pillar 2 */}
                <div className="rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                        02 • Structured Catalogs
                      </span>
                      <SlidersHorizontal className="h-4 w-4 text-[#696D76]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#15171B]">
                      Products, Services &amp; Packages
                    </h3>
                    <p className="mt-1.5 text-[13px] text-[#696D76] leading-relaxed">
                      Search across fixed-price items, custom B2B manufacturing capabilities, professional retainers, and local service packages with structured specifications.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-[#E8E9ED] flex items-center justify-between text-[12px]">
                    <span className="text-[#696D76]">Transparent pricing models</span>
                    <Link
                      href="/listings"
                      className="font-semibold text-[#15171B] hover:text-[#304FFE] inline-flex items-center gap-1"
                    >
                      Explore Catalog <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Preview Pillar 3 */}
                <div className="rounded-[10px] border border-[#E8E9ED] bg-[#FAFAF8] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#304FFE]">
                        03 • Enquiry &amp; RFQ Engine
                      </span>
                      <MessageSquareQuote className="h-4 w-4 text-[#696D76]" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#15171B]">
                      Direct Buyer-to-Business Quotes
                    </h3>
                    <p className="mt-1.5 text-[13px] text-[#696D76] leading-relaxed">
                      Message a specific business directly or broadcast an open category requirement to receive structured quotations with pricing, timelines, and terms.
                    </p>
                  </div>
                  <div className="mt-5 pt-3.5 border-t border-[#E8E9ED] flex items-center justify-between text-[12px]">
                    <span className="text-[#696D76]">Zero commission markups</span>
                    <Link
                      href="/enquiries/new"
                      className="font-semibold text-[#304FFE] hover:underline inline-flex items-center gap-1"
                    >
                      Post an Enquiry <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. POPULAR BUSINESS CATEGORIES — All 18 Real Sectors
      ===================================================================== */}
      <section id="categories" className="py-16 lg:py-24 border-b border-[#E8E9ED]">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE] mb-2">
                Universal Industry Taxonomy
              </p>
              <h2 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.025em] text-[#15171B]">
                Explore by Business Category
              </h2>
              <p className="mt-2 text-[15px] text-[#696D76] max-w-2xl">
                Built for every legitimate enterprise—from local retail, healthcare, and hospitality to industrial manufacturing and B2B supply chains.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/businesses" className="btn-secondary">
                <span>View Full Directory</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/businesses?category=${cat.slug}`}
                className="group surface-card-interactive p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#F2F3F6] text-[13px] font-bold text-[#15171B] group-hover:bg-[#304FFE] group-hover:text-white transition-colors">
                      {cat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#696D76] group-hover:text-[#304FFE] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-[#15171B] group-hover:text-[#304FFE] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[#696D76] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-[#E8E9ED] flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-block rounded-[6px] bg-[#FAFAF8] border border-[#E8E9ED] px-2 py-0.5 text-[11px] font-medium text-[#696D76]"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <span className="inline-block px-1.5 py-0.5 text-[11px] font-medium text-[#696D76]">
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

      {/* =====================================================================
          3. FEATURED / VERIFIED BUSINESSES (Real Database State — Zero Fabrication)
      ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8E9ED]">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE] mb-2">
                Live Marketplace Directory
              </p>
              <h2 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.025em] text-[#15171B]">
                Published Business Storefronts
              </h2>
              <p className="mt-2 text-[15px] text-[#696D76] max-w-2xl">
                PROVENTA displays only authentic, registered businesses and clearly distinguishes verified businesses from self-reported profiles.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/businesses" className="btn-secondary">
                Browse Directory
              </Link>
              <Link href="/business/register" className="btn-primary">
                <span>List Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {featuredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredBusinesses.map((biz) => {
                const badgeMeta = VERIFICATION_BADGE_META[biz.verificationLevel];

                return (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="group rounded-[12px] border border-[#E8E9ED] bg-[#FAFAF8] p-6 hover:bg-[#FFFFFF] hover:border-[#D1D4DC] hover:shadow-card-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#E8E9ED] bg-[#FFFFFF] text-[15px] font-bold text-[#15171B]">
                          {biz.name.slice(0, 2).toUpperCase()}
                        </div>
                        {badgeMeta.isVerified ? (
                          <span className="badge-verified">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {badgeMeta.shortLabel}
                          </span>
                        ) : (
                          <span className="badge-neutral">{badgeMeta.shortLabel}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[12px] font-medium text-[#696D76]">
                        <span>{biz.primaryCategory?.name || 'Business'}</span>
                        <span>•</span>
                        <span>{biz.businessType}</span>
                      </div>

                      <h3 className="mt-1.5 text-[18px] font-bold text-[#15171B] group-hover:text-[#304FFE] transition-colors">
                        {biz.name}
                      </h3>

                      {biz.tagline && (
                        <p className="mt-1 text-[13px] font-medium text-[#15171B]/80 line-clamp-1">
                          {biz.tagline}
                        </p>
                      )}

                      <p className="mt-2 text-[13px] text-[#696D76] line-clamp-2 leading-relaxed">
                        {biz.shortDescription || biz.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E8E9ED] flex items-center justify-between text-[12px]">
                      <span className="inline-flex items-center gap-1.5 text-[#696D76]">
                        <MapPin className="h-3.5 w-3.5" />
                        {biz.city}, {biz.state}
                      </span>
                      <span className="font-semibold text-[#15171B] group-hover:text-[#304FFE] inline-flex items-center gap-1">
                        View Storefront <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Honest, high-craft Empty / Onboarding State when 0 businesses are published */
            <div className="rounded-[14px] border border-[#E8E9ED] bg-[#FAFAF8] p-8 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#EEF1FF] border border-[#304FFE]/20 px-3 py-1 text-[12px] font-semibold text-[#304FFE]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Founding Business Onboarding Open</span>
                  </div>
                  <h3 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-[#15171B]">
                    Be among the first verified businesses on PROVENTA
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-[#696D76] leading-relaxed">
                    We do not populate our directory with scraped or fabricated listings. Every storefront on PROVENTA is created by an authentic business owner or verified by our marketplace operations team.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link href="/business/register" className="btn-accent">
                      <span>Create Your Business Profile</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/enquiries/new" className="btn-secondary">
                      Post a Buyer Requirement
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-[12px] border border-[#E8E9ED] bg-[#FFFFFF] p-5 shadow-card space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#E8E9ED] pb-3">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#15171B]">
                        What Your Storefront Includes
                      </span>
                      <span className="badge-verified">Free Onboarding</span>
                    </div>
                    <ul className="space-y-2.5 text-[13px] text-[#696D76]">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0 mt-0.5" />
                        <span>Dedicated public URL (<code className="text-[12px] text-[#15171B]">/business/your-name</code>)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0 mt-0.5" />
                        <span>Unlimited product, service, and package catalog listings</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0 mt-0.5" />
                        <span>Direct customer enquiries &amp; category RFQ lead routing</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0 mt-0.5" />
                        <span>Structured quotation builder &amp; GST/identity verification badge</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Product & Service Offerings (if any published) */}
          {recentListings.length > 0 && (
            <div className="mt-14 pt-12 border-t border-[#E8E9ED]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-[#15171B]">
                  Recent Products &amp; Services
                </h3>
                <Link
                  href="/listings"
                  className="text-[13px] font-semibold text-[#304FFE] hover:underline inline-flex items-center gap-1"
                >
                  View All Offerings <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentListings.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      item.businessSlug
                        ? `/business/${item.businessSlug}`
                        : '/listings'
                    }
                    className="surface-card-interactive p-5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="badge-neutral">{item.listingType}</span>
                      <h4 className="mt-3 text-[15px] font-semibold text-[#15171B]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-[13px] text-[#696D76] line-clamp-2">
                        {item.shortSummary || item.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8E9ED] flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#15171B]">
                        {item.priceAmount
                          ? `₹${item.priceAmount.toLocaleString('en-IN')}`
                          : PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                      </span>
                      <span className="text-[#696D76] truncate max-w-[120px]">
                        {item.businessName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          4. HOW PROVENTA WORKS — Structured 3-Step Workflow
      ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#FAFAF8] border-b border-[#E8E9ED]">
        <div className="container-wide">
          <div className="max-w-3xl mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#304FFE] mb-2">
              Platform Workflow
            </p>
            <h2 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.025em] text-[#15171B]">
              How PROVENTA Works
            </h2>
            <p className="mt-2 text-[15px] text-[#696D76]">
              Designed for clarity, speed, and trust—whether you are sourcing a provider or scaling your business visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="surface-card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#15171B] text-[13px] font-bold text-white">
                  01
                </span>
                <span className="text-[12px] font-semibold text-[#696D76]">
                  Discovery &amp; Storefronts
                </span>
              </div>
              <h3 className="text-[18px] font-bold text-[#15171B]">
                Search or List Structured Profiles
              </h3>
              <p className="mt-2 text-[14px] text-[#696D76] leading-relaxed">
                Businesses publish rich storefronts with verified details and product/service catalogs. Customers search by keyword, industry category, city, and business model.
              </p>
            </div>

            <div className="surface-card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#15171B] text-[13px] font-bold text-white">
                  02
                </span>
                <span className="text-[12px] font-semibold text-[#696D76]">
                  Enquiries &amp; RFQs
                </span>
              </div>
              <h3 className="text-[18px] font-bold text-[#15171B]">
                Send Direct or Open Enquiries
              </h3>
              <p className="mt-2 text-[14px] text-[#696D76] leading-relaxed">
                Customers can contact a chosen business directly from its storefront or post an open category requirement (with budget, quantity, and location) for matching providers.
              </p>
            </div>

            <div className="surface-card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#304FFE] text-[13px] font-bold text-white">
                  03
                </span>
                <span className="text-[12px] font-semibold text-[#304FFE]">
                  Quotations &amp; Fulfilment
                </span>
              </div>
              <h3 className="text-[18px] font-bold text-[#15171B]">
                Compare Quotes &amp; Connect Directly
              </h3>
              <p className="mt-2 text-[14px] text-[#696D76] leading-relaxed">
                Businesses respond with structured quotations detailing price, validity, and delivery timeline. Customers compare responses side by side and finalize directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. BENEFITS FOR CUSTOMERS & BUSINESS OWNERS
      ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#FFFFFF] border-b border-[#E8E9ED]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Customers & Procurement Teams */}
            <div className="rounded-[14px] border border-[#E8E9ED] bg-[#FAFAF8] p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md bg-[#FFFFFF] border border-[#E8E9ED] px-3 py-1 text-[12px] font-semibold text-[#15171B] mb-5">
                  <Globe className="h-3.5 w-3.5 text-[#304FFE]" />
                  <span>For Customers &amp; Buyers</span>
                </div>
                <h3 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#15171B]">
                  Find the right provider without endless phone calls
                </h3>
                <p className="mt-2.5 text-[14px] sm:text-[15px] text-[#696D76] leading-relaxed">
                  Whether you are an individual consumer looking for a local specialist or a procurement manager sourcing B2B suppliers, PROVENTA brings structure to discovery.
                </p>

                <ul className="mt-6 space-y-3.5">
                  {[
                    'Search across 18+ structured consumer, commercial, and industrial categories.',
                    'Inspect clear verification badges so you know whether a profile is verified or self-reported.',
                    'Post a single requirement and receive structured quotes from relevant businesses.',
                    'Keep your personal contact details private until you choose to share them.',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[14px] text-[#15171B]">
                      <CheckCircle2 className="h-4 w-4 text-[#16845B] shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E9ED] flex flex-wrap items-center gap-3">
                <Link href="/businesses" className="btn-primary">
                  <span>Explore Businesses</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/enquiries/new" className="btn-secondary">
                  Post an Enquiry
                </Link>
              </div>
            </div>

            {/* For Business Owners & Enterprises */}
            <div className="rounded-[14px] border border-[#E8E9ED] bg-[#FAFAF8] p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md bg-[#EEF1FF] border border-[#304FFE]/20 px-3 py-1 text-[12px] font-semibold text-[#304FFE] mb-5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>For Business Owners &amp; Vendors</span>
                </div>
                <h3 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#15171B]">
                  Build your digital storefront and capture high-intent leads
                </h3>
                <p className="mt-2.5 text-[14px] sm:text-[15px] text-[#696D76] leading-relaxed">
                  Establish a professional digital presence in minutes, showcase your complete catalog, and respond to genuine buyer enquiries from your dashboard.
                </p>

                <ul className="mt-6 space-y-3.5">
                  {[
                    'Launch a modern storefront with your brand story, service areas, and business hours.',
                    'Publish products, services, or custom packages with flexible pricing models.',
                    'Receive direct enquiries and category-matched buyer RFQs in real time.',
                    'Submit formal quotations and apply for official PROVENTA verification.',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[14px] text-[#15171B]">
                      <BadgeCheck className="h-4 w-4 text-[#304FFE] shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E9ED] flex flex-wrap items-center gap-3">
                <Link href="/business/register" className="btn-accent">
                  <span>List Your Business</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/for-businesses" className="btn-secondary">
                  Learn More for Businesses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. STRONG BUSINESS REGISTRATION CTA SECTION (#101319 Dark Section)
      ===================================================================== */}
      <section className="bg-[#101319] text-white py-16 lg:py-24">
        <div className="container-wide">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#252A36] bg-[#181C24] px-3.5 py-1 text-[12px] font-medium text-[#9CA1AE] mb-6">
              <FileText className="h-3.5 w-3.5 text-[#304FFE]" />
              <span>PROVENTA — Every Business. One Place.</span>
            </div>
            <h2 className="text-[30px] sm:text-[42px] font-bold tracking-[-0.03em] text-white leading-[1.12]">
              Ready to grow your business on PROVENTA?
            </h2>
            <p className="mt-4 text-[16px] sm:text-[18px] text-[#9CA1AE] max-w-2xl mx-auto leading-relaxed">
              Create your digital storefront, list your products and services, and start receiving structured customer enquiries across Gujarat and India.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/business/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#304FFE] hover:bg-[#243FE0] px-6 py-3.5 text-[14px] font-semibold text-white transition-colors"
              >
                <span>Register Your Business</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/enquiries/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#252A36] bg-[#181C24] hover:bg-[#252A36] px-6 py-3.5 text-[14px] font-semibold text-white transition-colors"
              >
                <span>Post a Customer Enquiry</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

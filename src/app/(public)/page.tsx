import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin, Search, ShieldCheck } from 'lucide-react';
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

function formatSectorCode(index: number, slug: string): string {
  const num = String(index + 1).padStart(2, '0');
  const code = slug.replace(/[^a-z]/gi, '').slice(0, 4).toUpperCase();
  return `CAT/${num}—${code}`;
}

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

  const totalPublishedBusinesses = recentBusinessesResult.total;
  const totalPublishedListings = recentListingsResult.total;
  const quickSectors = categories.slice(0, 8);

  return (
    <div className="bg-[#F4F1EA] text-[#0D0E11]">
      {/* =====================================================================
          SECTION 01 // ASYMMETRIC EDITORIAL OPENING & INDEX QUERY TERMINAL
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11]">
        <div className="container-wide">
          {/* Sub-Masthead Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#CFCAC0] py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-[#0D0E11]" />
              <span>FOLIO 01 // THE BUSINESS INDEX</span>
            </div>
            <div className="md:col-span-5 hidden md:block">
              <span>CLASSIFICATION: PRODUCTS · SERVICES · HYBRID ENTERPRISES</span>
            </div>
            <div className="md:col-span-3 md:text-right text-[#0D0E11] font-semibold">
              <span>SECTORS INDEXED: {String(categories.length).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Main Asymmetric Editorial Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#0D0E11]">
            {/* Left Column (8 Cols): Oversized Display Typography & Editorial Lead */}
            <div className="lg:col-span-8 py-10 sm:py-14 lg:py-20 lg:pr-12 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="index-code-lime">INDEX EDITION // 01</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                    UNIVERSAL COMMERCE &amp; QUOTATION REGISTRY
                  </span>
                </div>

                <h1 className="font-display text-[3.25rem] sm:text-[5rem] lg:text-[6.25rem] xl:text-[7rem] font-bold tracking-[-0.045em] leading-[0.9] text-[#0D0E11] uppercase">
                  EVERY BUSINESS.
                  <br />
                  <span className="inline-block bg-[#0D0E11] text-[#F4F1EA] px-3 py-1 mt-1.5">
                    ONE PLACE<span className="text-[#C8F904]">.</span>
                  </span>
                </h1>
              </div>

              <div className="mt-10 lg:mt-14 grid grid-cols-1 sm:grid-cols-12 gap-6 pt-8 border-t border-[#CFCAC0] items-end">
                <div className="sm:col-span-7">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#52514E] mb-2">
                    ABSTRACT // 01.A
                  </p>
                  <p className="text-base sm:text-lg leading-relaxed text-[#0D0E11] font-normal">
                    PROVENTA is a structured commercial index where verified businesses publish
                    products and services, buyers inspect capabilities across{' '}
                    <span className="font-semibold underline decoration-[#0D0E11] underline-offset-4">
                      {categories.length} industry sectors
                    </span>
                    , and structured enquiries convert directly into formal quotations.
                  </p>
                </div>
                <div className="sm:col-span-5 flex flex-col gap-2.5">
                  <Link href="/business/register" className="btn-accent w-full justify-between">
                    <span>PUBLISH STOREFRONT</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/enquiries/new" className="btn-secondary w-full justify-between">
                    <span>POST BUYER ENQUIRY</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column (4 Cols): Custom Geometric Connection Schematic & Live Registry Ledger */}
            <div className="lg:col-span-4 py-10 lg:py-14 lg:pl-10 flex flex-col justify-between bg-[#FAF8F3]/60">
              <div>
                <div className="flex items-center justify-between border-b border-[#0D0E11] pb-3 mb-6">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                    FIG 01 // CONNECTION TOPOLOGY
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#52514E]">
                    SYS-DIRECT
                  </span>
                </div>

                {/* Custom Geometric SVG Graphic — Business Connection Protocol */}
                <div className="border border-[#0D0E11] bg-[#FAF8F3] p-5">
                  <svg
                    viewBox="0 0 360 220"
                    className="w-full h-auto"
                    role="img"
                    aria-label="Diagram showing how Business Storefronts, Catalog Listings, and Buyer Enquiries connect to produce Quotations"
                  >
                    <line x1="0" y1="40" x2="360" y2="40" stroke="#EAE5DA" strokeWidth="1" />
                    <line x1="0" y1="110" x2="360" y2="110" stroke="#EAE5DA" strokeWidth="1" />
                    <line x1="0" y1="180" x2="360" y2="180" stroke="#EAE5DA" strokeWidth="1" />
                    <line x1="180" y1="0" x2="180" y2="220" stroke="#EAE5DA" strokeWidth="1" />

                    <path
                      d="M 110 46 L 180 110 L 110 174"
                      fill="none"
                      stroke="#0D0E11"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="180"
                      y1="110"
                      x2="262"
                      y2="110"
                      stroke="#0D0E11"
                      strokeWidth="2"
                    />

                    {/* Node 01: Business Storefront */}
                    <rect
                      x="14"
                      y="24"
                      width="96"
                      height="44"
                      fill="#0D0E11"
                      stroke="#0D0E11"
                      strokeWidth="1.5"
                    />
                    <text
                      x="22"
                      y="41"
                      fill="#C8F904"
                      fontFamily="monospace"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      NODE // 01
                    </text>
                    <text
                      x="22"
                      y="56"
                      fill="#F4F1EA"
                      fontFamily="sans-serif"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      STOREFRONT
                    </text>

                    {/* Node 02: Buyer Enquiry */}
                    <rect
                      x="14"
                      y="152"
                      width="96"
                      height="44"
                      fill="#FAF8F3"
                      stroke="#0D0E11"
                      strokeWidth="1.5"
                    />
                    <text
                      x="22"
                      y="169"
                      fill="#52514E"
                      fontFamily="monospace"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      NODE // 02
                    </text>
                    <text
                      x="22"
                      y="184"
                      fill="#0D0E11"
                      fontFamily="sans-serif"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      BUYER RFQ
                    </text>

                    {/* Central Index Junction */}
                    <circle
                      cx="180"
                      cy="110"
                      r="22"
                      fill="#C8F904"
                      stroke="#0D0E11"
                      strokeWidth="2"
                    />
                    <circle cx="180" cy="110" r="4" fill="#0D0E11" />
                    <text
                      x="180"
                      y="78"
                      textAnchor="middle"
                      fill="#0D0E11"
                      fontFamily="monospace"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      THE INDEX
                    </text>

                    {/* Node 03: Structured Quotation */}
                    <rect
                      x="250"
                      y="84"
                      width="96"
                      height="52"
                      fill="#C8F904"
                      stroke="#0D0E11"
                      strokeWidth="2"
                    />
                    <text
                      x="258"
                      y="102"
                      fill="#0D0E11"
                      fontFamily="monospace"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      OUTPUT // 03
                    </text>
                    <text
                      x="258"
                      y="117"
                      fill="#0D0E11"
                      fontFamily="sans-serif"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      QUOTATION
                    </text>
                    <text
                      x="258"
                      y="128"
                      fill="#0D0E11"
                      fontFamily="monospace"
                      fontSize="7.5"
                    >
                      DIRECT TERMS
                    </text>
                  </svg>
                </div>
              </div>

              {/* Technical Ledger Specification Table */}
              <div className="mt-8 border-t border-[#0D0E11] pt-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#52514E] mb-3">
                  REGISTRY TELEMETRY // REAL-TIME
                </div>
                <dl className="divide-y divide-[#CFCAC0] border-y border-[#CFCAC0] font-mono text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <dt className="text-[#52514E]">INDUSTRY SECTORS</dt>
                    <dd className="font-bold text-[#0D0E11]">
                      {String(categories.length).padStart(2, '0')} ACTIVE CODES
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <dt className="text-[#52514E]">ENTITY TYPES</dt>
                    <dd className="font-bold text-[#0D0E11]">PRODUCT / SERVICE / HYBRID</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <dt className="text-[#52514E]">PUBLISHED ENTITIES</dt>
                    <dd className="font-bold text-[#0D0E11]">
                      {totalPublishedBusinesses > 0
                        ? `${totalPublishedBusinesses} VERIFIED`
                        : 'FOUNDING COHORT OPEN'}
                    </dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <dt className="text-[#52514E]">COMMISSION / MIDDLEMEN</dt>
                    <dd className="bg-[#C8F904] text-[#0D0E11] px-1.5 py-0.5 font-bold text-[10px]">
                      0% — DIRECT B2B/B2C
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            INTERACTIVE BUSINESS INDEX QUERY TERMINAL
        ===================================================================== */}
        <div className="border-t-2 border-[#0D0E11] bg-[#0D0E11] text-[#F4F1EA]">
          <div className="container-wide py-8 lg:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#2B2D33]">
              <div className="flex items-center gap-2.5">
                <span className="inline-block h-2.5 w-2.5 bg-[#C8F904]" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#C8F904]">
                  INDEX QUERY TERMINAL // SEARCH REGISTRY
                </span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#9E998E]">
                QUERY BY KEYWORD, SECTOR CODE, OR OPERATING JURISDICTION
              </span>
            </div>

            <form
              action="/businesses"
              method="GET"
              className="mt-5 grid grid-cols-1 md:grid-cols-12 border border-[#3A3D45] bg-[#14161B]"
            >
              {/* Field 01: Keyword Query */}
              <div className="md:col-span-5 p-4 border-b md:border-b-0 md:border-r border-[#2B2D33]">
                <label
                  htmlFor="index-search-q"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8F904] mb-1.5"
                >
                  QUERY // 01 — KEYWORD, PRODUCT, OR ENTITY NAME
                </label>
                <div className="relative flex items-center">
                  <Search className="h-4 w-4 text-[#9E998E] mr-2.5 shrink-0" />
                  <input
                    id="index-search-q"
                    type="text"
                    name="q"
                    placeholder="e.g., CNC machining, enterprise SaaS, architectural lighting, catering..."
                    className="w-full bg-transparent text-sm text-[#F4F1EA] placeholder:text-[#78756F] focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Field 02: Sector Classification */}
              <div className="md:col-span-3 p-4 border-b md:border-b-0 md:border-r border-[#2B2D33]">
                <label
                  htmlFor="index-search-category"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#9E998E] mb-1.5"
                >
                  SECTOR // 02 — CLASSIFICATION
                </label>
                <select
                  id="index-search-category"
                  name="category"
                  defaultValue=""
                  className="w-full bg-[#14161B] text-sm text-[#F4F1EA] focus:outline-none font-mono"
                >
                  <option value="">ALL 18 SECTORS</option>
                  {categories.map((cat, idx) => (
                    <option key={cat.id} value={cat.slug}>
                      [{String(idx + 1).padStart(2, '0')}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 03: Jurisdiction / City */}
              <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-[#2B2D33]">
                <label
                  htmlFor="index-search-city"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#9E998E] mb-1.5"
                >
                  JURISDICTION // 03
                </label>
                <div className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 text-[#9E998E] mr-1.5 shrink-0" />
                  <select
                    id="index-search-city"
                    name="city"
                    defaultValue=""
                    className="w-full bg-[#14161B] text-sm text-[#F4F1EA] focus:outline-none font-mono"
                  >
                    <option value="">ALL INDIA</option>
                    {BRAND_CONFIG.initialCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Trigger */}
              <div className="md:col-span-2 flex">
                <button
                  type="submit"
                  className="w-full bg-[#C8F904] text-[#0D0E11] px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#FAF8F3] transition-colors flex items-center justify-center gap-2"
                >
                  <span>EXECUTE QUERY</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Quick Sector Index Codes */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9E998E] mr-1">
                DIRECT INDEX KEYS:
              </span>
              {quickSectors.map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/businesses?category=${cat.slug}`}
                  className="inline-flex items-center gap-1.5 border border-[#2B2D33] bg-[#14161B] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#CFCAC0] hover:border-[#C8F904] hover:text-[#C8F904] transition-colors"
                >
                  <span className="text-[#C8F904] font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 // STRUCTURED SECTOR INDEX LEDGER (18 SECTORS)
      ===================================================================== */}
      <section id="categories" className="border-b-2 border-[#0D0E11] py-16 lg:py-24">
        <div className="container-wide">
          {/* Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-8 border-b-2 border-[#0D0E11]">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="index-code">SEC // 02</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                  STANDARD COMMERCIAL TAXONOMY
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0D0E11] uppercase leading-[0.95]">
                THE 18 SECTOR CLASSIFICATIONS.
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:items-end justify-between gap-4">
              <p className="text-sm text-[#52514E] max-w-md leading-relaxed">
                Every business and catalog offering on PROVENTA is indexed under a standardized
                sector code for instant procurement and consumer discovery.
              </p>
              <Link
                href="/businesses"
                className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#0D0E11] underline decoration-2 underline-offset-4 hover:bg-[#C8F904] px-2 py-1 shrink-0"
              >
                OPEN FULL DIRECTORY →
              </Link>
            </div>
          </div>

          {/* Column Headers (Desktop Ledger) */}
          <div className="hidden lg:grid lg:grid-cols-12 border-b border-[#0D0E11] bg-[#EAE5DA] py-2.5 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#52514E]">
            <div className="col-span-2">INDEX CODE</div>
            <div className="col-span-3">SECTOR CLASSIFICATION</div>
            <div className="col-span-4">SCOPE &amp; COMMERCIAL COVERAGE</div>
            <div className="col-span-2">SUB-INDEX TAGS</div>
            <div className="col-span-1 text-right">ACTION</div>
          </div>

          {/* Structured Index Entries (Tabular Ledger Rows) */}
          <div className="divide-y divide-[#0D0E11] border-b border-[#0D0E11]">
            {categories.map((cat, idx) => {
              const sectorCode = formatSectorCode(idx, cat.slug);
              const subcats = cat.subcategories || [];
              return (
                <Link
                  key={cat.id}
                  href={`/businesses?category=${cat.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-start lg:items-center gap-3 lg:gap-4 py-4 px-3 sm:px-4 bg-[#FAF8F3] hover:bg-[#0D0E11] hover:text-[#F4F1EA] transition-colors duration-150"
                >
                  {/* Column 1: Index Number & Code */}
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#0D0E11] bg-[#EAE5DA] text-[#0D0E11] group-hover:bg-[#C8F904] group-hover:border-[#C8F904]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[#52514E] group-hover:text-[#C8F904]">
                      {sectorCode}
                    </span>
                  </div>

                  {/* Column 2: Sector Title */}
                  <div className="lg:col-span-3">
                    <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-[#0D0E11] group-hover:text-[#F4F1EA]">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Column 3: Editorial Scope Description */}
                  <div className="lg:col-span-4">
                    <p className="text-xs text-[#52514E] group-hover:text-[#CFCAC0] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Column 4: Subcategory Index Pills */}
                  <div className="lg:col-span-2 flex flex-wrap gap-1.5">
                    {subcats.slice(0, 2).map((sub) => (
                      <span
                        key={sub.id}
                        className="font-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 border border-[#CFCAC0] bg-[#F4F1EA] text-[#52514E] group-hover:border-[#3A3D45] group-hover:bg-[#1D1F26] group-hover:text-[#CFCAC0]"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>

                  {/* Column 5: Right-Aligned Trigger */}
                  <div className="lg:col-span-1 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] group-hover:text-[#C8F904]">
                      <span>INDEX</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 03 // PUBLISHED STOREFRONTS OR FOUNDING REGISTRY DOSSIER
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11] py-16 lg:py-24 bg-[#FAF8F3]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-8 border-b-2 border-[#0D0E11]">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="index-code-lime">SEC // 03</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                  VERIFIED COMMERCIAL STOREFRONTS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0D0E11] uppercase leading-[0.95]">
                INDEXED BUSINESS DOSSIERS.
              </h2>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link href="/businesses" className="btn-secondary">
                <span>BROWSE ALL ENTITIES</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {displayBusinesses.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#0D0E11]">
              {displayBusinesses.map((biz, idx) => {
                const badge = VERIFICATION_BADGE_META[biz.verificationLevel];
                const categoryLabel =
                  biz.primaryCategory?.name || 'Commercial Entity';
                return (
                  <article
                    key={biz.id}
                    className="group flex flex-col justify-between border-r border-b border-[#0D0E11] bg-[#FAF8F3] p-6 hover:bg-[#EAE5DA] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[#CFCAC0]">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#52514E]">
                          DOSSIER // {String(idx + 1).padStart(3, '0')}
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

                      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#52514E]">
                        <span>{categoryLabel}</span>
                        <span>·</span>
                        <span>{biz.businessType}</span>
                      </div>

                      <Link href={`/business/${biz.slug}`} className="block">
                        <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-[#0D0E11] group-hover:underline">
                          {biz.name}
                        </h3>
                      </Link>

                      {biz.tagline && (
                        <p className="mt-1.5 text-xs font-medium text-[#0D0E11]">
                          {biz.tagline}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-[#52514E] line-clamp-3 leading-relaxed">
                        {biz.description || biz.shortDescription}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#CFCAC0] flex items-center justify-between">
                      <div className="font-mono text-[11px] text-[#0D0E11] flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#52514E]" />
                        <span>
                          {biz.city}
                          {biz.state ? `, ${biz.state}` : ''}
                        </span>
                      </div>
                      <Link
                        href={`/business/${biz.slug}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#0D0E11] bg-[#C8F904] px-2.5 py-1 border border-[#0D0E11]"
                      >
                        <span>OPEN DOSSIER</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Honest Founding Registry Spread when 0 businesses are seeded in memory */
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 border-2 border-[#0D0E11] bg-[#F4F1EA]">
              <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#0D0E11]">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="index-code-lime">REGISTRY STATUS // LIVE</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#52514E]">
                    ZERO SYNTHETIC PROFILES
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0D0E11] uppercase leading-tight">
                  CLAIM YOUR PERMANENT ENTRY IN THE BUSINESS INDEX.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-[#52514E] leading-relaxed max-w-2xl">
                  PROVENTA never populates its directory with fake placeholder companies or
                  synthetic ratings. Every storefront in this index represents a real operating
                  enterprise. Register your business to publish your verified dossier, list
                  products and services, and receive direct buyer RFQs.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/business/register" className="btn-primary">
                    <span>REGISTER YOUR BUSINESS</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/enquiries/new" className="btn-secondary">
                    <span>SUBMIT A BUYER ENQUIRY</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 p-8 sm:p-10 bg-[#FAF8F3] flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#0D0E11] pb-3 border-b border-[#0D0E11]">
                    STOREFRONT DOSSIER SPECIFICATION
                  </div>
                  <ul className="mt-5 space-y-3.5 text-xs text-[#0D0E11]">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                        <Check className="h-3 w-3 text-[#0D0E11]" />
                      </span>
                      <span>
                        <strong>Dedicated Publication URL:</strong> Canonical{' '}
                        <code className="font-mono bg-[#EAE5DA] px-1">/business/[slug]</code>{' '}
                        dossier indexed by sector and city.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                        <Check className="h-3 w-3 text-[#0D0E11]" />
                      </span>
                      <span>
                        <strong>Structured Offerings Ledger:</strong> List fixed-price products,
                        custom services, MOQ specs, and turnaround times.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-[#C8F904] border border-[#0D0E11]">
                        <Check className="h-3 w-3 text-[#0D0E11]" />
                      </span>
                      <span>
                        <strong>Direct Quotation Dispatch:</strong> Respond to targeted buyer
                        enquiries with formal pricing proposals.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-[#CFCAC0] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#52514E]">
                  <span>ONBOARDING TIME: ~3 MINUTES</span>
                  <span className="text-[#0D0E11] font-bold">VERIFICATION INCLUDED</span>
                </div>
              </div>
            </div>
          )}

          {/* Published Catalog Offerings Ledger (if listings exist) */}
          {totalPublishedListings > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between pb-4 border-b border-[#0D0E11]">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0D0E11]">
                  CATALOG LEDGER // LATEST PRODUCTS &amp; SERVICES ({totalPublishedListings})
                </span>
                <Link
                  href="/listings"
                  className="font-mono text-xs font-bold uppercase tracking-[0.12em] underline"
                >
                  VIEW ALL LISTINGS →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 border-l border-[#0D0E11]">
                {recentListingsResult.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="border-r border-b border-[#0D0E11] p-5 bg-[#FAF8F3] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#52514E] mb-2">
                        <span>{item.listingType}</span>
                        <span>{PRICE_DISPLAY_LABELS[item.priceDisplayType]}</span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-[#0D0E11]">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-xs text-[#52514E] line-clamp-2">
                        {item.shortSummary || item.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#CFCAC0] flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-[#0D0E11]">
                        {item.priceAmount
                          ? `₹${item.priceAmount.toLocaleString('en-IN')}`
                          : PRICE_DISPLAY_LABELS[item.priceDisplayType]}
                      </span>
                      <Link
                        href={`/enquiries/new?listingId=${item.id}&businessId=${item.businessId}`}
                        className="text-[#0D0E11] underline font-bold"
                      >
                        REQUEST QUOTE →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          SECTION 04 // THE 3-STAGE COMMERCIAL PROTOCOL
      ===================================================================== */}
      <section className="border-b-2 border-[#0D0E11] py-16 lg:py-24 bg-[#F4F1EA]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-10 border-b-2 border-[#0D0E11]">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="index-code">SEC // 04</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#52514E]">
                  OPERATIONAL ARCHITECTURE
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0D0E11] uppercase leading-[0.95]">
                HOW THE BUSINESS INDEX OPERATES.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm text-[#52514E] leading-relaxed">
                Designed around clarity, speed, and zero noise. Whether procuring industrial
                components, contracting an agency, or booking local services, the protocol
                remains identical.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#0D0E11] border-b border-x border-[#0D0E11] bg-[#FAF8F3]">
            {/* Stage 01 */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-5xl font-bold tracking-tighter text-[#0D0E11]">
                    01
                  </span>
                  <span className="index-code-lime">STAGE // DISCOVERY</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0D0E11] uppercase">
                  QUERY THE INDEX OR BROWSE BY SECTOR CODE
                </h3>
                <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                  Filter registered businesses by sector code, operating city, offering type
                  (Product, Service, or Hybrid), and verification tier. Inspect detailed
                  storefront dossiers and catalog specifications without paywalls.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#CFCAC0] font-mono text-[11px] uppercase tracking-[0.12em] text-[#0D0E11] font-semibold">
                INPUT: KEYWORD + SECTOR + JURISDICTION
              </div>
            </div>

            {/* Stage 02 */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-5xl font-bold tracking-tighter text-[#0D0E11]">
                    02
                  </span>
                  <span className="index-code">STAGE // DISPATCH</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0D0E11] uppercase">
                  DISPATCH DIRECT OR OPEN BUYER ENQUIRIES
                </h3>
                <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                  Send a targeted enquiry directly to a selected business storefront, or publish
                  an open sector requirement specifying your quantity, budget range, timeline,
                  and delivery city.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#CFCAC0] font-mono text-[11px] uppercase tracking-[0.12em] text-[#0D0E11] font-semibold">
                PRIVACY: CONTACT REDACTED UNTIL AUTHORIZED
              </div>
            </div>

            {/* Stage 03 */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-5xl font-bold tracking-tighter text-[#0D0E11]">
                    03
                  </span>
                  <span className="index-code-lime">STAGE // SETTLEMENT</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0D0E11] uppercase">
                  COMPARE STRUCTURED QUOTATIONS &amp; AWARD
                </h3>
                <p className="mt-3 text-sm text-[#52514E] leading-relaxed">
                  Receive structured quotations with line-item pricing, validity dates, and
                  delivery commitments. Compare responses side by side in your workspace and
                  accept the winning proposal.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#CFCAC0] font-mono text-[11px] uppercase tracking-[0.12em] text-[#0D0E11] font-semibold">
                OUTPUT: ACCEPTED COMMERCIAL QUOTATION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 05 // DUAL FOR-BUSINESSES & FOR-BUYERS DISPATCH BLOCK
      ===================================================================== */}
      <section className="py-16 lg:py-24 bg-[#EAE5DA]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-2 border-[#0D0E11]">
            {/* Left Panel: For Businesses (Ink-Black Surface) */}
            <div className="lg:col-span-6 bg-[#0D0E11] text-[#F4F1EA] p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#0D0E11]">
              <div>
                <span className="inline-block bg-[#C8F904] text-[#0D0E11] font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 mb-5">
                  PORTAL A // FOR BUSINESSES &amp; VENDORS
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#F4F1EA] uppercase leading-tight">
                  PUBLISH YOUR STOREFRONT IN THE INDEX.
                </h2>
                <p className="mt-4 text-sm text-[#CFCAC0] leading-relaxed">
                  Establish an authoritative commercial presence. Showcase your products,
                  services, technical specifications, and service areas—and respond to qualified
                  buyer enquiries from one unified console.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-[#2B2D33] font-mono text-[11px] text-[#CFCAC0]">
                  <div>✓ VERIFIED ENTITY STAMP</div>
                  <div>✓ UNLIMITED CATALOG ITEMS</div>
                  <div>✓ DIRECT RFQ INBOX</div>
                  <div>✓ QUOTATION BUILDER</div>
                </div>
              </div>
              <div className="mt-10">
                <Link href="/business/register" className="btn-accent w-full sm:w-auto">
                  <span>REGISTER BUSINESS STOREFRONT</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Panel: For Buyers & Procurement (Paper-Ivory Surface) */}
            <div className="lg:col-span-6 bg-[#FAF8F3] text-[#0D0E11] p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#0D0E11] text-[#F4F1EA] font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 mb-5">
                  PORTAL B // FOR BUYERS &amp; PROCUREMENT
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#0D0E11] uppercase leading-tight">
                  DISPATCH AN ENQUIRY. RECEIVE DIRECT QUOTES.
                </h2>
                <p className="mt-4 text-sm text-[#52514E] leading-relaxed">
                  Skip cold outreach and fragmented directories. Submit a structured requirement
                  once—either to a specific business or open to a sector—and evaluate transparent
                  quotations in your buyer ledger.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-[#CFCAC0] font-mono text-[11px] text-[#0D0E11]">
                  <div>✓ 18 INDUSTRY SECTORS</div>
                  <div>✓ PRIVACY-PROTECTED CONTACT</div>
                  <div>✓ SIDE-BY-SIDE QUOTES</div>
                  <div>✓ ZERO BUYER FEES</div>
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/enquiries/new" className="btn-primary">
                  <span>POST A BUYER ENQUIRY</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/businesses" className="btn-secondary">
                  <span>EXPLORE DIRECTORY</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { AHMEDABAD_LOCALITIES, CANONICAL_PROJECTS, REAL_ESTATE_MEMBERSHIP_PLANS } from '@/lib/real-estate/constants';
import { 
  Search, 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Check, 
  Building2, 
  FileText, 
  TrendingUp, 
  Layers 
} from 'lucide-react';

export default function RealEstateHomePage() {
  const topLocalities = AHMEDABAD_LOCALITIES.slice(0, 6);

  return (
    <div className="space-y-24 pb-20 font-sans">
      
      {/* 1. ASYMMETRICAL EDITORIAL HERO */}
      <section className="border-b border-[#C8C4BA] bg-[#F5F3ED] pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Proposition & Search (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#547568]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#547568] font-bold">
                  Independent Research &bull; Ahmedabad & Gandhinagar
                </span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#202B3C] leading-[1.05]">
                Know your property.<br />
                Know its value.
              </h1>

              <p className="text-base sm:text-lg text-[#69717B] max-w-xl leading-relaxed">
                Independent intelligence for understanding property prices, locations and real estate investments. Grounded strictly in verified RERA filings and observed sub-registrar sales deeds.
              </p>

              {/* Functional Search Bar */}
              <div className="pt-2 max-w-xl">
                <form action="/property-intelligence" method="GET" className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#69717B]" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Search a locality, project or property"
                      className="w-full h-11 pl-10 pr-3 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] placeholder:text-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 px-6 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#151D29] transition-colors whitespace-nowrap shadow-xs"
                  >
                    Explore Property Intelligence
                  </button>
                </form>

                {/* Quick Locality Jump Bar */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-4 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#69717B]">Active Markets:</span>
                  {topLocalities.slice(0, 4).map((loc) => (
                    <Link
                      key={loc.slug}
                      href={`/location-intelligence?locality=${loc.slug}`}
                      className="text-[#202B3C] font-semibold hover:text-[#547568] underline decoration-[#C8C4BA] underline-offset-4 transition-colors"
                    >
                      {loc.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Architectural Photography Frame (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="relative aspect-[4/5] w-full border border-[#C8C4BA] bg-white overflow-hidden shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern residential towers in Ahmedabad"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute top-3 left-3 bg-[#202B3C]/90 text-white px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest backdrop-blur-xs">
                  AUDA Western Corridor
                </div>
              </div>
              <p className="text-[11px] font-mono text-[#69717B] text-right">
                Modern high-rise residential development &bull; S.G. Highway Corridor
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MARKET INTRODUCTION: TABULAR BENCHMARKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#C8C4BA] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
              Observed Evidence &bull; Ahmedabad & Gandhinagar
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C] mt-1">
              Understand the market before making your move.
            </h2>
          </div>
          <Link
            href="/location-intelligence"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#202B3C] hover:text-[#547568] flex items-center gap-1.5"
          >
            <span>Explore All 11 Localities</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Financial Data Table */}
        <div className="mt-6 border border-[#C8C4BA] bg-white overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono text-[11px]">
                <th className="p-3.5 font-bold uppercase tracking-wider">Locality</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Zone</th>
                <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Weighted ₹/Sq Ft (Carpet)</th>
                <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Q3 Deeds</th>
                <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">Gross Yield</th>
                <th className="p-3.5 font-bold uppercase tracking-wider tabular-nums">1-Yr Growth</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD6] font-mono">
              {topLocalities.map((loc) => (
                <tr key={loc.slug} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3.5 font-sans font-bold text-[#202B3C]">
                    <Link href={`/location-intelligence?locality=${loc.slug}`} className="hover:underline">
                      {loc.name}
                    </Link>
                  </td>
                  <td className="p-3.5 font-sans text-[#69717B]">{loc.zone}</td>
                  <td className="p-3.5 text-[#202B3C] font-bold tabular-nums">
                    ₹{loc.avgPriceSqFt.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-[#69717B] tabular-nums">
                    {loc.transactionVolumeQuarter} recorded
                  </td>
                  <td className="p-3.5 font-bold text-[#547568] tabular-nums">
                    {loc.grossRentalYield}%
                  </td>
                  <td className="p-3.5 text-[#547568] tabular-nums">
                    +{loc.historicalGrowth1Yr}%
                  </td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-[#69717B]">
          <span>Data Sources: Gujarat Revenue Department Sub-Registrar Indices (Garvi) & AUDA TP Records</span>
          <span>Observation Period: Q3 2026</span>
        </div>
      </section>

      {/* 3. PRODUCT DIVISIONS: ASYMMETRICAL EDITORIAL LAYOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-[#C8C4BA] pb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
            Comprehensive Suite
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C] mt-1">
            Six Dedicated Intelligence Divisions
          </h2>
          <p className="text-xs text-[#69717B] mt-1">
            Distinct tools and datasets designed for property buyers, owners, and professional investors.
          </p>
        </div>

        {/* Feature 1: Lead Feature with Photography (Property Intelligence) */}
        <div className="bg-white border border-[#C8C4BA] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">01 &bull; Flagship Engine</span>
                <span className="px-2 py-0.5 bg-[#547568]/10 text-[#547568] text-[10px] font-mono font-bold">CARPET AREA STANDARD</span>
              </div>
              <h3 className="font-editorial text-3xl font-bold text-[#202B3C] leading-tight">
                Property Price Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-[#69717B] leading-relaxed">
                Most portals evaluate property prices on ambiguous &quot;super built-up&quot; area, artificially deflating per-square-foot rates by 35% to 50%. PROVENTA normalizes every calculation strictly to usable RERA carpet square footage, factoring in floor level, building age, society amenities, and verified sub-registrar transactions.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/50">
                  <span className="text-[#69717B] block text-[10px]">VALUATION OUTPUT</span>
                  <span className="font-bold text-[#202B3C]">Fair Market Range + Midpoint</span>
                </div>
                <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/50">
                  <span className="text-[#69717B] block text-[10px]">NEGOTIATION SPREAD</span>
                  <span className="font-bold text-[#547568]">-4% to -8% Observed Discount</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#C8C4BA]/50">
              <Link
                href="/property-intelligence"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568]"
              >
                <span>Launch Valuation Engine</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] border-t lg:border-t-0 lg:border-l border-[#C8C4BA]">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt="Realistic modern residential apartment interior"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Feature 2 & 3: Two-column Editorial Split (Locations & Projects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Location Intelligence */}
          <div className="bg-white border border-[#C8C4BA] p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">02 &bull; Micro-Market Dossiers</span>
              <h3 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Location Intelligence
              </h3>
              <p className="text-xs text-[#69717B] leading-relaxed">
                Granular quarterly intelligence across 11 Ahmedabad corridors. Tracking town-planning infrastructure, AUDA road widening projects, metro expansions, and rental demand trends.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#202B3C] space-y-1">
                <div>&bull; Micro-markets: South Bopal, Shela, Bodakdev, Thaltej, Science City, GIFT City</div>
                <div>&bull; Metrics: Median ₹/sq ft, rental yield, RERA registration density</div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#C8C4BA]/50">
              <Link
                href="/location-intelligence"
                className="text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1.5"
              >
                <span>Explore Locality Research</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Project Intelligence */}
          <div className="bg-white border border-[#C8C4BA] p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">03 &bull; Regulatory Verification</span>
              <h3 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Project Intelligence
              </h3>
              <p className="text-xs text-[#69717B] leading-relaxed">
                Structured profiles for RERA-registered developments in Gujarat. We verify statutory registration numbers, developer delivery track records, and construction milestone compliance.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#202B3C] space-y-1">
                <div>&bull; Registry: Gujarat RERA QPR audits & occupancy clearances</div>
                <div>&bull; Verification: 100% verified regulatory filings without broker bias</div>
              </div>
            </div>
            <div className="pt-4 border-t border-[#C8C4BA]/50">
              <Link
                href="/project-intelligence"
                className="text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1.5"
              >
                <span>Browse Project Registry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Feature 4 & 5: Two-column Editorial Split (Investment & Property Vault) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Investment Intelligence */}
          <div className="bg-white border border-[#C8C4BA] p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">04 &bull; Institutional Analytics</span>
              <h3 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Investment & Yield Intelligence
              </h3>
              <p className="text-xs text-[#69717B] leading-relaxed">
                Mathematical modeling of total acquisition costs including Gujarat stamp duty (4.9% male / exemption for female), 1% registration fees, loan amortization schedules, vacancy rates, and multi-scenario holding period returns.
              </p>
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 font-mono text-[11px] text-[#202B3C]">
                Calculates Conservative, Base, and Optimistic scenario projections without speculative returns.
              </div>
            </div>
            <div className="pt-4 border-t border-[#C8C4BA]/50">
              <Link
                href="/investment-intelligence"
                className="text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1.5"
              >
                <span>Run Investment Calculator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Personal Property Vault */}
          <div className="bg-white border border-[#C8C4BA] p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">05 &bull; Confidential Document Locker</span>
              <h3 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Personal Property Vault
              </h3>
              <p className="text-xs text-[#69717B] leading-relaxed">
                A permanent, private digital record for your properties. Securely upload registered sale deeds, AUDA/AMC municipal tax receipts, builder allotment letters, and loan NOCs with automated continuous valuation re-benchmarking.
              </p>
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/40 font-mono text-[11px] text-[#547568]">
                AES-256 server-side encryption &bull; Zero third-party broker sharing &bull; 100% private
              </div>
            </div>
            <div className="pt-4 border-t border-[#C8C4BA]/50">
              <Link
                href="/dashboard/property-vault"
                className="text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1.5"
              >
                <span>Access Personal Vault</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Feature 6: Research Reports Banner */}
        <div className="bg-[#202B3C] text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono font-bold text-[#C8C4BA] uppercase tracking-wider">
              06 &bull; PROVENTA Research Desk
            </span>
            <h3 className="font-editorial text-3xl font-bold text-white">
              Quarterly Market Research Publications
            </h3>
            <p className="text-xs sm:text-sm text-[#C8C4BA] leading-relaxed">
              In-depth research papers on Gujarat real estate: Ahmedabad housing absorption indices, GIFT City dual-regime leasing dynamics, and statistical comparisons between statutory Jantri circle rates and true market clearing prices.
            </p>
          </div>
          <Link
            href="/reports"
            className="whitespace-nowrap px-6 py-3 bg-white text-[#202B3C] text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#F5F3ED] transition-colors shadow-xs"
          >
            Browse Published Dossiers
          </Link>
        </div>

      </section>

      {/* 4. CLOSING STATEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#C8C4BA] bg-white p-10 sm:p-16 text-center space-y-6 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#547568] font-bold">
            Independent Real Estate Governance
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] max-w-2xl mx-auto leading-tight">
            Better property decisions begin with better information.
          </h2>
          <p className="text-xs sm:text-sm text-[#69717B] max-w-xl mx-auto leading-relaxed">
            Join homeowners, serious buyers, and institutional analysts across Ahmedabad who rely on PROVENTA for transparent, evidence-based real estate intelligence.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#151D29] transition-all shadow-xs"
            >
              Create Free Account
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#202B3C] text-[#202B3C] text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#F5F3ED] transition-all"
            >
              View Membership Tiers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

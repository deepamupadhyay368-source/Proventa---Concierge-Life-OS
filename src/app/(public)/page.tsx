import Link from 'next/link';
import { AHMEDABAD_LOCALITIES, CANONICAL_PROJECTS, REAL_ESTATE_MEMBERSHIP_PLANS } from '@/lib/real-estate/constants';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  Search, 
  ShieldCheck, 
  FileText, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Lock 
} from 'lucide-react';

export default function RealEstateHomePage() {
  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="border-b border-[#C8C4BA] bg-[#F5F3ED] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#202B3C]/5 border border-[#202B3C]/15 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#547568]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#202B3C]">
                Independent Real Estate Intelligence
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#202B3C] leading-[1.08]">
              Understand the value behind every property.
            </h1>

            <p className="text-base sm:text-lg text-[#69717B] leading-relaxed max-w-2xl font-normal">
              Explore evidence-backed property valuations, benchmark micromarket prices, evaluate investment yields, and maintain an unalterable personal property vault — built specifically for Indian real estate.
            </p>

            {/* Integrated Search Box */}
            <div className="pt-2">
              <div className="bg-white border border-[#C8C4BA] p-2.5 sm:p-3 shadow-xs rounded-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xs">
                  <Search className="w-4 h-4 text-[#69717B]" />
                  <input
                    type="text"
                    placeholder="Search Ahmedabad locality, project or society (e.g. South Bopal, Shela)..."
                    className="w-full text-xs sm:text-sm bg-transparent text-[#202B3C] placeholder:text-stone-400 focus:outline-none"
                  />
                </div>
                <Link
                  href="/property-intelligence"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151D29] transition-all rounded-xs whitespace-nowrap"
                >
                  <span>Explore Valuation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>

              {/* Quick Locality Jump Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-[#69717B]">
                <span className="font-semibold text-[#202B3C]">Top Markets:</span>
                {AHMEDABAD_LOCALITIES.slice(0, 5).map((loc) => (
                  <Link
                    key={loc.slug}
                    href={`/location-intelligence?locality=${loc.slug}`}
                    className="hover:text-[#202B3C] underline decoration-[#C8C4BA] hover:decoration-[#202B3C]"
                  >
                    {loc.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL MARKET BENCHMARKS (AHMEDABAD PILOT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#C8C4BA]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
              Market Observations &bull; Ahmedabad Q3 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#202B3C] tracking-tight mt-1">
              Locality Price & Rental Benchmarks
            </h2>
          </div>
          <Link
            href="/location-intelligence"
            className="text-xs font-bold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1"
          >
            <span>View All 11 Localities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Data Table */}
        <div className="mt-6 border border-[#C8C4BA] bg-white rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#C8C4BA] bg-stone-50 text-[#69717B] uppercase tracking-wider text-[11px] font-bold font-mono">
                <th className="py-3.5 px-4">Locality</th>
                <th className="py-3.5 px-4">Micro-Zone</th>
                <th className="py-3.5 px-4">Benchmark Price / Sq Ft</th>
                <th className="py-3.5 px-4">Gross Rental Yield</th>
                <th className="py-3.5 px-4">1-Yr Price Shift</th>
                <th className="py-3.5 px-4 text-right">Data Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-[#202B3C]">
              {AHMEDABAD_LOCALITIES.slice(0, 6).map((loc) => (
                <tr key={loc.slug} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <Link href={`/location-intelligence?locality=${loc.slug}`} className="hover:underline">
                      {loc.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-[#69717B]">{loc.zone}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    ₹{loc.avgPriceSqFt.toLocaleString('en-IN')} <span className="text-[#69717B] text-[10px]">/ sq.ft</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-[#547568]">
                    {loc.grossRentalYield}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                    +{loc.historicalGrowth1Yr}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 bg-stone-100 border border-stone-200 text-[10px] font-mono text-[#69717B] rounded-2xs">
                      {loc.confidenceScore}% Confidence
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. SIX CORE PRODUCT DIVISIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
            Comprehensive Real Estate Stack
          </span>
          <h2 className="text-3xl font-black text-[#202B3C] tracking-tight">
            Six Dedicated Intelligence Divisions
          </h2>
          <p className="text-xs text-[#69717B]">
            Engineered to replace subjective broker opinions with transparent, empirical data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Division 1: PROVENTA Price */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">1. PROVENTA Price</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              Algorithmic property valuation engine based on usable carpet area, verified registry comps, floor-level variations and building age adjustments.
            </p>
            <Link href="/property-intelligence" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Evaluate Property Value</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Division 2: PROVENTA Locations */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">2. PROVENTA Locations</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              In-depth research on Ahmedabad micromarkets: historical capital growth, rental yield distribution, infrastructure roadmaps, and zoning constraints.
            </p>
            <Link href="/location-intelligence" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Explore Locality Research</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Division 3: PROVENTA Projects */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">3. PROVENTA Projects</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              Gujarat RERA project monitoring, developer execution track records, configuration analysis, and verifiable possession progress records.
            </p>
            <Link href="/project-intelligence" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Browse Project Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Division 4: PROVENTA Invest */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">4. PROVENTA Invest</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              Institutional-grade cashflow calculator incorporating Gujarat stamp duty, loan amortization, property taxes, vacancy allowances, and scenario models.
            </p>
            <Link href="/investment-intelligence" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Run Investment Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Division 5: PROVENTA Vault */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">5. PROVENTA Vault</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              A private digital registry to record sale deeds, index valuations, log renovation capital expenses, and monitor portfolio net worth over decades.
            </p>
            <Link href="/dashboard/property-vault" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Access Personal Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Division 6: PROVENTA Reports */}
          <div className="border border-[#C8C4BA] bg-white p-6 rounded-xs space-y-4 hover:border-[#202B3C] transition-colors">
            <div className="w-9 h-9 bg-[#202B3C]/5 text-[#202B3C] flex items-center justify-center rounded-xs">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">6. PROVENTA Reports</h3>
            <p className="text-xs text-[#69717B] leading-relaxed">
              Institutional publications on quarterly Ahmedabad absorption, infrastructure-led appreciation corridors, and regulatory updates.
            </p>
            <Link href="/reports" className="inline-flex items-center text-xs font-bold text-[#547568] hover:underline gap-1">
              <span>Read Market Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. METHODOLOGY & EVIDENCE STATEMENT */}
      <section className="bg-[#202B3C] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#547568] bg-white/10 px-2.5 py-1 rounded-xs">
                Methodology & Principles
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Evidence before estimates.
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed max-w-xl">
                We believe Indian real estate transactions suffer from severe information asymmetry. Asking prices on classified portals are routinely inflated, while government Jantri circle rates lag true market transactions.
              </p>
              <div className="space-y-3 pt-2 text-xs text-stone-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Brokerage Bias:</strong> We do not broker properties, accept developer commissions, or list sponsored properties.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Carpet Area Standard:</strong> All evaluations normalized strictly on usable RERA carpet measurements.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Confidence Indexing:</strong> Every valuation states exact confidence parameters and data limitations.</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/methodology"
                  className="inline-flex items-center px-6 py-3 bg-white text-[#202B3C] text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-all rounded-xs"
                >
                  <span>Explore Valuation Methodology</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-xs space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Data Classification Standard
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xs flex justify-between items-center">
                  <span className="font-semibold text-emerald-400">VERIFIED</span>
                  <span className="text-stone-300 text-[11px]">Sub-Registrar recorded transfers</span>
                </div>
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xs flex justify-between items-center">
                  <span className="font-semibold text-blue-400">SOURCE-REPORTED</span>
                  <span className="text-stone-300 text-[11px]">Developer filings & audited reports</span>
                </div>
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xs flex justify-between items-center">
                  <span className="font-semibold text-amber-400">MODEL-ESTIMATED</span>
                  <span className="text-stone-300 text-[11px]">Hedonic regression calculations</span>
                </div>
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xs flex justify-between items-center">
                  <span className="font-semibold text-stone-400">USER-SUBMITTED</span>
                  <span className="text-stone-300 text-[11px]">Private personal vault logs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP TIERS OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
            Membership Architecture
          </span>
          <h2 className="text-3xl font-black text-[#202B3C] tracking-tight">
            Transparent Subscription Plans
          </h2>
          <p className="text-xs text-[#69717B]">
            From casual homebuyers to professional wealth managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REAL_ESTATE_MEMBERSHIP_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border p-6 rounded-xs space-y-5 flex flex-col justify-between ${
                plan.popular
                  ? 'border-[#202B3C] bg-white ring-1 ring-[#202B3C] shadow-sm'
                  : 'border-[#C8C4BA] bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#202B3C]">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#547568] text-white px-2 py-0.5 rounded-2xs">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="font-mono">
                  <span className="text-3xl font-black text-[#202B3C]">
                    ₹{plan.monthlyPrice}
                  </span>
                  <span className="text-xs text-[#69717B]"> / month</span>
                </div>
                <p className="text-xs text-[#69717B] min-h-[36px]">{plan.tagline}</p>
                <div className="pt-2 border-t border-stone-200">
                  <ul className="space-y-2 text-xs text-[#202B3C]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#547568] shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href="/pricing"
                className={`w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xs transition-all ${
                  plan.popular
                    ? 'bg-[#202B3C] text-white hover:bg-[#151D29]'
                    : 'bg-stone-100 text-[#202B3C] hover:bg-stone-200 border border-stone-300'
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

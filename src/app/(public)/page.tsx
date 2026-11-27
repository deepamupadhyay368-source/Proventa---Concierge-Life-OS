import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Building2,
  MapPin,
  TrendingUp,
  Calculator,
  FolderLock,
  ShieldCheck,
  Database,
  FileText,
  Layers,
} from 'lucide-react';

const AHMEDABAD_CORRIDORS = [
  'Bopal',
  'South Bopal',
  'Gota',
  'Science City',
  'Thaltej',
  'Bodakdev',
  'Satellite',
  'Prahlad Nagar',
  'SG Highway',
  'Shela',
  'Sanand',
  'Changodar',
  'GIFT City',
];

const FIVE_LAYERS = [
  {
    code: 'LAYER 01',
    title: 'Living Property Registry',
    href: '/property-intelligence',
    icon: Database,
    desc: 'Permanent PROVENTA Property IDs across Land → Project → Building → Unit → Property with source provenance, duplicate detection, and verification workflows.',
  },
  {
    code: 'LAYER 02',
    title: 'Market & Location Intelligence',
    href: '/market-intelligence',
    icon: TrendingUp,
    desc: 'Sourced locality price benchmarks, rental yields, infrastructure status (Operational vs Under Construction vs Proposed), and side-by-side corridor comparisons.',
  },
  {
    code: 'LAYER 03',
    title: 'Project & RERA Intelligence',
    href: '/project-intelligence',
    icon: Building2,
    desc: 'Structured Gujarat RERA project profiles, developer records, construction milestones, and multi-project side-by-side comparison.',
  },
  {
    code: 'LAYER 04',
    title: 'Investment & Valuation Intelligence',
    href: '/investment-intelligence',
    icon: Calculator,
    desc: '12-factor carpet-area valuation engine plus institutional IRR, net yield, equity multiple, sensitivity matrices, and Conservative/Base/Optimistic scenarios.',
  },
  {
    code: 'LAYER 05',
    title: 'Property OS — Digital Passport',
    href: '/property-os',
    icon: FolderLock,
    desc: 'Strictly private owner portfolio management: property profiles, leases, tenants, expenses, maintenance logs, encrypted document vault, and lifecycle timelines.',
  },
];

export default function RealEstateIntelligenceHomePage() {
  return (
    <div className="font-sans text-[#0F172A]">
      {/* 1. DARK INFRASTRUCTURE INSTITUTIONAL HERO */}
      <section className="bg-[#0F172A] text-white border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 border border-[#0D9488]/50 bg-[#1E293B] px-3 py-1.5 rounded-xs">
                <span className="w-2 h-2 bg-[#2DD4BF]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#2DD4BF]">
                  Real Estate Intelligence Infrastructure &bull; Ahmedabad &amp; Gandhinagar
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] text-white">
                Know Every Property.<br />
                Understand Every Market.
              </h1>

              <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl leading-relaxed">
                PROVENTA is not a property listing portal or broker directory. It is an institutional real estate intelligence terminal uniting permanent property records, sourced market benchmarks, RERA project verification, IRR investment modeling, and private Property OS lifecycle management.
              </p>

              {/* Live Property Registry Search */}
              <form action="/property-intelligence" method="GET" className="pt-2 max-w-xl flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search Property ID (PV-PROP-...), address, project, or locality"
                    className="w-full h-11 pl-10 pr-3 bg-white text-[#0F172A] placeholder:text-[#64748B] text-xs rounded-xs focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors whitespace-nowrap"
                >
                  Search Registry
                </button>
              </form>

              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-white text-[#0F172A] hover:bg-[#E2E8F0] font-semibold rounded-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Intelligence Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/property-os"
                  className="px-5 py-2.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white font-semibold rounded-xs transition-colors"
                >
                  Explore Property OS
                </Link>
                <Link
                  href="/price"
                  className="px-4 py-2.5 text-[#2DD4BF] hover:text-white font-mono uppercase tracking-wider underline underline-offset-4"
                >
                  12-Factor Valuation &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2.5">
              <div className="relative aspect-[4/3] w-full border border-[#334155] bg-[#1E293B] overflow-hidden rounded-xs">
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                  alt="Institutional urban real estate and commercial skyline"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-[#0F172A]/95 border border-[#2DD4BF]/40 text-white px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em]">
                  Ahmedabad &bull; Gandhinagar &bull; GIFT City
                </div>
              </div>
              <p className="text-[11px] font-mono text-[#64748B] text-right">
                Every metric carries explicit source provenance, reporting period, and confidence classification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE INTELLIGENCE LAYERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="border-b border-[#E2E8F0] pb-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0F766E] font-bold">
            Five-Layer Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
            Structured intelligence across the entire property lifecycle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FIVE_LAYERS.map((layer) => {
            const Icon = layer.icon;
            return (
              <Link
                key={layer.code}
                href={layer.href}
                className="bg-white border border-[#E2E8F0] hover:border-[#0F766E] p-6 rounded-xs flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0F766E]">
                      {layer.code}
                    </span>
                    <Icon className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A]">{layer.title}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{layer.desc}</p>
                </div>
                <span className="text-xs font-semibold text-[#0F766E] inline-flex items-center gap-1">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}

          <Link
            href="/reports"
            className="bg-[#0F172A] text-white border border-[#1E293B] hover:border-[#2DD4BF] p-6 rounded-xs flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2DD4BF]">
                  REPORTS ENGINE
                </span>
                <FileText className="w-4 h-4 text-[#2DD4BF]" />
              </div>
              <h3 className="text-base font-bold text-white">7 Institutional PDF Reports</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Generate Property, Project, Locality, Investment Feasibility, Valuation, Portfolio Performance, and Market Comparison reports with methodology and limitations disclosed.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#2DD4BF] inline-flex items-center gap-1">
              <span>Explore Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* 3. PRIMARY COVERAGE: 13 AHMEDABAD & GANDHINAGAR CORRIDORS */}
      <section className="bg-white border-y border-[#E2E8F0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0F766E] font-bold">
                Primary Launch Geography
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-1">
                13 Ahmedabad, Gandhinagar &amp; Gujarat Growth Corridors
              </h2>
            </div>
            <Link
              href="/market-intelligence"
              className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] hover:text-[#0F766E] inline-flex items-center gap-1.5"
            >
              <span>Compare Localities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {AHMEDABAD_CORRIDORS.map((corridor) => (
              <Link
                key={corridor}
                href={`/market-intelligence?locality=${encodeURIComponent(corridor)}`}
                className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#0F172A] hover:text-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] rounded-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3 h-3 text-[#0F766E]" />
                <span>{corridor}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DATA INTEGRITY & PRIVACY COMMITMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0F172A] text-white border border-[#1E293B] p-8 sm:p-10 rounded-xs grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="text-sm font-bold text-white">Strict Privacy Isolation</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              Personal Property OS passports, deeds, leases, and financial logs are strictly private to the owner and never enter the public property registry.
            </p>
          </div>
          <div className="space-y-2">
            <Layers className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="text-sm font-bold text-white">Source Provenance First</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              Verified, unverified, user-submitted, and externally sourced records are always clearly distinguished. Insufficient data is stated honestly.
            </p>
          </div>
          <div className="space-y-2">
            <Calculator className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="text-sm font-bold text-white">Transparent Indicative Models</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              Automated valuations and IRR investment scenarios disclose every formula, assumption, and limitation without claiming certified statutory status.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

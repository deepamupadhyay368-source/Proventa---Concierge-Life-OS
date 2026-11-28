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
  Satellite,
  ChevronDown,
} from 'lucide-react';
import { SatelliteMapSection } from '@/components/real-estate/SatelliteMapSection';

const GUJARAT_CORRIDORS = [
  'Ahmedabad',
  'Gandhinagar',
  'GIFT City',
  'SG Highway',
  'Bodakdev',
  'Thaltej',
  'Science City',
  'Satellite',
  'Prahlad Nagar',
  'Bopal',
  'South Bopal',
  'Shela',
  'Gota',
  'Sanand',
  'Changodar',
];

const FIVE_LAYERS = [
  {
    code: 'LAYER 01',
    title: 'Living Property Registry',
    href: '/property-intelligence',
    icon: Database,
    image: '/images/proventa-residential-architecture-night.webp',
    imageAlt: 'Illuminated modern residential architecture at night',
    desc: 'Permanent PROVENTA Property IDs across Land → Project → Building → Unit → Property with source provenance, duplicate detection, and verification workflows.',
  },
  {
    code: 'LAYER 02',
    title: 'Market & Location Intelligence',
    href: '/market-intelligence',
    icon: TrendingUp,
    image: '/images/proventa-commercial-towers-night.webp',
    imageAlt: 'Illuminated commercial office towers in Indian financial district at night',
    desc: 'Sourced locality price benchmarks, rental yields, infrastructure status (Operational vs Under Construction vs Proposed), and side-by-side corridor comparisons.',
  },
  {
    code: 'LAYER 03',
    title: 'Project & RERA Intelligence',
    href: '/project-intelligence',
    icon: Building2,
    image: '/images/proventa-hero-night-skyline.webp',
    imageAlt: 'Ahmedabad and GIFT City twilight skyline',
    desc: 'Structured Gujarat RERA project profiles, developer records, construction milestones, and multi-project side-by-side comparison.',
  },
  {
    code: 'LAYER 04',
    title: 'Investment & Valuation Intelligence',
    href: '/investment-intelligence',
    icon: Calculator,
    image: '/images/proventa-commercial-towers-night.webp',
    imageAlt: 'Grade-A commercial real estate investment towers at night',
    desc: '12-factor carpet-area valuation engine plus institutional IRR, net yield, equity multiple, sensitivity matrices, and Conservative/Base/Optimistic scenarios.',
  },
  {
    code: 'LAYER 05',
    title: 'Property OS — Digital Passport',
    href: '/property-os',
    icon: FolderLock,
    image: '/images/proventa-aerial-corridor-night.webp',
    imageAlt: 'Aerial night view of illuminated urban expressway and residential sectors',
    desc: 'Strictly private owner portfolio management: property profiles, leases, tenants, expenses, maintenance logs, encrypted document vault, and lifecycle timelines.',
  },
];

export default function RealEstateIntelligenceHomePage() {
  return (
    <div className="font-sans bg-[#080E18] text-[#F5F7FA]">
      {/* 1. FULL-WIDTH CINEMATIC NIGHT ARCHITECTURE HERO */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-[#29384B]">
        {/* Full-bleed Night Architectural Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/proventa-hero-night-skyline.webp"
            alt="Illuminated modern Ahmedabad and GIFT City metropolitan skyline at night"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080E18]/95 via-[#080E18]/78 to-[#080E18]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-transparent to-[#080E18]/45" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2.5 border border-[#29384B] bg-[#101A29]/90 px-3 py-1.5 rounded-xs">
              <span className="w-2 h-2 bg-[#D7AD69]" />
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#AAB6C5]">
                Institutional Real Estate Intelligence &bull; Gujarat &amp; India
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[#F5F7FA] uppercase">
              KNOW EVERY PROPERTY.
              <br />
              <span className="text-[#4D9FFF]">UNDERSTAND EVERY MARKET.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#AAB6C5] max-w-2xl leading-relaxed">
              Discover property intelligence, track emerging markets and understand the forces shaping real estate investment.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/property-intelligence"
                className="px-6 py-3 bg-[#4D9FFF] hover:bg-[#3B8EEE] text-[#080E18] text-xs font-bold uppercase tracking-[0.1em] rounded-xs inline-flex items-center gap-2 transition-colors"
              >
                <span>Explore Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/market-intelligence"
                className="px-6 py-3 bg-[#152235]/90 hover:bg-[#1B2A3D] border border-[#29384B] text-[#F5F7FA] text-xs font-bold uppercase tracking-[0.1em] rounded-xs transition-colors"
              >
                Explore Market Intelligence
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-3 text-xs font-mono uppercase tracking-wider text-[#D7AD69] hover:text-[#F5F7FA] underline underline-offset-4 transition-colors"
              >
                Open Terminal &rarr;
              </Link>
            </div>

            {/* Live Property Registry Search */}
            <form
              action="/property-intelligence"
              method="GET"
              className="pt-4 max-w-xl flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#748398] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search Property ID (PV-PROP-...), address, project, or locality"
                  className="w-full h-11 pl-10 pr-3 bg-[#101A29]/95 border border-[#29384B] text-[#F5F7FA] placeholder:text-[#748398] text-xs rounded-xs focus:outline-none focus:border-[#4D9FFF]"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 bg-[#1B2A3D] hover:bg-[#29384B] border border-[#29384B] text-[#F5F7FA] text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors whitespace-nowrap"
              >
                Search Registry
              </button>
            </form>
          </div>
        </div>

        {/* Subtle Architectural-to-Satellite Transition Indicator */}
        <a
          href="#satellite-intelligence"
          aria-label="Scroll to Gujarat Satellite Intelligence"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 px-3 py-1.5 bg-[#101A29]/85 border border-[#29384B] text-[10px] font-mono uppercase tracking-[0.16em] text-[#AAB6C5] hover:text-[#F5F7FA] transition-colors"
        >
          <Satellite className="w-3.5 h-3.5 text-[#D7AD69]" />
          <span>Satellite Corridor Intelligence</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#4D9FFF]" />
        </a>
      </section>

      {/* 2. INTERACTIVE GUJARAT SATELLITE INTELLIGENCE SECTION */}
      <section
        id="satellite-intelligence"
        className="bg-[#080E18] border-b border-[#29384B] py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#D7AD69]">
                Geospatial Intelligence &bull; Ahmedabad &bull; Gandhinagar &bull; GIFT City &bull; Sanand &bull; Changodar
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
                Live Satellite &amp; Corridor Intelligence
              </h2>
              <p className="text-sm text-[#AAB6C5] leading-relaxed">
                Inspect real satellite imagery across Gujarat&apos;s primary residential, commercial, and industrial growth corridors. Every benchmark and project count is sourced directly from PROVENTA&apos;s verified database.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/location-intelligence"
                className="px-4 py-2 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-xs font-semibold text-[#F5F7FA] rounded-xs transition-colors"
              >
                Full Location Intelligence
              </Link>
              <Link
                href="/price"
                className="px-4 py-2 bg-[#101A29] hover:bg-[#152235] border border-[#29384B] text-xs font-mono text-[#4D9FFF] rounded-xs transition-colors"
              >
                12-Factor Valuation &rarr;
              </Link>
            </div>
          </div>

          <SatelliteMapSection />
        </div>
      </section>

      {/* 3. FIVE INSTITUTIONAL INTELLIGENCE LAYERS */}
      <section className="bg-[#101A29] border-b border-[#29384B] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#4D9FFF]">
                Platform Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
                Five Integrated Real Estate Intelligence Layers
              </h2>
              <p className="text-sm text-[#AAB6C5]">
                Built for property owners, institutional buyers, investors, developers, and advisors requiring verified evidence rather than broker listings.
              </p>
            </div>
            <Link
              href="/reports"
              className="px-4 py-2.5 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-xs font-semibold text-[#F5F7FA] rounded-xs inline-flex items-center gap-2 transition-colors self-start md:self-auto"
            >
              <FileText className="w-3.5 h-3.5 text-[#D7AD69]" />
              <span>Seven Institutional Report Types</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FIVE_LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <Link
                  key={layer.code}
                  href={layer.href}
                  className="group bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] rounded-xs overflow-hidden flex flex-col transition-colors"
                >
                  <div className="relative h-40 w-full overflow-hidden border-b border-[#29384B]">
                    <Image
                      src={layer.image}
                      alt={layer.imageAlt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#152235] via-[#080E18]/40 to-transparent" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#080E18]/90 border border-[#29384B] text-[10px] font-mono text-[#D7AD69]">
                      {layer.code}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#4D9FFF] shrink-0" />
                        <h3 className="text-base font-bold text-[#F5F7FA] group-hover:text-[#4D9FFF] transition-colors">
                          {layer.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#AAB6C5] leading-relaxed">{layer.desc}</p>
                    </div>
                    <div className="text-[11px] font-mono text-[#4D9FFF] inline-flex items-center gap-1">
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Governance & Evidence Standard Card */}
            <div className="bg-[#080E18] border border-[#29384B] rounded-xs p-6 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#D7AD69]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Fabrication Standard</span>
                </div>
                <h3 className="text-base font-bold text-[#F5F7FA]">
                  Evidence-Governed Real Estate Data
                </h3>
                <p className="text-xs text-[#AAB6C5] leading-relaxed">
                  Every price benchmark, rental yield, RERA milestone, and infrastructure record displays its verification status, source reference, and observation period. Where verified observations are insufficient, PROVENTA explicitly reports <code className="text-[#D7AD69]">INSUFFICIENT_DATA</code>.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#29384B]">
                <Link
                  href="/methodology"
                  className="text-xs font-mono text-[#4D9FFF] hover:underline"
                >
                  Read Methodology &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COVERED GUJARAT CORRIDORS STRIP */}
      <section className="bg-[#080E18] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4D9FFF]" />
              <h2 className="text-sm font-mono uppercase tracking-[0.16em] text-[#F5F7FA] font-semibold">
                Tracked Gujarat Growth Corridors
              </h2>
            </div>
            <Link
              href="/market-intelligence"
              className="text-xs font-mono text-[#D7AD69] hover:text-[#F5F7FA] transition-colors"
            >
              Compare All Corridors &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {GUJARAT_CORRIDORS.map((corridor) => (
              <Link
                key={corridor}
                href={`/market-intelligence?locality=${encodeURIComponent(corridor)}`}
                className="px-3 py-1.5 bg-[#101A29] hover:bg-[#152235] border border-[#29384B] hover:border-[#4D9FFF] text-xs font-mono text-[#AAB6C5] hover:text-[#F5F7FA] inline-flex items-center gap-1.5 rounded-xs transition-colors"
              >
                <MapPin className="w-3 h-3 text-[#4D9FFF]" />
                <span>{corridor}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

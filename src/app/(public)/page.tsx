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
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { CorporateMarketSnapshot } from '@/components/real-estate/CorporateMarketSnapshot';

const INTELLIGENCE_CATEGORIES = [
  {
    title: 'Property Intelligence',
    href: '/property-intelligence',
    icon: Building2,
    description:
      'Permanent PROVENTA Property IDs linking land, project, building, and unit records with transparent source provenance and verification history.',
  },
  {
    title: 'Market Intelligence',
    href: '/market-intelligence',
    icon: TrendingUp,
    description:
      'Verified locality price benchmarks, rental yields, reporting periods, and side-by-side micro-market comparisons across Ahmedabad and Gandhinagar.',
  },
  {
    title: 'Location Intelligence',
    href: '/location-intelligence',
    icon: MapPin,
    description:
      'Structured corridor dossiers detailing operational, under-construction, and proposed civic infrastructure without speculative claims.',
  },
];

const TRACKED_LOCATIONS = [
  { name: 'SG Highway', city: 'Ahmedabad', profile: 'Commercial & Mixed-Use Corridor' },
  { name: 'Bodakdev', city: 'Ahmedabad', profile: 'Prime West Residential' },
  { name: 'Thaltej', city: 'Ahmedabad', profile: 'Metro Terminus & Residential Hub' },
  { name: 'Science City', city: 'Ahmedabad', profile: 'North-West Growth Belt' },
  { name: 'Prahlad Nagar', city: 'Ahmedabad', profile: 'Grade-A Commercial & Residential' },
  { name: 'Bopal & South Bopal', city: 'Ahmedabad', profile: 'SP Ring Road Residential Belt' },
  { name: 'Shela', city: 'Ahmedabad', profile: 'South-West Residential Expansion' },
  { name: 'GIFT City', city: 'Gandhinagar', profile: 'IFSC Financial & Institutional Hub' },
  { name: 'Sanand & Changodar', city: 'Ahmedabad', profile: 'Industrial & Logistics Axis' },
];

export default function RealEstateIntelligenceHomePage() {
  return (
    <div className="font-sans bg-[#FFFFFF] text-[#202B38]">
      {/* SECTION 2 — HERO (PURE WHITE CORPORATE + DAYTIME COMMERCIAL ARCHITECTURE) */}
      <section className="bg-[#FFFFFF] border-b border-[#E8EBEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A58A61]">
                PROVENTA &bull; Real Estate Intelligence
              </p>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-[#202B38]">
                UNDERSTAND PROPERTY.
                <br />
                SEE BEYOND LOCATION.
              </h1>

              <p className="text-base text-[#697586] leading-relaxed max-w-xl">
                Explore property intelligence, understand market movements and evaluate locations through reliable real-estate information.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/property-intelligence"
                  className="px-6 py-3 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.08em] rounded-xs inline-flex items-center gap-2 transition-colors"
                >
                  <span>Explore Intelligence</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/market-intelligence"
                  className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold uppercase tracking-[0.08em] rounded-xs transition-colors"
                >
                  Explore Markets
                </Link>
              </div>

              {/* Clean Property Registry Search */}
              <form
                action="/property-intelligence"
                method="GET"
                className="pt-3 max-w-xl flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#929BA6] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search Property ID (PV-PROP-...), address, project, or locality"
                    className="w-full h-11 pl-10 pr-3 bg-[#F7F8FA] border border-[#E8EBEF] text-[#202B38] placeholder:text-[#929BA6] text-xs rounded-xs focus:outline-none focus:border-[#29465F] focus:bg-[#FFFFFF]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 bg-[#F3F5F7] hover:bg-[#E8EBEF] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold uppercase tracking-[0.08em] rounded-xs transition-colors whitespace-nowrap"
                >
                  Search Registry
                </button>
              </form>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full border border-[#E8EBEF] bg-[#F7F8FA] overflow-hidden">
                <Image
                  src="/images/proventa-corporate-hero.webp"
                  alt="Modern institutional commercial headquarters architecture in daylight"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#929BA6]">
                <span>Institutional Real Estate Registry &amp; Analytics</span>
                <span>Ahmedabad &bull; Gandhinagar &bull; GIFT City</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THREE INTELLIGENCE CATEGORY CARDS */}
      <section className="bg-[#F7F8FA] border-b border-[#E8EBEF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A58A61]">
              Core Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B38]">
              Structured Real Estate Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INTELLIGENCE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group bg-[#FFFFFF] border border-[#E8EBEF] hover:border-[#29465F] p-8 flex flex-col justify-between gap-6 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 bg-[#F3F5F7] border border-[#E8EBEF] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#29465F]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#202B38] group-hover:text-[#29465F] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-[#697586] leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="text-xs font-semibold text-[#29465F] inline-flex items-center gap-1.5">
                    <span>Explore {cat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTIONS 4 & 5 — LIVE PROJECT INTELLIGENCE & MARKET INTELLIGENCE */}
      <CorporateMarketSnapshot />

      {/* SECTION 6 — LOCATION INTELLIGENCE (CLEAN TABLES & ARCHITECTURAL PHOTOGRAPHY — ZERO SATELLITE) */}
      <section className="bg-[#FFFFFF] border-b border-[#E8EBEF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative aspect-[16/10] w-full border border-[#E8EBEF] bg-[#F7F8FA] overflow-hidden">
                <Image
                  src="/images/proventa-corporate-district.webp"
                  alt="Modern commercial business district boulevard in daylight"
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A58A61]">
                Location Intelligence
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B38]">
                Corridor Profiles &amp; Civic Infrastructure Status
              </h2>
              <p className="text-sm text-[#697586] leading-relaxed">
                Evaluate Ahmedabad, Gandhinagar, and GIFT City micro-markets through verified connectivity records, transit corridors, and clear separation between operational, under-construction, and proposed projects.
              </p>
              <div className="pt-2">
                <Link
                  href="/location-intelligence"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold rounded-xs transition-colors"
                >
                  <span>Inspect Locality Dossiers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#29465F]" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRACKED_LOCATIONS.map((loc) => (
              <Link
                key={loc.name}
                href={`/location-intelligence?locality=${encodeURIComponent(loc.name)}`}
                className="bg-[#F7F8FA] hover:bg-[#F3F5F7] border border-[#E8EBEF] p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-[#202B38]">{loc.name}</div>
                  <div className="text-xs text-[#697586] mt-0.5">
                    {loc.city} &bull; {loc.profile}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#29465F] shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — INVESTMENT INTELLIGENCE, PROPERTY OS & REPORTS */}
      <section className="bg-[#F7F8FA] border-b border-[#E8EBEF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A58A61]">
              Investment &amp; Portfolio Management
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B38]">
              Institutional Analysis &amp; Private Property OS
            </h2>
            <p className="text-sm text-[#697586]">
              Transparent financial modeling, 12-factor carpet-area valuation, private portfolio governance, and persisted PDF dossiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/investment-intelligence"
              className="bg-[#FFFFFF] border border-[#E8EBEF] hover:border-[#29465F] p-7 space-y-4 transition-colors"
            >
              <Calculator className="w-5 h-5 text-[#29465F]" />
              <h3 className="text-base font-bold text-[#202B38]">Investment Intelligence</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Model net rental yield, EMI schedules, IRR, equity multiples, and Conservative / Base / Optimistic scenarios with transparent assumptions.
              </p>
              <span className="inline-block text-xs font-semibold text-[#29465F]">
                Open Calculator &rarr;
              </span>
            </Link>

            <Link
              href="/property-os"
              className="bg-[#FFFFFF] border border-[#E8EBEF] hover:border-[#29465F] p-7 space-y-4 transition-colors"
            >
              <FolderLock className="w-5 h-5 text-[#29465F]" />
              <h3 className="text-base font-bold text-[#202B38]">Property OS</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Strictly private owner workspace for properties, leases, expenses, maintenance logs, and encrypted binary document storage.
              </p>
              <span className="inline-block text-xs font-semibold text-[#29465F]">
                Open Property OS &rarr;
              </span>
            </Link>

            <Link
              href="/reports"
              className="bg-[#FFFFFF] border border-[#E8EBEF] hover:border-[#29465F] p-7 space-y-4 transition-colors"
            >
              <FileText className="w-5 h-5 text-[#29465F]" />
              <h3 className="text-base font-bold text-[#202B38]">Institutional Reports</h3>
              <p className="text-xs text-[#697586] leading-relaxed">
                Generate and persist seven structured intelligence report types with audit-ready PDF export and source citations.
              </p>
              <span className="inline-block text-xs font-semibold text-[#29465F]">
                View Reports &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="bg-[#FFFFFF] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#287A55]">
            <ShieldCheck className="w-4 h-4" />
            <span>Evidence-Governed &bull; Independent &bull; Zero Broker Bias</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#202B38]">
            MAKE BETTER PROPERTY DECISIONS.
          </h2>
          <p className="text-sm sm:text-base text-[#697586] max-w-xl mx-auto">
            Create a PROVENTA account to access your Member Dashboard, track Gujarat corridors, manage private Property OS assets, and generate institutional reports.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-7 py-3 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold uppercase tracking-[0.1em] rounded-xs inline-flex items-center gap-2 transition-colors"
            >
              <span>Explore PROVENTA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/price"
              className="px-7 py-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E8EBEF] text-[#202B38] text-xs font-semibold uppercase tracking-[0.1em] rounded-xs transition-colors"
            >
              12-Factor Valuation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

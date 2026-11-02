import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  PieChart,
  Users,
  Coins,
  CreditCard,
  ArrowLeftRight,
  FileText,
  Target,
  Network,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building2,
  Globe2,
  Orbit,
  Cpu,
  Compass,
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';
import {
  ProventaObject,
  WealthTopology,
  KineticHeroTitle,
  KineticStatementStream,
  KineticStatCard,
  TimeLandscapes,
} from '@/components/wealth/art';

const MODULE_REGISTERS = [
  {
    code: 'REG-01',
    title: 'Family Wealth Cockpit',
    desc: 'Deterministic net worth calculations across personal and family scopes. Eliminates double-counting in joint co-ownership deeds.',
    icon: PieChart,
    href: '/dashboard',
    highlight: 'Gross vs Adjusted Net Worth',
  },
  {
    code: 'REG-02',
    title: 'Capital Asset Register',
    desc: 'Financial securities (demat, mutual funds, FDs, PF), physical real estate, precious metals, and unlisted business equity with audit logs.',
    icon: Coins,
    href: '/assets',
    highlight: 'Verified Title Deeds',
  },
  {
    code: 'REG-03',
    title: 'Debt & Facility Register',
    desc: 'Commercial term facilities, home mortgages, and credit lines. Tracks amortisation schedules and co-borrower liability shares.',
    icon: CreditCard,
    href: '/liabilities',
    highlight: 'Zero Intermediation',
  },
  {
    code: 'REG-04',
    title: 'Family Trust Workspaces',
    desc: 'Manage personal finances alongside multiple family trusts (parents, spouse, siblings) under strict cryptographic resource boundaries.',
    icon: Users,
    href: '/family',
    highlight: 'Strict RBAC Governance',
  },
  {
    code: 'REG-05',
    title: 'Encrypted Family Vault',
    desc: 'Secure repository for registered sale deeds, demat statements, policies, and wills. AI extraction with mandatory human approval.',
    icon: Lock,
    href: '/vault',
    highlight: 'Human Confirmation Standard',
  },
  {
    code: 'REG-06',
    title: 'Treasury & Cashflow Stream',
    desc: 'Operating inflows, living expenditure, and recurring obligations. Internal transfers between own accounts are isolated from totals.',
    icon: ArrowLeftRight,
    href: '/cashflow',
    highlight: 'Internal Transfer Isolation',
  },
  {
    code: 'REG-07',
    title: 'Protection & Policy Records',
    desc: 'Pure term life protection, health floaters, and property insurance with renewal countdown timers and verified nominee records.',
    icon: ShieldCheck,
    href: '/protection',
    highlight: 'Informational Only',
  },
  {
    code: 'REG-08',
    title: 'Capital Targets & Scenarios',
    desc: 'Heir education funds and retirement milestones. Run mathematical compound simulations with inflation-adjusted purchasing power.',
    icon: Target,
    href: '/goals',
    highlight: 'Deterministic Compound Math',
  },
  {
    code: 'REG-09',
    title: 'Corporate Ownership Map',
    desc: 'Multi-tier shareholdings (LLPs, Private Ltd, Holding Trusts). Resolves direct and indirect effective family ownership percentages.',
    icon: Network,
    href: '/business-ownership',
    highlight: 'Multi-Tier Cap-Table Graph',
  },
  {
    code: 'REG-10',
    title: 'Intergenerational Continuity',
    desc: 'Centralized directory of nominees, registered wills, emergency medical protocols, and essential advisor contacts (CA, Legal Counsel).',
    icon: FileText,
    href: '/continuity',
    highlight: 'Intergenerational Mandates',
  },
];

const SIGNATURE_SYSTEMS = [
  {
    number: '01',
    name: 'THE PROVENTA OBJECT',
    subtitle: '3D KINETIC LATTICE SCULPTURE',
    description: 'A procedural dual-lattice geometric projection engine reflecting capital equilibrium, asset composition, and balance sheet integrity.',
    accent: 'border-[#2457E8] text-[#2457E8]',
  },
  {
    number: '02',
    name: 'WEALTH TOPOLOGY',
    subtitle: 'SPATIAL CAPITAL MATRIX',
    description: 'An interactive structural topology connecting family trusts, trustees, operating entities, physical assets, and credit facilities.',
    accent: 'border-[#A9D8F5] text-[#A9D8F5]',
  },
  {
    number: '03',
    name: 'KINETIC TYPOGRAPHY',
    subtitle: 'ARCHITECTURAL TELEMETRY',
    description: 'High-density typographic layouts that dynamically adapt tracking, character offset, and coordinate data from live ledger telemetry.',
    accent: 'border-[#D5A85D] text-[#D5A85D]',
  },
  {
    number: '04',
    name: 'TIME LANDSCAPES',
    subtitle: 'MULTI-DECADAL HORIZONS',
    description: 'Dimensional elevation terrain modelling 30-year compounding trajectories, inflation erosion strata, and structural family milestones.',
    accent: 'border-[#2457E8] text-[#2457E8]',
  },
];

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F4F2ED] font-sans selection:bg-[#2457E8] selection:text-[#F4F2ED]">
      {/* 1. HERO SECTION: EXPERIMENTAL DIGITAL ART SHOWCASE */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#B9C1CC]/15">
        {/* Volumetric Glow & Spatial Grid Background */}
        <div className="absolute inset-0 spatial-grid opacity-25 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] volumetric-glow pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Architectural Kinetic Typography Title */}
          <KineticHeroTitle
            title="YOUR WEALTH. ONE LIVING SYSTEM."
            subtitle="An experimental digital architecture for family capital, sovereign estates, corporate equity, and multi-generational continuity."
            badge="SYS.VER // 2.5.0 — EXPERIMENTAL DIGITAL ART"
          />

          {/* Interactive Hero Proventa Object & Telemetry Console */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive 3D Proventa Object */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-sm bg-[#171B23]/70 border border-[#B9C1CC]/20 relative backdrop-blur-md">
              <div className="w-full flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#B9C1CC]/70 pb-3 border-b border-[#B9C1CC]/15">
                <span className="flex items-center gap-1.5 text-[#A9D8F5]">
                  <Compass className="w-3.5 h-3.5 text-[#2457E8]" />
                  SIGNATURE ASSET A // THE PROVENTA OBJECT
                </span>
                <span className="text-[#D5A85D]">DRAG CURSOR TO ROTATE 3D LATTICE</span>
              </div>

              {/* 3D Geometric Sculpture */}
              <div className="py-2">
                <ProventaObject size={440} healthScore={98} />
              </div>

              <div className="w-full flex items-center justify-between font-mono text-[10px] text-[#B9C1CC]/60 pt-3 border-t border-[#B9C1CC]/15">
                <span>MATHEMATICS: DUAL GOLDEN RATIO (φ=1.618)</span>
                <span>STATUS: EQUILIBRIUM ACTIVE</span>
              </div>
            </div>

            {/* Right Column: Hero Architecture Cockpit */}
            <div className="lg:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <KineticStatCard
                  code="CAPITAL.NET"
                  label="Verified Family Capital"
                  value="₹48.24 CR"
                  subvalue="INTEGER PAISE ACCURATE"
                  trend="+14.2% YOY"
                />
                <KineticStatCard
                  code="TRUSTS.ACTIVE"
                  label="Sovereign Entities"
                  value="04"
                  subvalue="2 TRUSTS // 2 PVT LTD"
                />
              </div>

              <div className="p-5 rounded-sm bg-[#171B23] border border-[#B9C1CC]/20 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#B9C1CC]/15 text-[#B9C1CC]">
                  <span className="text-[10px] tracking-widest text-[#2457E8] font-bold">
                    SYSTEM CAPABILITIES // ED-01
                  </span>
                  <span className="text-[#A9D8F5]">AIR-GAPPED</span>
                </div>
                <p className="text-[#B9C1CC] text-xs font-sans leading-relaxed">
                  Every family financial deed, corporate cap table, and liability tranche is modeled inside a deterministic living structure with zero third-party data sharing.
                </p>

                <div className="space-y-2 pt-1 font-mono text-[11px] text-[#F4F2ED]">
                  <div className="flex items-center justify-between py-1 border-b border-[#B9C1CC]/10">
                    <span className="text-[#B9C1CC]/70">FLOAT DRIFT:</span>
                    <span className="text-[#A9D8F5] font-bold">0.0000 PAISE (EXACT)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#B9C1CC]/10">
                    <span className="text-[#B9C1CC]/70">VAULT CIPHER:</span>
                    <span className="text-[#F4F2ED] font-bold">AES-GCM-256</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#B9C1CC]/70">DPDP COMPLIANCE:</span>
                    <span className="text-[#D5A85D] font-bold">STRICT RESIDENCY (MUMBAI)</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 font-mono text-xs">
                <Link
                  href="/onboarding"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2457E8] text-[#F4F2ED] hover:bg-[#1D4ED8] uppercase tracking-wider font-bold rounded-sm shadow-md shadow-[#2457E8]/20 transition-all"
                >
                  <span>Commence Intake</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#171B23] text-[#F4F2ED] hover:bg-[#252C38] uppercase tracking-wider font-bold border border-[#B9C1CC]/30 rounded-sm transition-all"
                >
                  Explore Cockpit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KINETIC STATEMENT STREAM */}
      <KineticStatementStream />

      {/* 3. SIGNATURE ASSET B: SPATIAL WEALTH TOPOLOGY */}
      <section className="py-20 lg:py-28 border-b border-[#B9C1CC]/15 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-10">
            <div className="font-mono text-xs uppercase tracking-wider text-[#2457E8] font-bold flex items-center gap-2">
              <Network className="w-4 h-4 text-[#2457E8]" />
              <span>SIGNATURE ASSET B // SPATIAL CAPITAL MATRIX</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED]">
              Wealth Topology
            </h2>
            <p className="text-sm sm:text-base text-[#B9C1CC] leading-relaxed">
              Explore your complete family universe as an interconnected spatial topology. Click any node to inspect balance sheets, legal ownership shares, and credit facilities.
            </p>
          </div>

          {/* Interactive Topology Component */}
          <WealthTopology />
        </div>
      </section>

      {/* 4. SIGNATURE ASSET D: TIME LANDSCAPES */}
      <section className="py-20 lg:py-28 border-b border-[#B9C1CC]/15 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-10">
            <div className="font-mono text-xs uppercase tracking-wider text-[#D5A85D] font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D5A85D]" />
              <span>SIGNATURE ASSET D // 30-YEAR MULTI-DECADAL HORIZON</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED]">
              Time Landscapes
            </h2>
            <p className="text-sm sm:text-base text-[#B9C1CC] leading-relaxed">
              Dimensional elevation terrain modelling historical trajectory, continuous compound accumulation, inflation erosion strata, and structural succession monoliths.
            </p>
          </div>

          {/* Interactive Time Landscapes Component */}
          <TimeLandscapes />
        </div>
      </section>

      {/* 5. TEN CODEX REGISTERS */}
      <section className="py-20 lg:py-28 border-b border-[#B9C1CC]/15 bg-[#171B23]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-14">
            <div className="font-mono text-xs uppercase tracking-wider text-[#2457E8] font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2457E8]" />
              <span>CODEX REGISTERS // COMPLETE PLATFORM ARSENAL</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED]">
              Ten Unified Registers. Zero Gaps.
            </h2>
            <p className="text-sm sm:text-base text-[#B9C1CC] leading-relaxed">
              Every dimension of Indian family wealth organized into connected, verifiable registers with zero duplicate accounting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {MODULE_REGISTERS.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.code}
                  href={mod.href}
                  className="group relative p-5 bg-[#171B23] border border-[#B9C1CC]/20 hover:border-[#2457E8] transition-all duration-300 rounded-sm flex flex-col justify-between overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#B9C1CC]/60 group-hover:text-[#A9D8F5] transition-colors">
                        [{mod.code}]
                      </span>
                      <Icon className="w-4 h-4 text-[#B9C1CC] group-hover:text-[#2457E8] transition-colors" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#F4F2ED] group-hover:text-[#A9D8F5] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#B9C1CC]/80 leading-relaxed line-clamp-3">
                      {mod.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#B9C1CC]/10 font-mono text-[10px] text-[#A9D8F5] font-semibold flex items-center justify-between">
                    <span>{mod.highlight}</span>
                    <ChevronRight className="w-3 h-3 text-[#B9C1CC] group-hover:text-[#2457E8] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. STATUTORY PRIVACY & AIR-GAPPED CIPHER */}
      <section id="privacy" className="py-20 lg:py-28 border-b border-[#B9C1CC]/15 bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="font-mono text-xs uppercase tracking-wider text-[#D5A85D] font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D5A85D]" />
                <span>STATUTORY COMPLIANCE // DPDP ACT 2023</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED] leading-tight">
                Zero commissions. Zero third-party telemetry.
              </h2>
              <p className="text-sm sm:text-base text-[#B9C1CC] leading-relaxed">
                PROVENTA is not a financial distributor or broker. We do not sell mutual funds, insurance policies, or investment products. You pay an institutional subscription for pure, uncompromised technology infrastructure.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-sm bg-[#171B23] border border-[#2457E8]/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#F4F2ED]">
                      Client-Side AES-GCM-256 Deed Encryption
                    </h4>
                    <p className="text-xs text-[#B9C1CC]/80 mt-0.5">
                      Your registered sale deeds, will documents, and demat account numbers are encrypted at rest with zero-knowledge keys.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-sm bg-[#171B23] border border-[#2457E8]/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#F4F2ED]">
                      Human Confirmation Protocol for AI
                    </h4>
                    <p className="text-xs text-[#B9C1CC]/80 mt-0.5">
                      AI agents extract and cross-reference documents, but no balance, nominee change, or execution is committed without explicit trustee review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-sm bg-[#171B23] border border-[#2457E8]/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#F4F2ED]">
                      Complete Data Portability & Erasure
                    </h4>
                    <p className="text-xs text-[#B9C1CC]/80 mt-0.5">
                      Export your complete financial universe into machine-readable JSON at any time, or trigger irreversible cryptographic deletion under DPDP Act provisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Shield Card */}
            <div className="lg:col-span-6 bg-[#171B23] border border-[#B9C1CC]/25 p-8 rounded-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#B9C1CC]/15">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#2457E8]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F4F2ED] font-bold">
                    SECURITY ARCHITECTURE // AIR-GAP
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-[#2457E8]/20 text-[#A9D8F5] border border-[#2457E8]/40 font-mono text-[10px] rounded-xs font-bold">
                  AUDITED
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[#080A0F] border border-[#B9C1CC]/15 rounded-sm flex items-center justify-between">
                  <span className="text-[#B9C1CC]">ENCRYPTION STANDARD:</span>
                  <span className="font-bold text-[#F4F2ED]">AES-GCM-256 + PBKDF2</span>
                </div>
                <div className="p-3.5 bg-[#080A0F] border border-[#B9C1CC]/15 rounded-sm flex items-center justify-between">
                  <span className="text-[#B9C1CC]">DATA RESIDENCY:</span>
                  <span className="font-bold text-[#F4F2ED]">Mumbai, India (AWS ap-south-1)</span>
                </div>
                <div className="p-3.5 bg-[#080A0F] border border-[#B9C1CC]/15 rounded-sm flex items-center justify-between">
                  <span className="text-[#B9C1CC]">MULTI-TENANCY:</span>
                  <span className="font-bold text-[#F4F2ED]">Row-Level Security (RLS)</span>
                </div>
                <div className="p-3.5 bg-[#080A0F] border border-[#B9C1CC]/15 rounded-sm flex items-center justify-between">
                  <span className="text-[#B9C1CC]">CALCULATION INTEGRITY:</span>
                  <span className="font-bold text-[#A9D8F5]">Integer Paise (Zero Floating Error)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/settings"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#080A0F] text-[#F4F2ED] hover:bg-[#252C38] border border-[#B9C1CC]/30 font-mono text-xs uppercase tracking-wider rounded-sm transition-colors"
                >
                  Inspect Governance & Privacy Protocols
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL PRICING SCHEDULES */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#171B23]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="font-mono text-xs uppercase tracking-wider text-[#2457E8] font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2457E8] animate-ping" />
              <span>INSTITUTIONAL MEMBERSHIP & LICENSING</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#F4F2ED]">
              Transparent, Flat Fiduciary Licensing.
            </h2>
            <p className="text-sm sm:text-base text-[#B9C1CC]">
              Zero percentage-based AUM management fees. Zero commissions. Pure infrastructure pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => {
              const isPopular = plan.recommended;
              return (
                <div
                  key={plan.tier}
                  className={`p-6 bg-[#171B23] border rounded-sm flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'border-[#2457E8] shadow-lg shadow-[#2457E8]/10 ring-1 ring-[#2457E8] relative'
                      : 'border-[#B9C1CC]/20 hover:border-[#B9C1CC]/50'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2457E8] text-[#F4F2ED] font-mono text-[10px] uppercase font-bold tracking-wider rounded-xs shadow-sm">
                      MOST RECOMMENDED
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#B9C1CC]/70">
                        {plan.tier.replace(/_/g, ' ')}
                      </div>
                      <h3 className="font-heading font-bold text-xl text-[#F4F2ED] mt-1">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#B9C1CC]/80 mt-1">
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#B9C1CC]/15">
                      <div className="font-heading font-black text-3xl text-[#F4F2ED]">
                        {plan.formattedPrice}
                      </div>
                      <div className="font-mono text-[10px] text-[#B9C1CC]/60">
                        Billed {plan.cadence}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#B9C1CC]/15 space-y-2">
                      <div className="font-mono text-[10px] uppercase text-[#B9C1CC]/70">
                        INCLUDED ENTITLEMENTS:
                      </div>
                      <ul className="space-y-2 font-mono text-xs text-[#B9C1CC]">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                          Up to {plan.limits.maxFamilyMembers} Family Members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                          Up to {plan.limits.maxWorkspaces} Trust Workspaces
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2457E8]" />
                          {plan.limits.storageMb >= 1024 ? `${plan.limits.storageMb / 1024} GB` : `${plan.limits.storageMb} MB`} Encrypted Vault
                        </li>
                        {plan.limits.canAccessScenarioSimulations && (
                          <li className="flex items-center gap-2 text-[#A9D8F5]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#A9D8F5]" />
                            Deterministic Scenario Engine
                          </li>
                        )}
                        {plan.limits.canAccessBusinessOwnership && (
                          <li className="flex items-center gap-2 text-[#D5A85D] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D5A85D]" />
                            Corporate Cap-Table Map
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/onboarding?tier=${plan.tier}`}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-colors ${
                        isPopular
                          ? 'bg-[#2457E8] text-[#F4F2ED] hover:bg-[#1D4ED8] shadow-sm'
                          : 'bg-[#080A0F] text-[#F4F2ED] hover:bg-[#252C38] border border-[#B9C1CC]/30'
                      }`}
                    >
                      <span>Select Tier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

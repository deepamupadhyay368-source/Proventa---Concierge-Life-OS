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
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

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
    title: 'Treasury & Cashflow',
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
    highlight: 'Estate Preservation',
  },
];

const AI_DESKS = [
  { role: 'Family Wealth Analyst', code: 'AGT-01', desc: 'Explains changes in recorded net worth, asset concentration, and historical performance with formula citations.' },
  { role: 'Asset Intelligence Desk', code: 'AGT-02', desc: 'Audits unverified records, outdated chartered valuations, and missing Index II documentation.' },
  { role: 'Cashflow Analyst', code: 'AGT-03', desc: 'Summarizes recurring debt service, savings ratios, and isolates internal transfers from operational metrics.' },
  { role: 'Document Intelligence Agent', code: 'AGT-04', desc: 'Extracts metadata from deeds and CAMS statements; requires explicit human confirmation before sealing as truth.' },
  { role: 'Goal & Scenario Agent', code: 'AGT-05', desc: 'Simulates hypothetical compound growth models with variable return assumptions and inflation discounting.' },
  { role: 'Family Assistant', code: 'AGT-06', desc: 'Private analytical interface answering inquiries strictly within authenticated permission boundaries.' },
];

export default function FamilyWealthLandingPage() {
  return (
    <div className="min-h-screen bg-[#F0EDE5] text-[#101010] selection:bg-[#101010] selection:text-[#F0EDE5] font-sans">
      {/* 1. HERO SECTION (MONUMENTAL NEO-INSTITUTIONAL COMPOSITION) */}
      <section className="border-b border-[#101010] bg-[#FAF9F6] pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Left 7 Columns: Editorial Headline */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-[0.25em]">
                <span>01 // THE WEALTH INSTITUTION</span>
                <span>/</span>
                <span>INDIA-FIRST INFRASTRUCTURE</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#101010] leading-[0.98]">
                Your wealth. <br />
                One living system.
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#85827B] max-w-2xl leading-relaxed">
                One individual identity. Multiple family relationships. One connected financial universe. The independent digital infrastructure for consolidated net worth, asset registers, and private wealth intelligence.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-mono text-xs">
                <Link
                  href="/onboarding"
                  className="px-8 py-4 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] uppercase tracking-wider font-semibold border border-[#101010] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Commence Institutional Intake</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-transparent text-[#101010] hover:bg-[#F0EDE5] uppercase tracking-wider font-semibold border border-[#101010] transition-colors text-center"
                >
                  Explore Terminal Console
                </Link>
              </div>

              {/* Protocol Guarantees */}
              <div className="pt-6 border-t border-[#101010]/15 flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#85827B]">
                <span className="flex items-center gap-1.5 text-[#101010]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#263B35]" />
                  Paise-Precision Arithmetic (Zero Drift)
                </span>
                <span className="flex items-center gap-1.5 text-[#101010]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#263B35]" />
                  Zero Double-Counting in Joint Titles
                </span>
                <span className="flex items-center gap-1.5 text-[#101010]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#263B35]" />
                  Digital Personal Data Protection Act 2023
                </span>
              </div>
            </div>

            {/* Right 4 Columns: Terminal Monolith Teaser */}
            <div className="lg:col-span-4 border border-[#101010] bg-[#101010] text-[#F0EDE5] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#B6A68A] border-b border-[#2A2925] pb-3">
                <span>PORTFOLIO TELEMETRY</span>
                <span>LIVE / AUDITED</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-[#85827B]">CONSOLIDATED FAMILY NET WORTH</div>
                <div className="font-serif text-4xl sm:text-5xl text-[#F0EDE5]">
                  ₹ 29,81,00,000
                </div>
              </div>
              <div className="pt-4 border-t border-[#2A2925] space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#85827B]">
                  <span>Gross Assets:</span>
                  <span className="text-[#F0EDE5]">₹ 31,90,00,000</span>
                </div>
                <div className="flex justify-between text-[#85827B]">
                  <span>Gross Debt:</span>
                  <span className="text-[#A63B32]">₹ 2,09,00,000</span>
                </div>
                <div className="flex justify-between text-[#85827B]">
                  <span>Trailing Return:</span>
                  <span className="text-[#263B35] font-semibold">+4.05% Annualized</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A2925] font-mono text-[10px] text-[#85827B]">
                Calculated deterministically without floating-point error.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PHILOSOPHY OF THE WEALTH INSTITUTION (3 ARCHITECTURAL BLOCKS) */}
      <section className="border-b border-[#101010] bg-[#F0EDE5] py-16 sm:py-24">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#85827B]">
              02 // PRODUCT PHILOSOPHY &amp; FOUNDATION
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight">
              Privacy by Design. Connected by Choice.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#85827B] leading-relaxed">
              Traditional platforms either silo information in single bank logins or expose all data without boundary controls. PROVENTA introduces sovereign personal accounts mapped to multi-family holding trusts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#101010] border border-[#101010] bg-[#FAF9F6]">
            <div className="p-8 space-y-3">
              <div className="font-mono text-xs text-[#85827B]">01 / SOVEREIGNTY</div>
              <h3 className="font-serif text-2xl text-[#101010]">Multi-Family Workspaces</h3>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Participate in your individual universe, your parents&apos; family trust, and joint spousal holdings without leaking private personal assets across boundaries.
              </p>
            </div>

            <div className="p-8 space-y-3">
              <div className="font-mono text-xs text-[#85827B]">02 / MATHEMATICS</div>
              <h3 className="font-serif text-2xl text-[#101010]">Zero Double-Counting</h3>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                Joint assets (e.g., real estate owned 60/40 between family members) appear in full consolidated view, but reflect exact proportional equity in individual scopes.
              </p>
            </div>

            <div className="p-8 space-y-3">
              <div className="font-mono text-xs text-[#85827B]">03 / AUTHORITY</div>
              <h3 className="font-serif text-2xl text-[#101010]">Human Confirmation Standard</h3>
              <p className="font-sans text-xs text-[#85827B] leading-relaxed">
                AI parses deeds, Demat CAMS statements, and tax returns, but never promotes extracted values to verified fact without your explicit human approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 10 ARCHITECTURAL REGISTERS */}
      <section className="border-b border-[#101010] bg-[#FAF9F6] py-16 sm:py-24">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#101010] pb-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#85827B]">
                03 // COMPREHENSIVE ARCHITECTURE
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
                10 Interconnected Living Registers
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="font-mono text-xs uppercase tracking-wider text-[#101010] underline flex items-center gap-1.5 hover:text-[#263B35]"
            >
              <span>Inspect All Modules in Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {MODULE_REGISTERS.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.code}
                  className="p-6 border border-[#101010] bg-[#FAF9F6] flex flex-col justify-between space-y-4 hover:bg-[#F0EDE5] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#85827B]">{mod.code}</span>
                      <span className="px-1.5 py-0.2 border border-[#101010] uppercase text-[9px]">
                        {mod.highlight}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-[#101010] leading-snug">{mod.title}</h3>
                    <p className="font-sans text-xs text-[#85827B] leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-[#101010]/15">
                    <Link
                      href={mod.href}
                      className="font-mono text-[11px] uppercase tracking-wider text-[#101010] hover:underline flex items-center justify-between"
                    >
                      <span>Access Register</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MULTI-AGENT RESEARCH CONSOLE */}
      <section className="border-b border-[#101010] bg-[#101010] text-[#F0EDE5] py-16 sm:py-24">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B6A68A]">
              04 // PROVENTA INTELLIGENCE CONSOLE
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#F0EDE5] tracking-tight">
              6 Specialized Financial Research Desks
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#85827B] leading-relaxed">
              Zero conversational hallucinations. Each specialized agent operates within authenticated permission scopes, cites exact database records, and complies with financial safety guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_DESKS.map((agent) => (
              <div
                key={agent.role}
                className="p-6 border border-[#2A2925] bg-[#070707] space-y-3"
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-[#B6A68A]">
                  <span>{agent.code}</span>
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-serif text-xl text-[#F0EDE5]">{agent.role}</h4>
                <p className="font-sans text-xs text-[#85827B] leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING & LICENSING SECTION */}
      <section className="border-b border-[#101010] bg-[#FAF9F6] py-16 sm:py-24">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#101010] pb-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#85827B]">
                05 // LICENSING &amp; ENTITLEMENTS
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#101010] tracking-tight mt-1">
                Transparent Institutional Licensing
              </h2>
            </div>
            <Link
              href="/pricing"
              className="font-mono text-xs uppercase tracking-wider text-[#101010] underline flex items-center gap-1.5 hover:text-[#263B35]"
            >
              <span>Compare All 4 Plans In-Depth</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
              <div
                key={plan.tier}
                className={`p-8 border border-[#101010] flex flex-col justify-between ${
                  plan.recommended
                    ? 'bg-[#101010] text-[#F0EDE5] shadow-[6px_6px_0px_0px_#263B35]'
                    : 'bg-[#FAF9F6] text-[#101010]'
                }`}
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider">
                    {plan.recommended ? (
                      <span className="text-[#B6A68A]">RECOMMENDED TIER</span>
                    ) : (
                      <span className="text-[#85827B]">{plan.tier}</span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl mt-2">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1 border-b border-current pb-4">
                    <span className="text-3xl font-serif">{plan.formattedPrice}</span>
                    <span className="font-mono text-xs opacity-75">{plan.cadence}</span>
                  </div>
                  <ul className="mt-6 space-y-2 font-mono text-xs">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.recommended ? 'text-[#B6A68A]' : 'text-[#263B35]'}`} />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-current">
                  <Link
                    href={`/onboarding?tier=${plan.tier}`}
                    className={`w-full py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-center block transition-colors border ${
                      plan.recommended
                        ? 'bg-[#FAF9F6] text-[#101010] border-[#FAF9F6] hover:bg-[#263B35] hover:text-[#FAF9F6]'
                        : 'bg-[#101010] text-[#F0EDE5] border-[#101010] hover:bg-[#263B35]'
                    }`}
                  >
                    License Tier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STATUTORY DPDP ACT & DATA SOVEREIGNTY BANNER */}
      <section className="bg-[#FAF9F6] py-16 sm:py-20 border-b border-[#101010]">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#101010] bg-[#F0EDE5] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-wider text-[#263B35] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#263B35]" />
                <span>INDIAN DATA SOVEREIGNTY ARCHITECTURE</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl text-[#101010]">
                Engineered for India&apos;s Digital Personal Data Protection Act 2023
              </h3>
              <p className="font-sans text-xs sm:text-sm text-[#85827B] leading-relaxed">
                Bank credentials or OTPs are never stored. Private documents use short-lived client-side signed URLs. Export all family financial data in open machine-readable format or exercise your right to irreversible erasure at any time.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3 font-mono text-xs">
              <Link
                href="/onboarding"
                className="px-6 py-3.5 bg-[#101010] text-[#F0EDE5] hover:bg-[#263B35] uppercase tracking-wider font-semibold border border-[#101010] transition-colors"
              >
                Commence Intake
              </Link>
              <Link
                href="/settings"
                className="px-6 py-3.5 bg-transparent text-[#101010] hover:bg-[#FAF9F6] uppercase tracking-wider font-semibold border border-[#101010] transition-colors text-center"
              >
                Inspect Privacy Specs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

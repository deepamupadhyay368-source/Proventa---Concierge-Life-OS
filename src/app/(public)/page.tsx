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
  BrainCircuit,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG, FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

const MODULE_CARDS = [
  {
    number: '01',
    title: 'Family Wealth Dashboard',
    desc: 'Deterministic net worth calculations across personal and family scopes. Prevents double-counting in joint holdings.',
    icon: PieChart,
    href: '/dashboard',
    highlight: 'Consolidated & Adjusted Net Worth',
  },
  {
    number: '02',
    title: 'Asset Register',
    desc: 'Financial (FDs, mutual funds, stocks, PF, NPS), physical (real estate, gold), and business equity holdings with valuation audit trails.',
    icon: Coins,
    href: '/assets',
    highlight: 'Verified vs Estimated Tracking',
  },
  {
    number: '03',
    title: 'Liability & Debt Register',
    desc: 'Mortgages, vehicle loans, and credit lines. Tracks outstanding principal balances, EMIs, and co-borrower liability shares.',
    icon: CreditCard,
    href: '/liabilities',
    highlight: 'Zero Lending Intermediation',
  },
  {
    number: '04',
    title: 'Family Workspaces',
    desc: 'Manage personal finances plus multiple family relationships (parents, spouse, siblings) with strict resource permission boundaries.',
    icon: Users,
    href: '/family',
    highlight: 'Granular Role-Based Access',
  },
  {
    number: '05',
    title: 'Family Vault',
    desc: 'Encrypted document repository for title deeds, demat statements, policies, and wills with AI-assisted metadata extraction requiring user confirmation.',
    icon: Lock,
    href: '/vault',
    highlight: 'Human Confirmation Standard',
  },
  {
    number: '06',
    title: 'Cashflow Intelligence',
    desc: 'Inflows, outflows, and recurring obligations. Internal account transfers are filtered out to prevent artificial metric inflation.',
    icon: ArrowLeftRight,
    href: '/cashflow',
    highlight: 'Internal Transfer Isolation',
  },
  {
    number: '07',
    title: 'Protection & Insurance',
    desc: 'Life, health, property, and vehicle policies. Timely renewal reminders, sum assured totals, and nominee records. Informational only.',
    icon: ShieldCheck,
    href: '/protection',
    highlight: 'Proactive Renewal Alerts',
  },
  {
    number: '08',
    title: 'Goals & Scenarios',
    desc: 'Children education funds, property purchases, and retirement. Run mathematical compound simulations with inflation adjustments.',
    icon: Target,
    href: '/goals',
    highlight: 'Deterministic Math Scenarios',
  },
  {
    number: '09',
    title: 'Business & Ownership',
    desc: 'Multi-tier corporate shareholdings (LLPs, Private Ltd, Holding Trusts). Calculates direct vs indirect effective family ownership.',
    icon: Network,
    href: '/business-ownership',
    highlight: 'Visual Shareholding Graph',
  },
  {
    number: '10',
    title: 'Family Continuity',
    desc: 'Digital repository of nominees, registered wills, emergency medical instructions, and essential advisor directory (CA, Lawyer, Doctor).',
    icon: FileText,
    href: '/continuity',
    highlight: 'Generational Preservation',
  },
];

const AI_AGENTS = [
  { role: 'Family Wealth Analyst', desc: 'Explains changes in recorded net worth, asset concentration, and historical performance.' },
  { role: 'Asset Intelligence Agent', desc: 'Identifies unverified records, outdated valuations, and missing documentation.' },
  { role: 'Cashflow Analyst', desc: 'Summarizes recurring obligations, savings rates, and flags irregular expenditure.' },
  { role: 'Document Intelligence Agent', desc: 'Extracts metadata from deeds and statements; requires human confirmation before saving.' },
  { role: 'Goal & Scenario Agent', desc: 'Simulates hypothetical compound growth models (+₹20k/mo savings or interest shifts).' },
  { role: 'Family Assistant', desc: 'Private conversational interface for family financial queries with strict permission scoping.' },
];

export default function FamilyWealthLandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8F9FD] selection:bg-[#7C3AED] selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 border-b border-[#1E293B]">
        {/* Subtle radial lighting gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#2A164D]/40 via-[#1E1035]/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E1035] border border-[#3E236E] text-xs font-mono tracking-widest uppercase text-[#DDD0F7] shadow-lg shadow-[#1E1035]/50">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              INDIA-FIRST FAMILY FINANCIAL INFRASTRUCTURE
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.02]">
              Your wealth. <br />
              <span className="bg-gradient-to-r from-[#DDD0F7] via-[#A78BFA] to-[#C084FC] bg-clip-text text-transparent">
                One living system.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#9D8BC9] font-light max-w-2xl mx-auto leading-relaxed">
              One individual identity. Multiple family relationships. One connected financial universe. Complete granular control over who sees what.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] transition-all shadow-xl shadow-[#7C3AED]/30 hover:scale-[1.02]"
              >
                Set Up Family Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider text-[#DDD0F7] bg-[#1E1035] hover:bg-[#2A164D] border border-[#3E236E] transition-all hover:scale-[1.02]"
              >
                Explore Live Console
              </Link>
            </div>

            {/* Protocol Guarantees Pill */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#94A3B8] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Deterministic Paise Precision
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Zero Double-Counting
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                DPDP Privacy Architecture
              </span>
            </div>
          </div>

          {/* Interactive Telemetry Preview Graphic */}
          <div className="mt-16 rounded-2xl border border-[#2D1854] bg-[#0E1322]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1E293B] gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
                  Sharma Family Trust & Holdings // Consolidated Living Telemetry
                </div>
                <div className="text-3xl sm:text-4xl font-serif text-white mt-1">
                  ₹29,81,00,000{' '}
                  <span className="text-xs font-mono text-[#10B981] ml-2 px-2 py-0.5 rounded bg-[#064E3B]/40 border border-[#10B981]/30">
                    +4.05% Annualized
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-[#9D8BC9]">Gross Assets</div>
                  <div className="text-lg font-semibold text-white">₹31,90,00,000</div>
                </div>
                <div className="h-8 w-[1px] bg-[#1E293B]" />
                <div className="text-right">
                  <div className="text-xs text-[#9D8BC9]">Gross Liabilities</div>
                  <div className="text-lg font-semibold text-[#F43F5E]">₹2,09,00,000</div>
                </div>
              </div>
            </div>

            {/* Asset Allocation Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-[#9D8BC9] font-mono">
                <span>Asset Allocation Distribution</span>
                <span>100% Deterministic Attribution</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#1E293B] overflow-hidden flex">
                <div style={{ width: '45%' }} className="bg-[#7C3AED] h-full" title="Physical Assets (45%)" />
                <div style={{ width: '30%' }} className="bg-[#10B981] h-full" title="Financial Investments (30%)" />
                <div style={{ width: '25%' }} className="bg-[#F59E0B] h-full" title="Business Holdings (25%)" />
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                <span className="flex items-center gap-2 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  Physical Properties & Gold (45%)
                </span>
                <span className="flex items-center gap-2 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  Financial Securities & Mutual Funds (30%)
                </span>
                <span className="flex items-center gap-2 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  Business Equity (25%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PHILOSOPHY SECTION */}
      <section id="living-system" className="py-20 sm:py-28 border-b border-[#1E293B] bg-[#070A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#A78BFA]">
              THE PHILOSOPHY OF FAMILY FINANCIAL INFRASTRUCTURE
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white">
              Privacy by design. Connected by choice.
            </h2>
            <p className="text-[#9D8BC9] text-base sm:text-lg font-light leading-relaxed">
              Traditional finance either locks information in isolated personal accounts or exposes everything without boundaries. PROVENTA introduces individual sovereignty with granular family visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E1035] border border-[#3E236E] flex items-center justify-center text-[#A78BFA]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Multiple Family Workspaces</h3>
              <p className="text-sm text-[#9D8BC9] font-light leading-relaxed">
                Participate in your personal workspace, your parents&apos; family trust, and your spouse&apos;s holdings without exposing your private assets across boundaries.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E1035] border border-[#3E236E] flex items-center justify-center text-[#A78BFA]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Zero Double-Counting</h3>
              <p className="text-sm text-[#9D8BC9] font-light leading-relaxed">
                Joint assets (like a home owned 60/40 between father and son) are calculated with mathematical precision. Full value appears in family view, but only proportional equity appears in personal views.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E1035] border border-[#3E236E] flex items-center justify-center text-[#A78BFA]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Human Confirmation Standard</h3>
              <p className="text-sm text-[#9D8BC9] font-light leading-relaxed">
                AI extracts metadata from deeds and statements, but never marks values as authoritative facts until an authorized family member confirms them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10 PLATFORM MODULES SHOWCASE */}
      <section id="modules" className="py-20 sm:py-32 border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#A78BFA]">
                COMPLETE ARCHITECTURE
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-white mt-2">
                10 Interconnected Living Modules
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[#A78BFA] hover:text-white font-medium transition-colors"
            >
              Open all modules in Console <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULE_CARDS.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.number}
                  className="group relative p-7 rounded-2xl bg-[#0E1322]/80 border border-[#1E293B] hover:border-[#3E236E] transition-all hover:shadow-xl hover:shadow-[#1E1035]/30 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#A78BFA] tracking-widest">{mod.number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E1035] text-[#DDD0F7] border border-[#3E236E]">
                        {mod.highlight}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#DDD0F7] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#9D8BC9] font-light leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-[#1E293B]/60 flex items-center justify-between">
                    <Link
                      href={mod.href}
                      className="text-xs font-semibold text-[#A78BFA] group-hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      Explore Module <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MULTI-AGENT AI INTELLIGENCE */}
      <section id="intelligence" className="py-20 sm:py-32 border-b border-[#1E293B] bg-[#070A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              SPECIALIZED MULTI-AGENT ORCHESTRATOR
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white">
              6 Specialized Financial AI Agents
            </h2>
            <p className="text-[#9D8BC9] text-base font-light leading-relaxed">
              No generic chatbot hallucinations. Each agent operates with permission-scoped retrieval, cites verified calculations, and adheres to strict regulatory boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_AGENTS.map((agent, i) => (
              <div
                key={agent.role}
                className="p-6 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1E1035] flex items-center justify-center text-[#A78BFA] text-xs font-mono font-bold">
                    0{i + 1}
                  </div>
                  <h4 className="text-base font-semibold text-white">{agent.role}</h4>
                </div>
                <p className="text-xs text-[#9D8BC9] font-light leading-relaxed">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 sm:py-32 border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#A78BFA]">
              TRANSPARENT FREEMIUM PRICING
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white">
              Scalable for every family stage
            </h2>
            <p className="text-[#9D8BC9] text-base font-light leading-relaxed">
              Start with a personal workspace for free. Upgrade to connected family workspaces as your holdings and generational planning expand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
              <div
                key={plan.tier}
                className={`p-7 rounded-2xl flex flex-col justify-between border ${
                  plan.recommended
                    ? 'bg-gradient-to-b from-[#1E1035] to-[#0E1322] border-[#7C3AED] shadow-xl shadow-[#7C3AED]/20 relative'
                    : 'bg-[#0E1322] border-[#1E293B]'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-mono uppercase tracking-widest font-bold">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{plan.name}</div>
                  <div className="text-xs text-[#9D8BC9] mt-1">{plan.tagline}</div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-bold text-white">{plan.formattedPrice}</span>
                    <span className="text-xs text-[#9D8BC9] font-mono">{plan.cadence}</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#9D8BC9]">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1E293B]">
                  <Link
                    href={`/onboarding?tier=${plan.tier}`}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-center block transition-all ${
                      plan.recommended
                        ? 'bg-[#7C3AED] text-white hover:bg-[#8B5CF6]'
                        : 'bg-[#1E1035] text-[#DDD0F7] hover:bg-[#2A164D] border border-[#3E236E]'
                    }`}
                  >
                    Select Plan
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECURITY & DPDP COMPLIANCE BANNER */}
      <section id="security" className="py-20 border-b border-[#1E293B] bg-[#070A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#1E1035]/60 via-[#0B0F19] to-[#1E1035]/60 border border-[#3E236E] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#10B981]">
                <ShieldCheck className="w-4 h-4" />
                ENTERPRISE-GRADE SECURITY & DATA SOVEREIGNTY
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Engineered for India&apos;s Digital Personal Data Protection Act
              </h3>
              <p className="text-sm text-[#9D8BC9] font-light leading-relaxed">
                Bank credentials or OTPs are never stored. Private documents use short-lived signed URLs. Export all family financial data or exercise your right to erasure at any moment.
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-4">
              <Link
                href="/onboarding"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all"
              >
                Create Account
              </Link>
              <Link
                href="/trust"
                className="px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#DDD0F7] bg-[#1E1035] border border-[#3E236E] hover:bg-[#2A164D] transition-all"
              >
                Security Specs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

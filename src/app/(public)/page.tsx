import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  PieChart,
  Coins,
  CreditCard,
  FileText,
  CheckCircle2,
  TrendingUp,
  Building2,
  Users,
} from 'lucide-react';
import { ProventaObject } from '@/components/wealth/art/ProventaObject';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans selection:bg-[#2457FF] selection:text-white">
      {/* 1. HERO SECTION: BOLD, CLEAN, PREMIUM */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-36 border-b border-[#252C38]">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#2457FF]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Institutional Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#171C26] border border-[#252C38] rounded-xs font-mono text-[11px] tracking-wider uppercase text-[#C5CAD3]">
                <span className="w-2 h-2 rounded-full bg-[#2457FF] animate-pulse" />
                <span className="text-[#F4F6FA] font-bold">PROVENTA</span>
                <span className="text-[#858D9B]">/</span>
                <span>Financial Intelligence Platform</span>
              </div>

              {/* Exact Homepage Headline */}
              <h1 className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#F4F6FA] leading-[0.98] uppercase">
                Financial
                <br />
                <span className="text-[#2457FF]">Intelligence.</span>
              </h1>

              {/* Exact Supporting Text */}
              <p className="text-xl sm:text-2xl text-[#C5CAD3] max-w-2xl font-normal leading-relaxed">
                Everything you own, owe and plan. Unified for individuals and families with verified precision.
              </p>

              {/* Primary Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F4F6FA] text-[#090B10] hover:bg-white font-semibold text-sm tracking-wider uppercase rounded-xs transition-all shadow-md group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#171C26] text-[#F4F6FA] hover:bg-[#252C38] border border-[#252C38] font-semibold text-sm tracking-wider uppercase rounded-xs transition-colors"
                >
                  Explore Platform
                </Link>
              </div>

              {/* Fiduciary Signals */}
              <div className="pt-4 flex flex-wrap items-center gap-6 font-mono text-xs text-[#858D9B]">
                <span className="flex items-center gap-2 text-[#C5CAD3]">
                  <CheckCircle2 className="w-4 h-4 text-[#2457FF]" />
                  Exact Rupee Math (0 Float Drift)
                </span>
                <span>•</span>
                <span className="flex items-center gap-2 text-[#C5CAD3]">
                  <ShieldCheck className="w-4 h-4 text-[#2457FF]" />
                  DPDP Act 2023 Compliant
                </span>
                <span>•</span>
                <span className="flex items-center gap-2 text-[#C5CAD3]">
                  <Lock className="w-4 h-4 text-[#2457FF]" />
                  Zero Commissions
                </span>
              </div>
            </div>

            {/* Right: Original 3D Proventa Sculpture (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative p-6 rounded-xs bg-[#171C26]/60 border border-[#252C38] backdrop-blur-sm shadow-xl">
                <ProventaObject size={420} healthScore={98} />
                <div className="mt-4 pt-3 border-t border-[#252C38] flex items-center justify-between font-mono text-[10px] text-[#858D9B]">
                  <span>THE PROVENTA OBJECT</span>
                  <span className="text-[#2457FF] font-bold">INTERACTIVE 3D FORM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PLATFORM: 4 CONNECTED PILLARS */}
      <section id="platform" className="py-24 lg:py-32 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[#2457FF] font-bold">
              01 // THE PLATFORM
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#F4F6FA]">
              Four Connected Pillars.
            </h2>
            <p className="text-lg text-[#C5CAD3] leading-relaxed">
              Consolidate your family balance sheet, debts, legal documents, and succession directives into one clear view.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Assets */}
            <div className="p-8 bg-[#171C26] border border-[#252C38] rounded-xs space-y-6 hover:border-[#2457FF] transition-colors">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center text-[#2457FF]">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#858D9B]">
                  PILLAR 01
                </span>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#F4F6FA]">
                  Capital Assets
                </h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Real estate, demat accounts, private company equity, and physical gold tracked in real time.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252C38]">
                <Link
                  href="/assets"
                  className="font-mono text-xs uppercase tracking-wider text-[#2457FF] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Explore Assets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Liabilities */}
            <div className="p-8 bg-[#171C26] border border-[#252C38] rounded-xs space-y-6 hover:border-[#2457FF] transition-colors">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center text-[#2457FF]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#858D9B]">
                  PILLAR 02
                </span>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#F4F6FA]">
                  Debt &amp; Facilities
                </h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Home mortgages, vehicle loans, and business credit lines with precise amortisation schedules.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252C38]">
                <Link
                  href="/liabilities"
                  className="font-mono text-xs uppercase tracking-wider text-[#2457FF] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Explore Debt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Vault */}
            <div className="p-8 bg-[#171C26] border border-[#252C38] rounded-xs space-y-6 hover:border-[#2457FF] transition-colors">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center text-[#2457FF]">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#858D9B]">
                  PILLAR 03
                </span>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#F4F6FA]">
                  Encrypted Vault
                </h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Property deeds, share certificates, and wills stored securely with bank-grade AES-256 encryption.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252C38]">
                <Link
                  href="/vault"
                  className="font-mono text-xs uppercase tracking-wider text-[#2457FF] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Open Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 4: Continuity */}
            <div className="p-8 bg-[#171C26] border border-[#252C38] rounded-xs space-y-6 hover:border-[#2457FF] transition-colors">
              <div className="w-12 h-12 bg-[#090B10] border border-[#252C38] rounded-xs flex items-center justify-center text-[#2457FF]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#858D9B]">
                  PILLAR 04
                </span>
                <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#F4F6FA]">
                  Continuity &amp; Trust
                </h3>
                <p className="text-sm text-[#C5CAD3] leading-relaxed">
                  Registered nominees, advisor contacts, and intergenerational succession instructions in one place.
                </p>
              </div>
              <div className="pt-4 border-t border-[#252C38]">
                <Link
                  href="/continuity"
                  className="font-mono text-xs uppercase tracking-wider text-[#2457FF] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Explore Continuity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOR FAMILIES: SIMPLE & TRUSTED */}
      <section id="families" className="py-24 lg:py-32 border-b border-[#252C38] bg-[#171C26]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[#2457FF] font-bold">
              02 // FOR FAMILIES
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#F4F6FA]">
              Designed for Families. Not Financial Brokers.
            </h2>
            <p className="text-lg text-[#C5CAD3] leading-relaxed">
              We build pure financial technology. We do not sell mutual funds, take commissions, or share your private data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#090B10] border border-[#252C38] rounded-xs space-y-4">
              <div className="text-3xl font-heading font-black text-[#2457FF]">01</div>
              <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[#F4F6FA]">
                Zero Commissions
              </h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                You pay a flat, transparent annual software fee. We have no incentive to push products or steer your investments.
              </p>
            </div>

            <div className="p-8 bg-[#090B10] border border-[#252C38] rounded-xs space-y-4">
              <div className="text-3xl font-heading font-black text-[#2457FF]">02</div>
              <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[#F4F6FA]">
                Exact Rupee Math
              </h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                Every calculation is computed in integer paise. No rounding errors, no floating-point approximations.
              </p>
            </div>

            <div className="p-8 bg-[#090B10] border border-[#252C38] rounded-xs space-y-4">
              <div className="text-3xl font-heading font-black text-[#2457FF]">03</div>
              <h3 className="font-heading font-bold text-xl uppercase tracking-tight text-[#F4F6FA]">
                Data Sovereignty
              </h3>
              <p className="text-sm text-[#C5CAD3] leading-relaxed">
                All data is encrypted and hosted in Mumbai under India&apos;s Digital Personal Data Protection Act 2023. You own your data forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING: SIMPLE, FLAT MEMBERSHIP */}
      <section id="pricing" className="py-24 lg:py-32 border-b border-[#252C38] bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-[#2457FF] font-bold">
              03 // TRANSPARENT PRICING
            </div>
            <h2 className="font-heading font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#F4F6FA]">
              Flat Annual Membership.
            </h2>
            <p className="text-lg text-[#C5CAD3]">
              No percentage of assets under management. No surprise fees. Simple flat pricing for life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => {
              const isPopular = plan.recommended;
              return (
                <div
                  key={plan.tier}
                  className={`p-8 bg-[#171C26] border rounded-xs flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'border-[#2457FF] ring-1 ring-[#2457FF] shadow-lg relative'
                      : 'border-[#252C38] hover:border-[#858D9B]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#2457FF] text-white font-mono text-[9px] uppercase font-bold tracking-widest rounded-xs">
                      RECOMMENDED
                    </span>
                  )}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#F4F6FA]">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[#858D9B] mt-1">
                        {plan.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#252C38]">
                      <div className="font-heading font-black text-3xl text-[#F4F6FA]">
                        {plan.formattedPrice}
                      </div>
                      <div className="font-mono text-xs text-[#858D9B] mt-0.5">
                        Billed {plan.cadence}
                      </div>
                    </div>

                    <ul className="space-y-3 font-mono text-xs text-[#C5CAD3] pt-2">
                      {plan.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2457FF] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Link
                      href="/sign-in"
                      className={`w-full py-3 font-mono text-xs uppercase tracking-wider font-semibold text-center block transition-all rounded-xs ${
                        isPopular
                          ? 'bg-[#2457FF] text-white hover:bg-[#1D4ED8]'
                          : 'bg-[#090B10] text-[#F4F6FA] border border-[#252C38] hover:bg-[#252C38]'
                      }`}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-24 lg:py-32 bg-[#171C26]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="font-heading font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#F4F6FA] leading-tight">
            Take control with financial intelligence today.
          </h2>
          <p className="text-lg sm:text-xl text-[#C5CAD3] max-w-2xl mx-auto">
            Take complete control of your assets, liabilities and future planning with verified precision.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F4F6FA] text-[#090B10] hover:bg-white font-semibold text-sm tracking-wider uppercase rounded-xs transition-all shadow-md group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#090B10] text-[#F4F6FA] hover:bg-[#252C38] border border-[#252C38] font-semibold text-sm tracking-wider uppercase rounded-xs transition-colors"
            >
              Sign In with Access Key
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

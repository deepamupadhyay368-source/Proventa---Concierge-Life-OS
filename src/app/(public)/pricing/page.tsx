import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, ArrowRight, Lock, Terminal } from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';
import { KineticStatementStream } from '@/components/wealth/art';

export const metadata: Metadata = {
  title: 'Institutional Wealth Tiers & Licensing | PROVENTA',
  description:
    'Transparent annual licensing for Indian multi-generational families. Start with Personal Sovereignty or license Family, Family Plus, or Family Office tiers.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-[#F4F2ED] py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#2457E8] selection:text-[#F4F2ED]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#171B23] border border-[#B9C1CC]/25 rounded-xs font-mono text-[10px] uppercase tracking-[0.25em] text-[#2457E8]">
            <span className="w-2 h-2 rounded-full bg-[#2457E8] animate-ping" />
            <span>PROVENTA // INSTITUTIONAL FIDUCIARY LICENSING</span>
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-6xl text-[#F4F2ED] uppercase tracking-tight">
            Designed for Multi-Generational Capital
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#B9C1CC] leading-relaxed">
            From single-individual sovereign records to complex family office structures with holding companies, trusts, and appointed legal advisors.
          </p>
        </div>

        {/* 4-Tier Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`p-7 bg-[#171B23] border rounded-sm flex flex-col justify-between transition-all duration-300 ${
                plan.recommended
                  ? 'border-[#2457E8] ring-1 ring-[#2457E8] shadow-xl shadow-[#2457E8]/10 relative'
                  : 'border-[#B9C1CC]/20 hover:border-[#B9C1CC]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className={plan.recommended ? 'text-[#A9D8F5] font-bold' : 'text-[#B9C1CC]/70'}>
                    [{plan.tier.replace(/_/g, '-')}]
                  </span>
                  {plan.recommended && (
                    <span className="px-2 py-0.5 bg-[#2457E8] text-[#F4F2ED] rounded-xs uppercase font-bold text-[9px] tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-black text-2xl mt-3 text-[#F4F2ED] uppercase tracking-tight">
                  {plan.name}
                </h3>
                <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#A9D8F5]' : 'text-[#B9C1CC]/70'}`}>
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1 border-b border-[#B9C1CC]/15 pb-4">
                  <span className="text-4xl font-heading font-black text-[#F4F2ED]">
                    {plan.formattedPrice}
                  </span>
                  <span className="font-mono text-xs text-[#B9C1CC]/60">{plan.cadence}</span>
                </div>

                <ul className="mt-6 space-y-3 font-mono text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[#B9C1CC]">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.recommended ? 'text-[#2457E8]' : 'text-[#B9C1CC]/50'
                        }`}
                      />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#B9C1CC]/15">
                <Link
                  href={`/onboarding?tier=${plan.tier}`}
                  className={`w-full py-3 font-mono text-xs uppercase tracking-wider font-bold text-center block transition-all rounded-sm ${
                    plan.recommended
                      ? 'bg-[#2457E8] text-[#F4F2ED] hover:bg-[#1D4ED8] shadow-md shadow-[#2457E8]/20'
                      : 'bg-[#080A0F] text-[#F4F2ED] border border-[#B9C1CC]/30 hover:bg-[#252C38]'
                  }`}
                >
                  License {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* DPDP Act Guarantee Banner */}
        <div className="border border-[#B9C1CC]/25 bg-[#171B23] p-8 max-w-3xl mx-auto space-y-3 text-center rounded-sm">
          <div className="font-mono text-xs uppercase tracking-wider text-[#D5A85D] font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D5A85D]" />
            <span>Digital Personal Data Protection Act 2023 Compliant</span>
          </div>
          <p className="font-sans text-xs text-[#B9C1CC] leading-relaxed">
            Zero vendor lock-in. All family financial data remains your legal property. You may download complete encrypted archives or invoke irreversible deletion rights at any time under Indian data sovereignty laws.
          </p>
        </div>
      </div>
    </div>
  );
}

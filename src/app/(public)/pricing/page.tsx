import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Institutional Wealth Tiers & Licensing | PROVENTA',
  description:
    'Transparent annual licensing for Indian multi-generational families. Start with Personal Sovereignty or license Family, Family Plus, or Family Office tiers.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F0EDE5] text-[#101010] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1520px] mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#101010] text-[#F0EDE5] font-mono text-[10px] uppercase tracking-[0.2em]">
            <span>PROVENTA // INSTITUTIONAL LICENSING</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#101010] tracking-tight">
            Designed for Multi-Generational Capital
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#85827B] leading-relaxed">
            From single-individual sovereign records to complex family office structures with holding companies, trusts, and appointed legal advisors.
          </p>
        </div>

        {/* 4-Tier Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className={plan.recommended ? 'text-[#B6A68A]' : 'text-[#85827B]'}>
                    {plan.tier}
                  </span>
                  {plan.recommended && (
                    <span className="px-2 py-0.5 bg-[#263B35] text-[#FAF9F6] uppercase font-semibold">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl mt-2">{plan.name}</h3>
                <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#B6A68A]' : 'text-[#85827B]'}`}>
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1 border-b border-current pb-4">
                  <span className="text-4xl font-serif font-normal">{plan.formattedPrice}</span>
                  <span className="font-mono text-xs opacity-75">{plan.cadence}</span>
                </div>

                <ul className="mt-6 space-y-3 font-mono text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.recommended ? 'text-[#B6A68A]' : 'text-[#263B35]'}`} />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-current">
                <Link
                  href={`/onboarding?tier=${plan.tier}`}
                  className={`w-full py-3 font-mono text-xs uppercase tracking-wider font-semibold text-center block transition-colors border ${
                    plan.recommended
                      ? 'bg-[#FAF9F6] text-[#101010] border-[#FAF9F6] hover:bg-[#263B35] hover:text-[#FAF9F6]'
                      : 'bg-[#101010] text-[#F0EDE5] border-[#101010] hover:bg-[#263B35]'
                  }`}
                >
                  License {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* DPDP Act Guarantee Banner */}
        <div className="border border-[#101010] bg-[#FAF9F6] p-8 max-w-3xl mx-auto space-y-2 text-center">
          <div className="font-mono text-xs uppercase tracking-wider text-[#101010] font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#263B35]" />
            <span>Digital Personal Data Protection Act 2023 Compliant</span>
          </div>
          <p className="font-sans text-xs text-[#85827B] leading-relaxed">
            Zero vendor lock-in. All family financial data remains your legal property. You may download complete encrypted archives or invoke irreversible deletion rights at any time under Indian data sovereignty laws.
          </p>
        </div>
      </div>
    </div>
  );
}

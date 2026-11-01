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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1520px] mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171C26] border border-[#252C38] rounded-[2px] font-mono text-[10px] uppercase tracking-[0.2em] text-[#7595FF]">
            <span>PROVENTA // TITANIUM INSTITUTIONAL LICENSING</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-[#F4F6FA] tracking-tight">
            Designed for Multi-Generational Capital
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#C5CAD3] leading-relaxed">
            From single-individual sovereign records to complex family office structures with holding companies, trusts, and appointed legal advisors.
          </p>
        </div>

        {/* 4-Tier Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`p-8 border rounded-[2px] flex flex-col justify-between ${
                plan.recommended
                  ? 'bg-[#171C26] border-[#2457FF] text-[#F4F6FA] shadow-[0_0_25px_rgba(36,87,255,0.2)]'
                  : 'bg-[#171C26] border-[#252C38] text-[#F4F6FA]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className={plan.recommended ? 'text-[#7595FF] font-semibold' : 'text-[#858D9B]'}>
                    {plan.tier}
                  </span>
                  {plan.recommended && (
                    <span className="px-2 py-0.5 bg-[#2457FF]/15 text-[#7595FF] border border-[#2457FF]/40 rounded-[2px] uppercase font-semibold">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-2xl mt-2 text-[#F4F6FA]">{plan.name}</h3>
                <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#7595FF]' : 'text-[#858D9B]'}`}>
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1 border-b border-[#252C38] pb-4">
                  <span className="text-4xl font-display font-bold text-[#F4F6FA]">{plan.formattedPrice}</span>
                  <span className="font-mono text-xs text-[#858D9B]">{plan.cadence}</span>
                </div>

                <ul className="mt-6 space-y-3 font-mono text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[#C5CAD3]">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.recommended ? 'text-[#7595FF]' : 'text-[#858D9B]'}`} />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#252C38]">
                <Link
                  href={`/onboarding?tier=${plan.tier}`}
                  className={`w-full py-3 font-mono text-xs uppercase tracking-wider font-semibold text-center block transition-all rounded-[2px] border ${
                    plan.recommended
                      ? 'bg-[#2457FF] text-[#F4F6FA] border-[#2457FF] hover:bg-[#1B46D9] shadow-[0_0_15px_rgba(36,87,255,0.3)]'
                      : 'bg-[#090B10] text-[#C5CAD3] border-[#252C38] hover:text-[#F4F6FA] hover:border-[#7595FF]/50'
                  }`}
                >
                  License {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* DPDP Act Guarantee Banner */}
        <div className="border border-[#252C38] bg-[#171C26] p-8 max-w-3xl mx-auto space-y-2 text-center rounded-[2px]">
          <div className="font-mono text-xs uppercase tracking-wider text-[#F4F6FA] font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2457FF]" />
            <span>Digital Personal Data Protection Act 2023 Compliant</span>
          </div>
          <p className="font-sans text-xs text-[#C5CAD3] leading-relaxed">
            Zero vendor lock-in. All family financial data remains your legal property. You may download complete encrypted archives or invoke irreversible deletion rights at any time under Indian data sovereignty laws.
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#CBD5E1] rounded-full font-mono text-[11px] uppercase tracking-wider text-[#2563EB] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>PROVENTA // INSTITUTIONAL FIDUCIARY LICENSING</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-[#0F172A] tracking-tight">
            Designed for Multi-Generational Capital
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#475569] leading-relaxed">
            From single-individual sovereign records to complex family office structures with holding companies, trusts, and appointed legal advisors.
          </p>
        </div>

        {/* 4-Tier Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`p-8 bg-white border rounded-2xl flex flex-col justify-between transition-all ${
                plan.recommended
                  ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-xl shadow-blue-500/10'
                  : 'border-[#CBD5E1] shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className={plan.recommended ? 'text-[#2563EB] font-bold' : 'text-[#64748B]'}>
                    {plan.tier}
                  </span>
                  {plan.recommended && (
                    <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-full uppercase font-bold text-[10px]">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-2xl mt-2 text-[#0F172A]">{plan.name}</h3>
                <p className={`text-xs mt-1 ${plan.recommended ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1 border-b border-[#F1F5F9] pb-4">
                  <span className="text-4xl font-display font-bold text-[#0F172A]">{plan.formattedPrice}</span>
                  <span className="font-mono text-xs text-[#64748B]">{plan.cadence}</span>
                </div>

                <ul className="mt-6 space-y-3 font-mono text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[#334155]">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.recommended ? 'text-[#0D9488]' : 'text-[#94A3B8]'}`} />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F1F5F9]">
                <Link
                  href={`/onboarding?tier=${plan.tier}`}
                  className={`w-full py-3 font-mono text-xs uppercase tracking-wider font-semibold text-center block transition-all rounded-lg shadow-sm ${
                    plan.recommended
                      ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                      : 'bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] hover:bg-[#EFF6FF] hover:text-[#2563EB]'
                  }`}
                >
                  License {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* DPDP Act Guarantee Banner */}
        <div className="border border-[#CBD5E1] bg-white p-8 max-w-3xl mx-auto space-y-2 text-center rounded-2xl shadow-sm">
          <div className="font-mono text-xs uppercase tracking-wider text-[#0F172A] font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
            <span>Digital Personal Data Protection Act 2023 Compliant</span>
          </div>
          <p className="font-sans text-xs text-[#475569] leading-relaxed">
            Zero vendor lock-in. All family financial data remains your legal property. You may download complete encrypted archives or invoke irreversible deletion rights at any time under Indian data sovereignty laws.
          </p>
        </div>
      </div>
    </div>
  );
}

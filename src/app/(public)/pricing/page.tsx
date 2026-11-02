import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Pricing & Membership | PROVENTA — Family Wealth OS',
  description:
    'Flat, transparent annual software membership for Indian families. Zero AUM fees. Zero commissions.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] py-20 px-6 lg:px-8 font-sans selection:bg-[#2457FF] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171C26] border border-[#252C38] rounded-xs font-mono text-[10px] uppercase tracking-widest text-[#2457FF]">
            <span className="w-2 h-2 rounded-full bg-[#2457FF] animate-pulse" />
            <span>TRANSPARENT FIDUCIARY LICENSING</span>
          </div>
          <h1 className="font-heading font-black text-5xl sm:text-7xl text-[#F4F6FA] uppercase tracking-tight">
            Flat Annual Membership
          </h1>
          <p className="text-lg text-[#C5CAD3] leading-relaxed">
            No percentage of assets under management. No commissions. Pure software infrastructure.
          </p>
        </div>

        {/* 4-Tier Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`p-8 bg-[#171C26] border rounded-xs flex flex-col justify-between transition-all ${
                plan.recommended
                  ? 'border-[#2457FF] ring-1 ring-[#2457FF] shadow-xl relative'
                  : 'border-[#252C38] hover:border-[#858D9B]'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#858D9B]">[{plan.tier}]</span>
                  {plan.recommended && (
                    <span className="px-2 py-0.5 bg-[#2457FF] text-white rounded-xs uppercase font-bold text-[9px] tracking-widest">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-black text-2xl text-[#F4F6FA] uppercase tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#858D9B] mt-1">
                    {plan.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#252C38]">
                  <span className="text-4xl font-heading font-black text-[#F4F6FA]">
                    {plan.formattedPrice}
                  </span>
                  <span className="font-mono text-xs text-[#858D9B] block mt-0.5">
                    Billed {plan.cadence}
                  </span>
                </div>

                <ul className="space-y-3 font-mono text-xs text-[#C5CAD3] pt-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          plan.recommended ? 'text-[#2457FF]' : 'text-[#858D9B]'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/sign-in"
                  className={`w-full py-3.5 font-mono text-xs uppercase tracking-wider font-bold text-center block transition-all rounded-xs ${
                    plan.recommended
                      ? 'bg-[#2457FF] text-white hover:bg-[#1D4ED8] shadow-md'
                      : 'bg-[#090B10] text-[#F4F6FA] border border-[#252C38] hover:bg-[#252C38]'
                  }`}
                >
                  License {plan.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Fiduciary Guarantee */}
        <div className="border border-[#252C38] bg-[#171C26] p-8 max-w-3xl mx-auto space-y-3 text-center rounded-xs">
          <div className="font-mono text-xs uppercase tracking-wider text-[#2457FF] font-bold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2457FF]" />
            <span>DPDP Act 2023 Compliant · Zero Lock-In</span>
          </div>
          <p className="text-xs text-[#C5CAD3] leading-relaxed">
            All family financial data remains your exclusive legal property. Download complete encrypted archives or invoke cryptographic deletion at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

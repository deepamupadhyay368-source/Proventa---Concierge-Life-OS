import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { FAMILY_WEALTH_SUBSCRIPTION_PLANS } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Family Wealth OS Plans & Pricing | PROVENTA',
  description:
    'Transparent freemium plans for Indian families. Start with a free personal workspace or upgrade to Family, Family Plus, or Family Office for multi-generational wealth preservation.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8F9FD] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-xs font-mono uppercase tracking-widest text-[#A78BFA]">
            <Sparkles className="w-3.5 h-3.5" />
            FAMILY WEALTH OS SUBSCRIPTION TIERS
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-white">
            Designed for every generation of wealth
          </h1>
          <p className="text-base text-[#9D8BC9] font-light leading-relaxed">
            From individual sovereignty to complex family holdings with holding companies, trust structures, and professional advisors.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {Object.values(FAMILY_WEALTH_SUBSCRIPTION_PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`p-8 rounded-3xl flex flex-col justify-between border ${
                plan.recommended
                  ? 'bg-gradient-to-b from-[#1E1035] to-[#0E1322] border-[#7C3AED] shadow-2xl shadow-[#7C3AED]/20 relative'
                  : 'bg-[#0E1322] border-[#1E293B]'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#7C3AED] text-white text-[10px] font-mono uppercase tracking-widest font-bold">
                  Recommended
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="text-xs text-[#9D8BC9] mt-1">{plan.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">{plan.formattedPrice}</span>
                  <span className="text-xs text-[#9D8BC9] font-mono">{plan.cadence}</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-[#9D8BC9]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-6 border-t border-[#1E293B]">
                <Link
                  href={`/onboarding?tier=${plan.tier}`}
                  className={`w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-center block transition-all shadow-md ${
                    plan.recommended
                      ? 'bg-[#7C3AED] text-white hover:bg-[#8B5CF6] shadow-[#7C3AED]/25'
                      : 'bg-[#1E1035] text-[#DDD0F7] hover:bg-[#2A164D] border border-[#3E236E]'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Security / DPDP Banner */}
        <div className="p-8 rounded-3xl bg-[#070A12] border border-[#1E293B] text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            DPDP Privacy Standard
          </div>
          <p className="text-xs text-[#9D8BC9] leading-relaxed font-light">
            No long-term locks. All data belongs to your family. You may download full encrypted archives or request complete erasure under India&apos;s Digital Personal Data Protection Act at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

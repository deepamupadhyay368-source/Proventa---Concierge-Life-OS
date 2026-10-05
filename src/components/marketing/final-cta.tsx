import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-24 bg-[#1F2933] text-white relative overflow-hidden text-center">
      {/* Subtle Slate ambient aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#111820]/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111820] border border-[#303942] text-[11px] font-semibold text-[#A7B0B8] tracking-wider uppercase mb-6 shadow-2xs">
          <span>Early Access · Cohort 1</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
          Your time is finite. <br />
          <span className="text-[#A7B0B8] font-normal">Let Proventa orchestrate the rest.</span>
        </h2>

        <p className="text-base sm:text-lg text-[#C5CCD3] max-w-2xl mx-auto mb-10 leading-relaxed">
          Join founding members delegating dining reservations, executive travel, bespoke gifting, and lifestyle logistics to their dedicated concierge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-[#F7F8FA] text-[#1F2933] font-semibold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm"
          >
            <span>Join Proventa</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#1F2933]" />
          </Link>

          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#485460] bg-[#111820]/60 hover:bg-[#111820] text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all"
          >
            <span>Already a member? Sign in</span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A7B0B8]">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-white" />
            <span>Your First Request Is on Us</span>
          </div>
          <span className="text-[#485460]">&bull;</span>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-white" />
            <span>Experience Proventa Before Subscribing</span>
          </div>
          <span className="text-[#485460]">&bull;</span>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-white" />
            <span>Dedicated Human Concierge Team</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-28 bg-[#1f1b16] text-[#faf8f5] relative overflow-hidden text-center">
      {/* Subtle ambient luxury glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#9c8260]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2e2720] border border-[#4a4034] text-[11px] font-medium text-[#ddc8a9] mb-6">
          <span>AHMEDABAD WAVE 1 · STRICT CAPACITY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white mb-6 leading-tight">
          Your time is finite. <br />
          <span className="italic font-normal text-[#ddc8a9]">Let Proventa orchestrate the rest.</span>
        </h2>

        <p className="text-base sm:text-lg text-[#b8b4ad] max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Join the founding cohort of Ahmedabad members delegating reservations, private travel, gifting, and lifestyle logistics to their dedicated concierge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/wave1"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#ddc8a9] hover:bg-[#ebdcc4] text-[#141312] font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <span>Apply for Wave 1 Membership</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#4a4034] bg-[#29221b]/60 hover:bg-[#332a21] text-[#faf8f5] font-medium text-sm rounded-xl transition-all"
          >
            <span>The Operating Model</span>
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-[#b09a78] font-sans">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#ddc8a9]" />
            <span>Complimentary Concierge Access in Wave 1</span>
          </div>
          <span className="text-[#4a4034]">&bull;</span>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#ddc8a9]" />
            <span>Pay Only for Verified Bookings</span>
          </div>
          <span className="text-[#4a4034]">&bull;</span>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[#ddc8a9]" />
            <span>Resident Concierges in Ahmedabad</span>
          </div>
        </div>
      </div>
    </section>
  );
}

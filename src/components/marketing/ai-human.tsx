import { CheckCircle2, ShieldCheck, Clock, Users, ArrowRight, Sparkles, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export function AIHumanSection() {
  return (
    <section className="py-28 bg-[#f5f3ef]/60 border-t border-[#e8e2d8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
              <span>THE PROVENTA STANDARD</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-6 leading-tight">
              Intelligent Synthesis. <br />
              <span className="italic font-normal text-[#8a7053]">Devoted Human Care.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#5a4937] leading-relaxed mb-8 font-sans">
              Algorithmic chatbots hallucinate and cannot personally liaise with restaurant proprietors or hotel directors. Traditional travel desks are rigid and slow. Proventa pairs instant cognitive parsing with seasoned resident concierges.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#e8e2d8] flex items-center justify-center text-[#6d5941] mt-0.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141312]">Instant Natural Comprehension</h3>
                  <p className="text-xs text-[#6e6b65] mt-0.5">Simply articulate what you require in natural language—no cumbersome forms or multi-step pickers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#e8e2d8] flex items-center justify-center text-[#6d5941] mt-0.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141312]">Direct Ground Verification</h3>
                  <p className="text-xs text-[#6e6b65] mt-0.5">Our concierges speak personally with managers to guarantee table alcoves, bespoke menus, and exact timings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#e8e2d8] flex items-center justify-center text-[#6d5941] mt-0.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141312]">Absolute Approval Sovereign</h3>
                  <p className="text-xs text-[#6e6b65] mt-0.5">Every detail and exact expenditure requires your one-tap review. Nothing is booked or committed autonomously.</p>
                </div>
              </div>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1f1b16] text-[#faf8f5] font-medium text-sm hover:bg-[#332d26] transition-all shadow-sm"
            >
              <span>Explore The Operating Model</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="luxury-card p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#ede8df] text-[#6d5941] flex items-center justify-center font-serif font-bold text-lg border border-[#e8e2d8]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-[#141312]">Cognitive Intelligence Layer</h3>
                  <p className="text-xs text-[#8a7053] font-medium">Speed &amp; Synthesis</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#6e6b65] leading-relaxed">
                Parses calendar schedules, filters fine dining availability, aligns family dietary preferences, and structures options within moments so you never scroll endless apps.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1f1b16] to-[#141312] text-[#faf8f5] shadow-xl border border-[#3a342c]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2e2720] border border-[#4a4034] text-[#ddc8a9] flex items-center justify-center">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-white">Dedicated Human Concierge</h3>
                  <p className="text-xs text-[#b09a78] font-medium">Local Influence &amp; Accountability</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#b8b4ad] leading-relaxed">
                A resident concierge liaises with the venue director, secures the preferred table, negotiates personal terms, and sends you a refined summary card for approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, ShieldCheck, Clock, Users, ArrowRight, Sparkles, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export function AIHumanSection() {
  return (
    <section className="py-24 bg-[#F7F8FA]/60 relative overflow-hidden border-t border-[#E1E5E8] live-bg-canvas">
      {/* Ambient Moving Glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-[#E5E9ED]/40 to-transparent blur-[120px] pointer-events-none -z-10 live-orb-1" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-[#F1F3F5]/50 to-transparent blur-[140px] pointer-events-none -z-10 live-orb-2" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F2933]"></span>
              <span>The Proventa Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1F2933] mb-6 leading-tight">
              Intelligent Synthesis. <br />
              <span className="live-flowing-text font-normal">Dedicated Human Execution.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#66717C] leading-relaxed mb-8">
              Standalone AI cannot call a Maître d’ or negotiate bespoke venue requests. Traditional manual agencies are slow and non-transparent. Proventa pairs instant algorithmic reasoning with verified resident concierges.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] mt-0.5 shrink-0 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933]">Natural Language Understanding</h3>
                  <p className="text-xs text-[#66717C] mt-0.5">Articulate what you need in plain language. AI extracts dates, party size, budget, and constraints instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] mt-0.5 shrink-0 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933]">Direct Ground Verification</h3>
                  <p className="text-xs text-[#66717C] mt-0.5">Our concierges coordinate directly with venue managers to guarantee verified reservations and authentic references.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-white border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] mt-0.5 shrink-0 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933]">Member Sovereignty &amp; Approval</h3>
                  <p className="text-xs text-[#66717C] mt-0.5">Review curated options with exact transparent pricing. Nothing is finalized without your explicit selection.</p>
                </div>
              </div>
            </div>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1F2933] text-white font-medium text-xs uppercase tracking-wider hover:bg-[#111820] hover:shadow-md transition-all shadow-xs active:scale-[0.98]"
            >
              <span>Explore The Operating Model</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#E1E5E8] shadow-xs hover:shadow-md hover:border-[#A7B0B8] hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] text-[#1F2933] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#1F2933]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1F2933]">Cognitive Intelligence Layer</h3>
                  <p className="text-xs text-[#66717C]">Discovery, Curation &amp; Constraints</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#66717C] leading-relaxed">
                Evaluates complex requirements, cross-checks dates and live inventory, aligns dietary preferences, and structures up to 5 verified options within seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111820] to-[#1F2933] text-white border border-[#303942]/50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#111820] border border-[#303942] text-white flex items-center justify-center">
                  <PhoneCall className="h-5 w-5 text-[#A7B0B8]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Dedicated Concierge Desk</h3>
                  <p className="text-xs text-[#A7B0B8]">Operational Liaison &amp; Real Execution</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#E5E9ED] leading-relaxed">
                A professional concierge handles telephone placement, confirms table arrangements, secures special requests, and returns authentic provider reference codes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

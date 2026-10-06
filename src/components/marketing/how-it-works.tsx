import { MessageSquare, Search, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'State Your Request',
    description: 'Articulate what you need in natural language. Dining, executive flights, boutique stays, cultural passes, gifting, or lifestyle coordination.',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'AI Discovers Genuine Options',
    description: 'AI evaluates requirements, checks legitimate sources, and curates up to 25 genuine options with transparent pricing. You review and select your preferred option.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Approval & Execution',
    description: 'Once you approve, Proventa executes the request autonomously where a verified interface exists, or through your dedicated Concierge Desk with real provider confirmation.',
    icon: CheckSquare,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-[#E1E5E8] live-bg-canvas">
      {/* Live Ambient Moving Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#F1F3F5]/60 via-[#E5E9ED]/30 to-transparent blur-[140px] pointer-events-none -z-10 live-orb-3" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F2933]"></span>
            <span>Operating Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2933] mb-4">
            Quiet Simplicity. <span className="live-flowing-text">Total Control.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#66717C] leading-relaxed">
            AI discovers. Customer chooses. Concierge executes. A seamless hybrid lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#E1E5E8] hover:border-[#A7B0B8] flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1.5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-[#1F2933] group-hover:text-[#111820] transition-colors">{s.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] group-hover:bg-[#1F2933] group-hover:text-white transition-all duration-300 shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-[#1F2933] mb-2">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-[#66717C] leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/wave1"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F2933] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#111820] hover:shadow-md transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Apply for Early Access</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { MessageSquare, Search, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'State Your Request',
    description: 'Articulate your request in natural language. Dining, executive flights, boutique stays, gifting, or lifestyle coordination.',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'Curated Options & Approval',
    description: 'AI agents evaluate live verified availability and present up to 5 genuine options with transparent pricing. You choose what works best.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Concierge Execution',
    description: 'Your assigned Proventa concierge desk executes the booking directly with the venue, returning authentic confirmation passes to your dashboard.',
    icon: CheckSquare,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white border-t border-[#E1E5E8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
            <span>Operating Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2933] mb-4">
            Quiet Simplicity. Total Control.
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
                className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E1E5E8] hover:border-[#A7B0B8] flex flex-col justify-between transition-all shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-[#1F2933]">{s.step}</span>
                    <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933]">
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1F2933] text-white font-medium text-xs uppercase tracking-wider hover:bg-[#111820] transition-all shadow-xs"
          >
            <span>Apply for Early Access</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

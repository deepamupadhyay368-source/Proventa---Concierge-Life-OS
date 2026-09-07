import { MessageSquare, Search, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'State Your Request',
    description: 'Send a message or audio note in natural language. Dining, private travel, luxury gifting, or estate assistance.',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'Autonomous Verification',
    description: 'Specialized AI agents structure the plan and ground concierges lock down verified tables, slots, or supplier pricing.',
    icon: Search,
  },
  {
    step: '03',
    title: 'One-Tap & Flawlessly Done',
    description: 'Review transparent line items with zero hidden fees. Confirm with one tap — passes and receipts delivered straight to you.',
    icon: CheckSquare,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-[#faf8f5] border-t border-[#e8e2d8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
            <span>HOW PROVENTA OPERATES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-4">
            Quiet Simplicity. Total Control.
          </h2>
          <p className="text-base sm:text-lg text-[#5a4937] leading-relaxed font-sans">
            No endless apps or back-and-forth phone calls. Delegate in seconds and consider it done.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="luxury-card p-8 rounded-2xl flex flex-col justify-between group hover:border-[#b09a78]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-4xl font-normal text-[#8a7053]">{s.step}</span>
                    <div className="w-12 h-12 rounded-xl bg-[#f5f3ef] border border-[#e8e2d8] flex items-center justify-center text-[#6d5941] group-hover:bg-[#1f1b16] group-hover:text-[#ddc8a9] transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-serif font-medium text-[#141312] mb-3">{s.title}</h3>
                  <p className="text-sm text-[#6e6b65] leading-relaxed font-sans">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/wave1"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#1f1b16] text-[#faf8f5] font-medium text-sm hover:bg-[#332d26] transition-all shadow-sm"
          >
            <span>Apply for Early Access</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

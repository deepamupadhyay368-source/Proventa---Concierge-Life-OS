import { MessageSquare, Search, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Articulate Your Need',
    description: 'Send a message or voice note in natural phrasing. "Reserve a quiet corner table for four on Saturday at 8 PM with garden view."',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'Direct Ground Verification',
    description: 'We liaise directly with venue directors to verify real table allocations, curated menus, and exact pricing.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Review & One-Tap Approval',
    description: 'You receive an elegant proposal card detailing schedule, confirmation terms, and exact pricing. Nothing is committed without your tap.',
    icon: CheckSquare,
  },
  {
    step: '04',
    title: 'Flawlessly Handled',
    description: 'We orchestrate the booking, deliver digital invitations and passes to your device, and remain on discreet standby if plans evolve.',
    icon: Sparkles,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-28 bg-[#faf8f5] border-t border-[#e8e2d8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
            <span>DISCREET ORCHESTRATION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-4">
            How Proventa Operates.
          </h2>
          <p className="text-base sm:text-lg text-[#5a4937] leading-relaxed font-sans">
            Effortless discretion for you. Meticulous on-the-ground execution by our private concierge team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="luxury-card p-8 rounded-2xl flex flex-col justify-between group hover:border-[#b09a78]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-serif text-3xl font-normal text-[#8a7053]">{s.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-[#f5f3ef] border border-[#e8e2d8] flex items-center justify-center text-[#6d5941] group-hover:bg-[#1f1b16] group-hover:text-[#ddc8a9] transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-serif font-medium text-[#141312] mb-2.5">{s.title}</h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed font-sans">{s.description}</p>
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
            <span>Apply for Wave 1 Membership</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

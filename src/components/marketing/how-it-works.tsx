import { MessageSquare, Search, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Tell us what you need',
    description: 'Text or say what you want in simple words. For example: "Book a quiet dinner for four at Agashiye on Saturday at 8 PM."',
    icon: MessageSquare,
  },
  {
    step: '02',
    title: 'We research and verify',
    description: 'We find the best choices and call venues directly in Ahmedabad to confirm real table availability, timing, and pricing.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Review and approve',
    description: 'You receive a clear proposal card with the exact details, schedule, and price. Nothing is booked or charged without your approval.',
    icon: CheckSquare,
  },
  {
    step: '04',
    title: 'Relax — it’s handled',
    description: 'We finalize the booking, deliver the confirmation and passes to your phone, and stay on standby if plans change.',
    icon: Sparkles,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white border-t border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Process</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            How Proventa Works.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Zero friction on your side. Thorough verification and personal service on ours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#fafaf9] border border-neutral-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-neutral-900">{s.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/wave1"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <span>Join Wave 1 in Ahmedabad</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

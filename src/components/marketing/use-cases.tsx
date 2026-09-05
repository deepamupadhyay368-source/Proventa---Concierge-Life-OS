'use client';

import { Utensils, Gift, Compass, Network, CheckCircle2, Clock } from 'lucide-react';

const USE_CASES = [
  {
    id: 'CASE-01',
    title: 'High-Priority Dining',
    prompt: '"Find somewhere quiet in Ahmedabad for 4 on Saturday. Around ₹2,000/person."',
    description: 'Autonomous research + human direct telephone reservation to secure prime rooftop tables.',
    badge: 'AVG DISPATCH: 14M',
    icon: Utensils,
    gradient: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    id: 'CASE-02',
    title: 'Curated Sourcing & Gifting',
    prompt: '"I need a thoughtful heritage artisanal gift for a visiting client under ₹8,000."',
    description: 'Sourced from verified local boutiques, inspected, gift-packaged, and delivered to venue.',
    badge: 'DELIVERY INCLUDED',
    icon: Gift,
    gradient: 'from-indigo-500/20 to-purple-500/10',
  },
  {
    id: 'CASE-03',
    title: 'Weekend Logistics',
    prompt: '"Plan a two-night restorative getaway 3-4 hours from Ahmedabad for next weekend."',
    description: 'Heritage havelis, luxury tents, executive transfers, and curated itineraries.',
    badge: 'FULL TRIP ENGINE',
    icon: Compass,
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    id: 'CASE-04',
    title: 'Complex & Unstructured Requests',
    prompt: '"I need a tailor to come to my office, plus dry cleaning and flower arrangements by 4 PM."',
    description: 'Zero categorization needed. The AI neural engine decomposes into parallel human work streams.',
    badge: 'PARALLEL EXECUTION',
    icon: Network,
    gradient: 'from-emerald-500/20 to-cyan-500/10',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-white border-t border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[11px] font-mono text-cyan-700 mb-3">
            // UNSTRUCTURED NATURAL LANGUAGE INGESTION
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Whatever needs taking care of.
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            No dropdowns or rigid forms. Just state your requirement in normal human prose. Proventa handles the cognitive load.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.id}
                className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-cyan-500/50 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 transition-all relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                      [{uc.id}]
                    </span>
                    <span className="text-[10px] font-mono text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded border border-cyan-200">
                      {uc.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 group-hover:border-cyan-400 group-hover:shadow-xs transition-all">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-3">{uc.title}</h3>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 mb-4 text-xs font-mono text-slate-700 italic leading-relaxed shadow-2xs">
                    {uc.prompt}
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-200/60">
                  {uc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

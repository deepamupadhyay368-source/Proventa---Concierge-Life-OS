import { ClipboardList, Search, GitCompare, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Submit Requirement',
    description: 'Create multi-item RFQs with technical BIS specifications, required delivery schedules, site access parameters, and attached BOQ documents.',
    icon: ClipboardList,
  },
  {
    step: '02',
    title: 'Match Suppliers',
    description: 'Broadcast specifications directly to verified regional stockists, primary rolling mills, and authorized distributors with matching inventory.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Compare Quotations',
    description: 'Evaluate side-by-side landed cost matrices comparing ex-factory rates, applicable GST, freight logistics, and commercial payment terms.',
    icon: GitCompare,
  },
  {
    step: '04',
    title: 'Award Purchase Order',
    description: 'Issue binding digital Purchase Orders, coordinate dispatches with weighbridge verification, and maintain transparent payment obligations.',
    icon: Truck,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-[#F4F7FA] relative overflow-hidden border-t border-b border-[#E2E8EF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E2E8EF] text-[11px] font-mono font-semibold tracking-wider text-[#315F91] uppercase shadow-xs">
            <span className="w-1.5 h-1.5 bg-[#315F91]"></span>
            <span>PROCUREMENT METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[#243447]">
            How PROVENTA Works.
          </h2>
          <p className="text-base sm:text-lg text-[#6B7785] leading-relaxed">
            Four connected milestones transforming material procurement into an auditable corporate workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white border border-[#E2E8EF] hover:border-[#315F91] flex flex-col justify-between transition-all duration-200 shadow-2xs rounded-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-[#315F91] tracking-tight">{s.step}</span>
                    <div className="w-8 h-8 rounded-xs bg-[#F4F7FA] text-[#315F91] flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-heading font-bold text-[#243447] mb-2">{s.title}</h3>
                  <p className="text-xs text-[#6B7785] leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-4 border-t border-[#E2E8EF] mt-6">
                  <Link
                    href="/rfq/new"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315F91] group-hover:text-[#264B74]"
                  >
                    <span>Start Process</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

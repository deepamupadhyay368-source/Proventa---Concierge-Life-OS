import { Cpu, UserCheck, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

const STAGES = [
  {
    stage: 'STAGE 01',
    title: 'Natural Ingestion',
    techSubtitle: 'NLP // ZERO STRUCTURE REQUIRED',
    description: 'Provide your intent in pure unstructured natural language, audio, or bullet points. No repetitive form filling or rigid dropdowns.',
    icon: Sparkles,
    badge: 'INGEST',
  },
  {
    stage: 'STAGE 02',
    title: 'Neural Reasoning & Graph Match',
    techSubtitle: 'GEMINI 1.5 PRO // LOCAL KNOWLEDGE GRAPH',
    description: 'Proventa parses constraints, identifies dates and locations, checks local Ahmedabad partner inventory, and compiles optimized options.',
    icon: Cpu,
    badge: 'REASON',
  },
  {
    stage: 'STAGE 03',
    title: 'Human Concierge Direct Gate',
    techSubtitle: 'PMYSICAL OPS // REAL-WORLD VERIFICATION',
    description: 'A licensed human concierge inspects the dossier, phones the venue, verifies table seating or flight connections, and handles edge cases.',
    icon: UserCheck,
    badge: 'VERIFY',
  },
  {
    stage: 'STAGE 04',
    title: 'Cryptographic Customer Approval',
    techSubtitle: 'STRICT ZERO-SURPRISE POLICY',
    description: 'You receive a single, crystal-clear digital approval card showing exact terms, line-item pricing, and timing. Nothing executes without your tap.',
    icon: ShieldCheck,
    badge: 'CONFIRM',
  },
  {
    stage: 'STAGE 05',
    title: 'Execution & Real-Time Telemetry',
    techSubtitle: 'COMPLETE FULFILLMENT // AUDITED LOGS',
    description: 'The booking is booked, passes are sent to your phone, and your personal timeline updates instantly. Life, handled.',
    icon: CheckCircle2,
    badge: 'DISPATCHED',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 relative bg-white border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-50 text-cyan-700 font-mono text-xs mb-3">
            <span>PIPELINE SPECIFICATION // 5-STAGE LIFECYCLE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            How The <span className="tech-gradient-text">Operating System</span> Works
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto">
            Zero friction on your end. Deterministic accuracy, human verification, and audited execution on ours.
          </p>
        </div>

        <div className="space-y-4">
          {STAGES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.stage}
                className="relative p-6 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-cyan-500/50 hover:bg-white hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 items-start"
              >
                <div className="flex-shrink-0 flex items-center md:flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-cyan-500/50 flex items-center justify-center text-cyan-600 transition-colors shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-cyan-700 transition-colors">
                    {s.stage}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                      {s.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {s.badge}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-cyan-700 mb-2 font-medium">
                    {s.techSubtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

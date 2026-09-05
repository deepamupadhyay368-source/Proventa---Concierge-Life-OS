import { Cpu, UserCheck, ArrowRight, Zap, Terminal } from 'lucide-react';

export function AIHumanSection() {
  return (
    <section className="py-24 relative border-t border-slate-200/80 bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-purple-500/30 bg-purple-50 text-purple-700 font-mono text-xs mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>DUAL-CORE ARCHITECTURE // SILICON + CARBON</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              AI Solves The Matrix.<br />
              <span className="tech-gradient-text">Humans Hold The Gate.</span>
            </h2>

            <p className="text-slate-600 leading-relaxed mb-6 text-sm md:text-base">
              Pure bots hallucinate and drop commitments. Pure agencies are slow and expensive. Proventa merges silicon speed with licensed human concierge authority.
            </p>

            <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-700 space-y-2 mb-8 shadow-xs">
              <div className="flex items-center gap-2 text-cyan-700 font-semibold">
                <Terminal className="w-4 h-4" />
                <span>SAFETY COVENANT // STRICT HUMAN OVERSIGHT</span>
              </div>
              <p className="text-slate-600">
                &gt; No financial transactions execute without cryptographically signed human review.
              </p>
              <p className="text-slate-600">
                &gt; AI plans in milliseconds; dedicated concierges verify local reality.
              </p>
            </div>

            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold font-mono text-cyan-700 hover:text-cyan-800 group"
            >
              <span>INSPECT THE 5-STAGE PIPELINE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-white border border-cyan-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-50 border-b border-l border-cyan-200 text-[10px] font-mono text-cyan-700 font-medium">
                CORE-01: SILICON SPEED
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono">NEURAL REASONING ENGINE</h3>
                  <p className="text-[11px] text-cyan-700 font-mono">Gemini 1.5 Pro // Low Latency Ingestion</p>
                </div>
              </div>

              <ul className="space-y-2 font-mono text-xs text-slate-600">
                {[
                  'Autonomous entity extraction & semantic synthesis',
                  'Cross-provider graph & inventory reconciliation',
                  'Instant comparison matrices across time & cost',
                  'Predictive preference adaptation and memory recall',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-cyan-600 font-bold mt-0.5">&gt;</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-white border border-purple-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-purple-50 border-b border-l border-purple-200 text-[10px] font-mono text-purple-700 font-medium">
                CORE-02: CARBON JUDGMENT
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono">HUMAN CONCIERGE GATEWAY</h3>
                  <p className="text-[11px] text-purple-700 font-mono">Licensed Ahmedabad Ops Staff // Final Gate</p>
                </div>
              </div>

              <ul className="space-y-2 font-mono text-xs text-slate-600">
                {[
                  'Direct physical phone call & VIP partner negotiation',
                  'Real-world quality guarantee & reservation assurance',
                  'Handling nuanced contextual exceptions & high stakes',
                  'Single-point personal accountability for every outcome',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-purple-600 font-mono font-bold mt-0.5">&gt;</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

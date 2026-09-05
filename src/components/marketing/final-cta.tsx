import Link from 'next/link';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 via-cyan-50/20 to-white border-t border-slate-200/80">
      <div className="tech-grid absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-transparent blur-[100px] pointer-events-none rounded-full" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-50 text-cyan-700 font-mono text-xs mb-6">
          <Terminal className="w-3.5 h-3.5" />
          <span>AHMEDABAD WAVE 1 // LIMITED ALLOCATION</span>
        </div>

        <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
          Your To-Do List Isn&apos;t Getting Shorter.<br />
          <span className="tech-gradient-text">Let Proventa Execute It.</span>
        </h2>

        <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed">
          Reclaim 15+ hours every week. Join the exclusive founding cohort of Ahmedabad leaders delegating with the speed of AI and the precision of human concierges.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/wave1"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-sm tracking-wide rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <span>APPLY FOR WAVE 1 ACCESS</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-mono text-sm rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>SEE RUNNER WALKTHROUGH</span>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 font-mono text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-700 font-medium">BATCH 01 DISPATCHING</span>
          </div>
          <span>&bull;</span>
          <span>AHMEDABAD LAUNCH ZONE</span>
          <span>&bull;</span>
          <span>ZERO SPAM POLICY</span>
        </div>
      </div>
    </section>
  );
}

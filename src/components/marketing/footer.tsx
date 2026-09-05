import Link from 'next/link';
import { Terminal, Shield, Activity, Radio } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-14 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-wrap items-center justify-between pb-8 mb-10 border-b border-slate-800 gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ALL SYSTEMS OPERATIONAL
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              TELEMETRY: 14MS
            </span>
          </div>
          <div className="text-slate-400 flex items-center gap-4">
            <span className="text-cyan-400 font-bold">NODE: AHMEDABAD-01</span>
            <span className="text-slate-500">BUILD: v2.0-PROD</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-wider">PROVENTA</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">OS</span>
            </div>
            <p className="font-mono text-xs text-slate-400 tracking-widest uppercase">Concierge Life OS // Wave 1</p>
            <p className="text-xs text-slate-400 leading-relaxed font-sans pt-2">Autonomous AI orchestration paired with licensed human concierge execution. Built for founders, operators, and individuals who value time above all.</p>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Core Modules</span>
            </p>
            <ul className="space-y-2 font-mono text-xs">
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-cyan-300 transition-colors">&gt; How It Works</Link></li>
              <li><Link href="/what-we-handle" className="text-slate-400 hover:text-cyan-300 transition-colors">&gt; What We Handle</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-cyan-300 transition-colors">&gt; About Proventa</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-cyan-300 transition-colors">&gt; Architecture FAQ</Link></li>
              <li><Link href="/wave1" className="text-slate-400 hover:text-cyan-300 transition-colors">&gt; Apply Wave 1</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Security &amp; Protocol</span>
            </p>
            <ul className="space-y-2 font-mono text-xs">
              <li><Link href="/trust" className="text-slate-400 hover:text-purple-300 transition-colors">&gt; Trust &amp; Verification</Link></li>
              <li><Link href="/privacy" className="text-slate-400 hover:text-purple-300 transition-colors">&gt; Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-purple-300 transition-colors">&gt; Terms of Protocol</Link></li>
              <li><Link href="/cookie-policy" className="text-slate-400 hover:text-purple-300 transition-colors">&gt; Cookie Policy</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-purple-300 transition-colors">&gt; Contact Dispatch</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dispatch Comms</span>
            </p>
            <div className="space-y-2 font-mono text-xs text-slate-400">
              <p>DIRECT DESK:</p>
              <a href="mailto:concierge@proventa.in" className="text-cyan-400 hover:underline block">concierge@proventa.in</a>
              <p className="pt-2">GENERAL INQUIRY:</p>
              <a href="mailto:hello@proventa.in" className="text-cyan-400 hover:underline block">hello@proventa.in</a>
              <div className="pt-3">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">LATENCY: ~15 MIN</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <p>&copy; 2026 PROVENTA INC. ALL RIGHTS RESERVED.</p>
          <p className="text-slate-400">ZONE 01: AHMEDABAD, GUJARAT, INDIA</p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Terminal, Sparkles, ShieldCheck } from 'lucide-react';

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Tech Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-sm shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center">
                <span className="font-mono text-sm font-black text-cyan-600">P</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                PROVENTA<span className="text-cyan-600 text-xs">.OS</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">CONCIERGE LIFE OS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link href="/how-it-works" className="text-xs font-medium text-slate-600 hover:text-cyan-600 transition-colors font-mono">
              // ARCHITECTURE
            </Link>
            <Link href="/what-we-handle" className="text-xs font-medium text-slate-600 hover:text-cyan-600 transition-colors font-mono">
              // CAPABILITIES
            </Link>
            <Link href="/about" className="text-xs font-medium text-slate-600 hover:text-cyan-600 transition-colors font-mono">
              // ABOUT
            </Link>
            <Link href="/faq" className="text-xs font-medium text-slate-600 hover:text-cyan-600 transition-colors font-mono">
              // FAQ
            </Link>
          </nav>

          {/* Right Side: Status Badge & CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AHMEDABAD WAVE 1: ACTIVE</span>
            </div>

            <Link href="/sign-in" className="text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors font-mono">
              Sign In
            </Link>

            <Link
              href="/wave1"
              className="relative group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Request Access</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 font-mono text-xs shadow-lg">
          <Link href="/how-it-works" onClick={() => setOpen(false)} className="block text-slate-700 hover:text-cyan-600 py-1.5">
            // Architecture
          </Link>
          <Link href="/what-we-handle" onClick={() => setOpen(false)} className="block text-slate-700 hover:text-cyan-600 py-1.5">
            // Capabilities
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block text-slate-700 hover:text-cyan-600 py-1.5">
            // About
          </Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="block text-slate-700 hover:text-cyan-600 py-1.5">
            // FAQ
          </Link>
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link href="/sign-in" onClick={() => setOpen(false)} className="text-slate-700 py-1">
              Sign In
            </Link>
            <Link
              href="/wave1"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold"
            >
              Request Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

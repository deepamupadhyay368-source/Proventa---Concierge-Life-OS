'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E1E5E8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1F2933]">
              Proventa
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F2933]"></span>
              Cohort 1
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-xs uppercase tracking-widest font-medium text-[#66717C] hover:text-[#1F2933] transition-colors">
              How It Works
            </Link>
            <Link href="/what-we-handle" className="text-xs uppercase tracking-widest font-medium text-[#66717C] hover:text-[#1F2933] transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-xs uppercase tracking-widest font-medium text-[#66717C] hover:text-[#1F2933] transition-colors">
              Philosophy
            </Link>
            <Link href="/faq" className="text-xs uppercase tracking-widest font-medium text-[#66717C] hover:text-[#1F2933] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Side CTAs */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/sign-in" className="text-xs uppercase tracking-widest font-semibold text-[#1F2933] hover:text-[#111820] transition-colors">
              Member Sign In
            </Link>

            <Link
              href="/wave1"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F2933] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#111820] transition-all shadow-xs"
            >
              <span>Early Access</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#A7B0B8]" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#1F2933] hover:text-[#111820]"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-b border-[#E1E5E8] px-6 pt-4 pb-8 space-y-4">
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-[#1F2933]"
          >
            How It Works
          </Link>
          <Link
            href="/what-we-handle"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-[#1F2933]"
          >
            Curated Services
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-[#1F2933]"
          >
            Philosophy
          </Link>
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-[#1F2933]"
          >
            Frequently Asked
          </Link>
          <div className="pt-4 border-t border-[#E1E5E8] flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="text-center py-3 text-xs uppercase tracking-widest font-bold text-[#1F2933] border border-[#E1E5E8] rounded-lg"
            >
              Member Sign In
            </Link>
            <Link
              href="/wave1"
              onClick={() => setOpen(false)}
              className="text-center py-3.5 text-xs uppercase tracking-widest font-bold bg-[#1F2933] text-white rounded-lg shadow-xs hover:bg-[#111820]"
            >
              Request Cohort 1 Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 luxury-glass border-b border-brand-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <span className="text-2xl sm:text-3xl font-serif tracking-tight text-neutral-900 font-normal">
              Proventa
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-brand-50 text-brand-800 border border-brand-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
              Ahmedabad
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-9">
            <Link href="/how-it-works" className="text-xs uppercase tracking-widest font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              How It Works
            </Link>
            <Link href="/what-we-handle" className="text-xs uppercase tracking-widest font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-xs uppercase tracking-widest font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Philosophy
            </Link>
            <Link href="/faq" className="text-xs uppercase tracking-widest font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Side CTAs */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/sign-in" className="text-xs uppercase tracking-widest font-semibold text-neutral-700 hover:text-neutral-950 transition-colors">
              Member Sign In
            </Link>

            <Link
              href="/wave1"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-[#faf8f5] text-xs font-semibold tracking-wider uppercase hover:bg-brand-950 transition-all shadow-sm hover:shadow-md"
            >
              <span>Join Wave 1</span>
              <ArrowRight className="h-3.5 w-3.5 text-brand-300" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-[#faf8f5] border-b border-brand-200 px-6 pt-4 pb-8 space-y-4">
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-neutral-900"
          >
            How It Works
          </Link>
          <Link
            href="/what-we-handle"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-neutral-900"
          >
            Curated Services
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-neutral-900"
          >
            Philosophy
          </Link>
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="block py-2 text-sm uppercase tracking-wider font-semibold text-neutral-900"
          >
            Frequently Asked
          </Link>
          <div className="pt-4 border-t border-brand-200 flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="text-center py-3 text-xs uppercase tracking-widest font-bold text-neutral-900 border border-brand-300 rounded-xl"
            >
              Member Sign In
            </Link>
            <Link
              href="/wave1"
              onClick={() => setOpen(false)}
              className="text-center py-3.5 text-xs uppercase tracking-widest font-bold bg-neutral-900 text-white rounded-xl shadow-sm"
            >
              Request Wave 1 Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

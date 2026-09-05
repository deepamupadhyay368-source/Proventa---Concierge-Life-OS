'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black tracking-tight text-neutral-900">
              PROVENTA
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-neutral-900 text-white uppercase">
              Ahmedabad
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
              How It Works
            </Link>
            <Link href="/what-we-handle" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
              About
            </Link>
            <Link href="/faq" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Side CTAs */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/sign-in" className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
              Sign In
            </Link>

            <Link
              href="/wave1"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Join Wave 1</span>
              <ArrowRight className="h-4 w-4" />
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
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/how-it-works"
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-bold text-neutral-900"
          >
            How It Works
          </Link>
          <Link
            href="/what-we-handle"
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-bold text-neutral-900"
          >
            Services
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-bold text-neutral-900"
          >
            About
          </Link>
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="block py-2 text-base font-bold text-neutral-900"
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="text-center py-2.5 text-sm font-bold text-neutral-900 border border-neutral-200 rounded-xl"
            >
              Sign In
            </Link>
            <Link
              href="/wave1"
              onClick={() => setOpen(false)}
              className="text-center py-3 text-sm font-bold bg-neutral-900 text-white rounded-xl shadow-sm"
            >
              Join Wave 1
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

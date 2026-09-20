'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-[#222222] py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
              PROVENTA
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#171717] text-[#a3a3a3] border border-[#262626]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-mono text-[#a3a3a3]">
            <Link href="#request-section" className="hover:text-white transition-colors">
              Concierge
            </Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#services" className="hover:text-white transition-colors">
              Experiences
            </Link>
            <Link href="#human-concierge" className="hover:text-white transition-colors">
              About
            </Link>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-xs uppercase tracking-widest font-mono text-[#a3a3a3] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="#request-section"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#eaeaea] transition-all"
            >
              <span>Request Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#a3a3a3] hover:text-white"
            aria-label="Toggle Navigation"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-[#262626] px-6 py-8 space-y-6 animate-fade-in">
          <nav className="flex flex-col gap-5 text-sm uppercase tracking-widest font-mono text-[#a3a3a3]">
            <Link
              href="#request-section"
              onClick={() => setOpen(false)}
              className="hover:text-white transition-colors"
            >
              Concierge
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#services"
              onClick={() => setOpen(false)}
              className="hover:text-white transition-colors"
            >
              Experiences
            </Link>
            <Link
              href="#human-concierge"
              onClick={() => setOpen(false)}
              className="hover:text-white transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="pt-6 border-t border-[#262626] flex flex-col gap-4">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="text-xs uppercase tracking-widest font-mono text-[#a3a3a3] hover:text-white transition-colors"
            >
              Member Sign In
            </Link>
            <Link
              href="#request-section"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white text-black text-xs font-mono font-semibold uppercase tracking-wider"
            >
              <span>Request Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

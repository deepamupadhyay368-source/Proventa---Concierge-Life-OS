'use client';

import React from 'react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-black text-white border-t border-[#171717] py-16 px-6 sm:px-8 lg:px-12 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-1">
          <span className="text-base font-bold tracking-tight text-white uppercase font-sans">
            PROVENTA
          </span>
          <p className="text-[#737373]">Concierge Life OS · Human-First Execution</p>
        </div>

        <nav className="flex flex-wrap gap-6 sm:gap-8 text-[#a3a3a3]">
          <Link href="#request-section" className="hover:text-white transition-colors uppercase">
            Concierge
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors uppercase">
            How It Works
          </Link>
          <Link href="#human-concierge" className="hover:text-white transition-colors uppercase">
            About
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors uppercase">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors uppercase">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors uppercase">
            Terms
          </Link>
        </nav>

        <div className="text-[#525252]">
          &copy; {new Date().getFullYear()} Proventa Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

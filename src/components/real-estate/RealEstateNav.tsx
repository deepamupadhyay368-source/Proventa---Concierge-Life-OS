'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Building2, BarChart3, MapPin, Calculator, FileText, ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Property Prices', href: '/property-intelligence' },
  { label: 'Locations', href: '/location-intelligence' },
  { label: 'Projects', href: '/project-intelligence' },
  { label: 'Investment', href: '/investment-intelligence' },
  { label: 'Research', href: '/reports' },
  { label: 'Pricing', href: '/pricing' },
];

export function RealEstateNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#C8C4BA]/50 bg-[#F5F3ED]/95 backdrop-blur-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-baseline gap-2.5 group">
          <span className="text-xl sm:text-2xl font-black tracking-wider uppercase text-[#202B3C]">
            PROVENTA
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568] border-l border-[#C8C4BA] pl-2.5">
            Real Estate Intelligence
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-[#69717B] hover:text-[#202B3C] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-wider text-[#202B3C] hover:text-[#547568] px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-9 px-4 text-xs font-bold uppercase tracking-wider bg-[#202B3C] text-white hover:bg-[#151D29] transition-all rounded-xs shadow-xs"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-wider text-[#202B3C] px-2 py-1"
          >
            Sign In
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-[#202B3C] hover:text-[#547568] cursor-pointer"
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="sm:hidden border-t border-[#C8C4BA]/60 bg-[#F5F3ED] px-4 py-5 space-y-3">
          <div className="flex flex-col space-y-2.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold uppercase tracking-wider text-[#202B3C] py-1.5 hover:text-[#547568]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-[#C8C4BA]/50 flex flex-col gap-2">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="w-full text-center py-2.5 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider rounded-xs"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

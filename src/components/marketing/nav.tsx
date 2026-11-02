'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X, ShieldCheck, Compass } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const PRIMARY_NAV_ITEMS = [
  { label: 'Proventa Object', href: '/#object' },
  { label: 'Topology', href: '/#topology' },
  { label: 'Time Landscapes', href: '/#landscapes' },
  { label: 'Codex Registers', href: '/#registers' },
  { label: 'Fiduciary Pricing', href: '/pricing' },
  { label: 'DPDP Security', href: '/#privacy' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080A0F]/95 backdrop-blur-md border-b border-[#B9C1CC]/15 text-[#F4F2ED] font-sans shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Left: Monogram + Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <div className="w-8 h-8 bg-[#2457E8] text-[#F4F2ED] rounded-xs flex items-center justify-center font-heading font-black text-sm tracking-tighter group-hover:bg-[#1D4ED8] transition-all shadow-md shadow-[#2457E8]/20">
                P
              </div>
              <span className="font-heading text-xl tracking-[0.1em] uppercase font-black text-[#F4F2ED]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#B9C1CC]/20" />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#2457E8] font-bold">
              EXPERIMENTAL DIGITAL ART
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'font-mono text-xs uppercase tracking-wider transition-colors py-1',
                    isActive
                      ? 'text-[#2457E8] font-bold border-b-2 border-[#2457E8]'
                      : 'text-[#B9C1CC] hover:text-[#F4F2ED]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
            <Link
              href="/login"
              className="px-4 py-2 text-[#B9C1CC] hover:text-[#F4F2ED] transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2457E8] text-[#F4F2ED] hover:bg-[#1D4ED8] uppercase tracking-wider font-bold rounded-xs shadow-sm transition-all"
            >
              <span>Platform Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-[#B9C1CC] hover:text-[#F4F2ED] focus:outline-none"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#B9C1CC]/15 bg-[#171B23] px-4 pt-3 pb-6 space-y-3 font-mono text-xs uppercase tracking-wider">
          <nav className="flex flex-col space-y-2">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-[#B9C1CC] hover:text-[#F4F2ED]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#B9C1CC]/15 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-center text-[#B9C1CC] hover:text-[#F4F2ED]"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-center bg-[#2457E8] text-[#F4F2ED] font-bold rounded-xs"
            >
              Open Cockpit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

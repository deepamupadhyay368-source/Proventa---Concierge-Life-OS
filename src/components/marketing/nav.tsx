'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Materials', href: '/categories' },
  { label: 'For suppliers', href: '/for-suppliers' },
  { label: 'About', href: '/how-it-works#about' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF] border-b border-[#D9D8CF] text-[#171A17] font-sans">
      {/* Top Utility Bar */}
      <div className="hidden lg:block bg-[#E7E5DC] border-b border-[#D9D8CF] text-xs text-[#777970] py-1.5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#171A17] font-medium">
              <span className="w-2 h-2 bg-[#53634A]" />
              PROVENTA INFRASTRUCTURE & CONSTRUCTION PROCUREMENT
            </span>
            <span className="text-[#D9D8CF]">|</span>
            <span>AHMEDABAD & GUJARAT REGION</span>
          </div>
          <div className="flex items-center gap-6 text-[#171A17] font-medium">
            <Link href="/buyer/dashboard" className="hover:text-[#53634A] transition-colors">
              Buyer Portal
            </Link>
            <span className="text-[#D9D8CF]">|</span>
            <Link href="/supplier/dashboard" className="hover:text-[#53634A] transition-colors">
              Supplier Portal
            </Link>
            <span className="text-[#D9D8CF]">|</span>
            <Link href="/admin/procurement" className="hover:text-[#53634A] transition-colors">
              Procurement Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* PROVENTA Architectural Wordmark */}
          <Link href="/" className="flex items-center gap-3.5 focus:outline-none">
            <div className="w-8 h-8 bg-[#53634A] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-sm tracking-tight">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl tracking-[0.16em] uppercase font-black text-[#171A17] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#777970] mt-1 font-semibold">
                Construction Procurement
              </span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-xs uppercase tracking-wider font-semibold transition-colors py-2 border-b-2',
                    isActive
                      ? 'text-[#53634A] border-[#53634A]'
                      : 'text-[#777970] border-transparent hover:text-[#171A17] hover:border-[#D9D8CF]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs: Sign in + Post a requirement (primary olive button) */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-xs uppercase tracking-wider font-semibold text-[#171A17] hover:text-[#53634A] transition-colors font-mono"
            >
              Sign in
            </Link>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs tracking-wider uppercase transition-colors"
            >
              <span>Post a requirement</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#171A17] hover:bg-[#E7E5DC] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#D9D8CF] px-6 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-wider font-semibold text-[#171A17] hover:text-[#53634A] py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#D9D8CF] flex flex-col gap-3 font-mono">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2 text-xs uppercase tracking-wider font-bold text-[#171A17] border border-[#D9D8CF] bg-[#F2F0E9]"
            >
              Sign in
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 bg-[#53634A] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold"
            >
              Post a requirement
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X, PlusCircle, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Post Requirement', href: '/rfq/new' },
  { label: 'Categories', href: '/categories' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Buyers', href: '/for-buyers' },
  { label: 'For Suppliers', href: '/for-suppliers' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090B10]/95 backdrop-blur-md border-b border-[#252C38] text-[#F4F6FA] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Brand Monogram & Name */}
          <Link
            href="/"
            className="group flex items-center gap-3.5 focus:outline-none"
          >
            <div className="w-10 h-10 bg-[#F25C05] text-[#FFFFFF] flex items-center justify-center font-heading font-black text-lg tracking-tight rounded-xs group-hover:bg-[#D94E00] transition-colors shadow-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl tracking-[0.08em] uppercase font-black text-[#F4F6FA]">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#F25C05] font-semibold">
                Construction Procurement
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors py-1',
                    isActive
                      ? 'text-[#F25C05] font-bold'
                      : 'text-[#C5CAD3] hover:text-[#F4F6FA]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Portals */}
          <div className="hidden sm:flex items-center gap-3.5">
            <Link
              href="/supplier/dashboard"
              className="text-xs font-semibold uppercase tracking-wider text-[#C5CAD3] hover:text-[#F4F6FA] border border-[#252C38] hover:border-[#858D9B] px-3.5 py-2 rounded-xs transition-colors"
            >
              Supplier Portal
            </Link>
            <Link
              href="/buyer/dashboard"
              className="text-xs font-semibold uppercase tracking-wider text-[#C5CAD3] hover:text-[#F4F6FA] px-2 py-2 transition-colors"
            >
              Buyer Portal
            </Link>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F25C05] text-white hover:bg-[#D94E00] font-bold text-xs tracking-wider uppercase rounded-xs transition-all shadow-md group"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post RFQ</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-[#C5CAD3] hover:text-[#F4F6FA] focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#252C38] bg-[#171C26] px-6 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-[#C5CAD3] hover:text-[#F4F6FA] py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#252C38] flex flex-col gap-3">
            <Link
              href="/supplier/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 text-sm text-[#C5CAD3] hover:text-[#F4F6FA] border border-[#252C38]"
            >
              Supplier Portal
            </Link>
            <Link
              href="/buyer/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 text-sm text-[#C5CAD3] hover:text-[#F4F6FA]"
            >
              Buyer Portal
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F25C05] text-white font-bold text-xs tracking-wider uppercase rounded-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Requirement (RFQ)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

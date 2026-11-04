'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Buyers', href: '/for-buyers' },
  { label: 'For Suppliers', href: '/for-suppliers' },
  { label: 'Materials', href: '/categories' },
  { label: 'About Us', href: '/how-it-works#about' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090B10] border-b border-[#252C38] text-[#F4F6FA] font-sans">
      {/* Top Utility Bar */}
      <div className="hidden lg:block bg-[#171C26] border-b border-[#252C38]/60 text-xs text-[#858D9B] py-1.5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#C5CAD3]">
              <span className="w-1.5 h-1.5 bg-[#F25C05]" />
              ESTABLISHED PROCUREMENT NETWORK · GUJARAT
            </span>
            <span>SUPPORT: support@proventa.in</span>
          </div>
          <div className="flex items-center gap-6 text-[#C5CAD3]">
            <Link href="/buyer/dashboard" className="hover:text-[#F25C05] transition-colors">
              Buyer Portal
            </Link>
            <span className="text-[#252C38]">|</span>
            <Link href="/supplier/dashboard" className="hover:text-[#F25C05] transition-colors">
              Supplier Portal
            </Link>
            <span className="text-[#252C38]">|</span>
            <Link href="/admin/procurement" className="hover:text-[#F25C05] transition-colors">
              Procurement Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* PROVENTA Industrial Logo */}
          <Link href="/" className="flex items-center gap-3.5 focus:outline-none">
            <div className="w-9 h-9 bg-[#F25C05] text-[#090B10] flex items-center justify-center font-mono font-black text-lg tracking-tighter">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-xl tracking-[0.14em] uppercase font-black text-[#F4F6FA] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#858D9B] mt-1 font-semibold">
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
                      ? 'text-[#F25C05] border-[#F25C05]'
                      : 'text-[#C5CAD3] border-transparent hover:text-[#FFFFFF] hover:border-[#858D9B]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs: Login + Post Requirement */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs uppercase tracking-wider font-semibold text-[#C5CAD3] hover:text-[#FFFFFF] px-3 py-2 transition-colors font-mono"
            >
              Login
            </Link>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] text-[#090B10] font-black text-xs tracking-wider uppercase transition-colors"
            >
              <span>Post Requirement</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-[#C5CAD3] hover:text-[#F4F6FA] focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#252C38] bg-[#171C26] px-6 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm uppercase tracking-wider font-semibold text-[#C5CAD3] hover:text-[#F4F6FA] py-2 border-b border-[#252C38]/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 flex flex-col gap-3 font-mono">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 text-xs uppercase tracking-wider font-semibold text-[#C5CAD3] border border-[#252C38]"
            >
              Login
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F25C05] text-[#090B10] font-black text-xs tracking-wider uppercase"
            >
              <span>Post Requirement</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
              <Link
                href="/buyer/dashboard"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-[#858D9B] hover:text-[#F4F6FA] border border-[#252C38]/60"
              >
                Buyer Portal
              </Link>
              <Link
                href="/supplier/dashboard"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-[#858D9B] hover:text-[#F4F6FA] border border-[#252C38]/60"
              >
                Supplier Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

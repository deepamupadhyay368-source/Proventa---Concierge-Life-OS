'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Materials', href: '/categories' },
  { label: 'For Buyers', href: '/for-buyers' },
  { label: 'For Suppliers', href: '/for-suppliers' },
  { label: 'About', href: '/how-it-works#about' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#191B20] border-b border-[#414957] text-[#F1F2F4] font-sans">
      {/* Top Utility Bar */}
      <div className="hidden lg:block bg-[#121418] border-b border-[#414957]/60 text-xs text-[#A8ADB7] py-1.5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#F1F2F4] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 bg-[#C66A42]" />
              PROVENTA — INDUSTRIAL PROCUREMENT PLATFORM
            </span>
            <span className="text-[#414957]">|</span>
            <span className="text-[#A8ADB7]">AHMEDABAD & GUJARAT REGION</span>
          </div>
          <div className="flex items-center gap-5 text-[#A8ADB7]">
            <Link href="/buyer/dashboard" className="hover:text-[#F1F2F4] transition-colors">
              Buyer Portal
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/supplier/dashboard" className="hover:text-[#F1F2F4] transition-colors">
              Supplier Portal
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/logistics/deliveries" className="hover:text-[#F1F2F4] transition-colors">
              Fleet Tracking
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/admin/verification" className="hover:text-[#F1F2F4] transition-colors">
              Compliance Desk
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/admin/procurement" className="hover:text-[#F1F2F4] transition-colors">
              Procurement Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-6">
          {/* PROVENTA Architectural Wordmark */}
          <Link href="/" className="flex items-center gap-3 focus:outline-none">
            <div className="w-7 h-7 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-xs tracking-tight rounded-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl tracking-[0.16em] uppercase font-black text-[#F1F2F4] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.24em] text-[#A8ADB7] mt-1 font-semibold">
                Industrial Procurement
              </span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 text-[12px]',
                    isActive
                      ? 'text-[#FFFFFF]'
                      : 'text-[#A8ADB7] hover:text-[#FFFFFF]'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C66A42]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs: Sign In + POST A REQUIREMENT */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href="/onboarding/business"
              className={cn(
                'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px]',
                pathname === '/onboarding/business' ? 'text-[#FFFFFF]' : 'text-[#C66A42] hover:text-[#FFFFFF]'
              )}
            >
              Register Business
            </Link>
            <Link
              href="/sign-in"
              className={cn(
                'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px]',
                pathname === '/sign-in' ? 'text-[#FFFFFF]' : 'text-[#A8ADB7] hover:text-[#FFFFFF]'
              )}
            >
              Sign In
              {pathname === '/sign-in' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C66A42]" />
              )}
            </Link>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs tracking-wider uppercase transition-colors rounded-sm shadow-sm"
            >
              <span>POST A REQUIREMENT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#F1F2F4] hover:bg-[#252B38] transition-colors rounded-sm"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#191B20] border-b border-[#414957] px-6 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-sm uppercase tracking-wider font-semibold py-1.5 flex items-center justify-between',
                    isActive ? 'text-[#C66A42]' : 'text-[#A8ADB7] hover:text-[#F1F2F4]'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 bg-[#C66A42]" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#414957] flex flex-col gap-3 font-mono">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#F1F2F4] border border-[#414957] bg-[#252B38] rounded-sm hover:bg-[#303746]"
            >
              Sign In
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold rounded-sm"
            >
              POST A REQUIREMENT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

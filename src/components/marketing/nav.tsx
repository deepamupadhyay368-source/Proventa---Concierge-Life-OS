'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const PRIMARY_NAV_ITEMS = [
  { label: 'Businesses', href: '/businesses' },
  { label: 'Products', href: '/listings?type=PRODUCT' },
  { label: 'Services', href: '/listings?type=SERVICE' },
  { label: 'Industries', href: '/#industries' },
  { label: 'For Businesses', href: '/for-businesses' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#171A14]/95 backdrop-blur-md border-b border-[#4C4A40] text-[#F6F0E4]">
      <div className="container-wide">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Left: PROVENTA Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <span className="font-serif text-2xl sm:text-[26px] tracking-[0.18em] uppercase text-[#F6F0E4] transition-colors group-hover:text-[#B94E2D]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <span className="hidden xl:inline-block h-3.5 w-[1px] bg-[#4C4A40]" />
            <span className="hidden xl:inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#A7A194]">
              Every Business. One Place.
            </span>
          </div>

          {/* Center: Compact Uppercase Navigation Labels */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 xl:gap-9"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const baseHref = item.href.split('?')[0];
              const isActive =
                item.href !== '/#industries' &&
                baseHref !== '/' &&
                pathname === baseHref;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'font-mono text-[11px] uppercase tracking-[0.18em] transition-colors py-1 border-b-2',
                    isActive
                      ? 'text-[#F6F0E4] border-[#B94E2D]'
                      : 'text-[#A7A194] border-transparent hover:text-[#F6F0E4]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search Icon/Action, Sign In, "List Your Business" CTA */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link
              href="/businesses"
              aria-label="Search businesses, products, and services"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#4C4A40] bg-[#20211C] text-[#F6F0E4] transition-colors hover:border-[#B94E2D] hover:text-[#B94E2D]"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#F6F0E4] hover:text-[#B94E2D] transition-colors px-2 py-2"
            >
              Sign In
            </Link>

            <Link
              href="/business/register"
              className="hidden sm:inline-flex items-center gap-2 rounded-[2px] bg-[#B94E2D] border border-[#B94E2D] px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#F6F0E4] transition-all hover:bg-[#A14122]"
            >
              <span>List Your Business</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-[2px] border border-[#4C4A40] bg-[#20211C] text-[#F6F0E4] hover:border-[#B94E2D]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#4C4A40] bg-[#171A14] text-[#F6F0E4]">
          <div className="container-wide py-4 divide-y divide-[#4C4A40]/60">
            {PRIMARY_NAV_ITEMS.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-[#F6F0E4] hover:text-[#B94E2D]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#A98253]">
                    0{idx + 1}
                  </span>
                  <span>{item.label}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#A7A194]" />
              </Link>
            ))}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-3 border border-[#4C4A40] bg-[#20211C] font-mono text-xs uppercase tracking-[0.18em] text-[#F6F0E4]"
              >
                Sign In
              </Link>
              <Link
                href="/business/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 bg-[#B94E2D] font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#F6F0E4]"
              >
                <span>List Your Business</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

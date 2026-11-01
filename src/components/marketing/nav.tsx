'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, ShieldCheck, X } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const PRIMARY_NAV_ITEMS = [
  { label: 'Overview', href: '/#overview' },
  { label: 'Living System', href: '/#living-system' },
  { label: 'Family Vault', href: '/#vault' },
  { label: 'Intelligence', href: '/#intelligence' },
  { label: 'Plans', href: '/pricing' },
  { label: 'Security & DPDP', href: '/#security' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#1E293B] text-[#F8F9FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Left: PROVENTA Wordmark & Category badge */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#1E1035] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[#7C3AED]/20 border border-[#A78BFA]/30">
                P
              </div>
              <span className="font-serif text-2xl tracking-[0.16em] uppercase text-white transition-colors group-hover:text-[#DDD0F7]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#3B2264]" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E1035] border border-[#3E236E] text-[10px] font-mono uppercase tracking-[0.15em] text-[#DDD0F7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Family Wealth OS
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-8"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-xs tracking-wider font-medium uppercase transition-colors py-1',
                    isActive
                      ? 'text-[#A78BFA] font-semibold'
                      : 'text-[#9D8BC9] hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase text-[#DDD0F7] bg-[#1E1035] hover:bg-[#2A164D] border border-[#3E236E] transition-all"
            >
              Console
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] shadow-lg shadow-[#7C3AED]/25 transition-all"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#9D8BC9] hover:text-white"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[#1E293B] bg-[#0B0F19] px-6 py-5 space-y-4">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm uppercase tracking-wider text-[#9D8BC9] hover:text-white py-1"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#1E293B] flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="text-center px-4 py-2.5 rounded-lg text-xs font-semibold uppercase text-white bg-[#1E1035] border border-[#3E236E]"
            >
              Open Family Console
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="text-center px-4 py-2.5 rounded-lg text-xs font-semibold uppercase text-white bg-[#7C3AED]"
            >
              Begin Wealth Onboarding
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;
export default MarketingNav;

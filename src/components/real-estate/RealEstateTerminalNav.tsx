'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Building2, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { href: '/property-intelligence', label: 'Property Registry' },
  { href: '/market-intelligence', label: 'Market Intelligence' },
  { href: '/project-intelligence', label: 'Projects' },
  { href: '/investment-intelligence', label: 'Investment' },
  { href: '/property-os', label: 'Property OS' },
  { href: '/pricing', label: 'Pricing' },
];

export function RealEstateTerminalNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#1E293B] border border-[#0D9488]/60 flex items-center justify-center rounded-xs">
              <Building2 className="w-4 h-4 text-[#2DD4BF]" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-bold tracking-[0.16em] text-white">
                PROVENTA
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-[#2DD4BF] mt-0.5">
                Real Estate Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-medium tracking-wide transition-colors ${
                    active
                      ? 'text-[#2DD4BF] border-b-2 border-[#2DD4BF] py-1 font-semibold'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3 py-2 text-xs font-medium text-[#CBD5E1] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white text-xs font-semibold rounded-xs transition-colors"
            >
              Terminal
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white border border-[#334155] rounded-xs"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#0F172A] border-t border-[#1E293B] px-4 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[#E2E8F0] hover:text-[#2DD4BF] border-b border-[#1E293B]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center bg-[#1E293B] text-white text-xs font-semibold rounded-xs"
            >
              Open Intelligence Terminal
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center border border-[#334155] text-[#E2E8F0] text-xs font-semibold rounded-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

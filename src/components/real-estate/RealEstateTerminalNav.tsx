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
    <header className="sticky top-0 z-40 bg-[#080E18]/95 backdrop-blur-sm text-[#F5F7FA] border-b border-[#29384B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#101A29] border border-[#29384B] flex items-center justify-center rounded-xs">
              <Building2 className="w-4 h-4 text-[#D7AD69]" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-bold tracking-[0.18em] text-[#F5F7FA]">
                PROVENTA
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-[#4D9FFF] mt-0.5">
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
                      ? 'text-[#4D9FFF] border-b-2 border-[#4D9FFF] py-1 font-semibold'
                      : 'text-[#AAB6C5] hover:text-[#F5F7FA]'
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
              className="px-3 py-2 text-xs font-medium text-[#AAB6C5] hover:text-[#F5F7FA] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-2 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-[#F5F7FA] text-xs font-semibold rounded-xs transition-colors"
            >
              Terminal
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#4D9FFF] hover:bg-[#3B8EEE] text-[#080E18] text-xs font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#F5F7FA] border border-[#29384B] bg-[#101A29] rounded-xs"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#080E18] border-t border-[#29384B] px-4 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[#AAB6C5] hover:text-[#4D9FFF] border-b border-[#1B2A3D]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center bg-[#152235] border border-[#29384B] text-[#F5F7FA] text-xs font-semibold rounded-xs"
            >
              Open Intelligence Terminal
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center border border-[#29384B] text-[#AAB6C5] text-xs font-semibold rounded-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

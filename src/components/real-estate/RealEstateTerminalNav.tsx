'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/property-intelligence', label: 'Property Intelligence' },
  { href: '/market-intelligence', label: 'Market Intelligence' },
  { href: '/location-intelligence', label: 'Location Intelligence' },
  { href: '/project-intelligence', label: 'Project Intelligence' },
  { href: '/investment-intelligence', label: 'Investment Intelligence' },
];

export function RealEstateTerminalNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] text-[#202B38] border-b border-[#E8EBEF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          {/* Left: PROVENTA Wordmark */}
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span className="text-base font-bold tracking-[0.18em] text-[#202B38]">
              PROVENTA
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#697586] mt-0.5">
              Real Estate Intelligence
            </span>
          </Link>

          {/* Centre: Five Core Intelligence Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-medium tracking-wide transition-colors py-1 ${
                    active
                      ? 'text-[#29465F] border-b-2 border-[#29465F] font-semibold'
                      : 'text-[#697586] hover:text-[#202B38]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Sign In + Get Started */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-[#202B38] hover:text-[#29465F] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-[#29465F] hover:bg-[#20384C] text-[#FFFFFF] text-xs font-semibold rounded-xs transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#202B38] border border-[#E8EBEF] bg-[#FFFFFF] rounded-xs"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-t border-[#E8EBEF] px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2.5 text-sm font-medium border-b border-[#F3F5F7] ${
                  active ? 'text-[#29465F] font-semibold' : 'text-[#202B38] hover:text-[#29465F]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/property-os"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 text-sm font-medium text-[#697586] hover:text-[#202B38] border-b border-[#F3F5F7]"
          >
            Property OS
          </Link>
          <Link
            href="/reports"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 text-sm font-medium text-[#697586] hover:text-[#202B38] border-b border-[#F3F5F7]"
          >
            Reports
          </Link>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center border border-[#E8EBEF] text-[#202B38] text-xs font-semibold rounded-xs"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center bg-[#29465F] text-[#FFFFFF] text-xs font-semibold rounded-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

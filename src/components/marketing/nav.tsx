'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const PRIMARY_NAV_ITEMS = [
  { label: 'Living Telemetry', href: '/#telemetry' },
  { label: '10 Registers', href: '/#registers' },
  { label: 'Encrypted Vault', href: '/#vault' },
  { label: 'Research Console', href: '/#intelligence' },
  { label: 'Institutional Licensing', href: '/pricing' },
  { label: 'DPDP Privacy', href: '/#privacy' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#171C26] border-b border-[#252C38] text-[#F4F6FA] font-sans">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Left: Monogram + Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <div className="w-8 h-8 bg-[#2457FF] text-[#F4F6FA] border border-[#7595FF]/40 rounded-[2px] flex items-center justify-center font-mono font-bold text-sm tracking-tighter group-hover:bg-[#1B46D9] transition-all">
                P
              </div>
              <span className="font-display text-xl tracking-[0.16em] uppercase font-bold text-[#F4F6FA]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#252C38]" />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#7595FF] font-semibold">
              FAMILY WEALTH OS
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
                    'font-mono text-xs uppercase tracking-wider transition-colors py-1',
                    isActive
                      ? 'text-[#F4F6FA] font-bold border-b-2 border-[#2457FF]'
                      : 'text-[#858D9B] hover:text-[#7595FF]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#252C38] bg-[#090B10] text-[#C5CAD3] hover:text-[#F4F6FA] hover:border-[#7595FF]/50 uppercase tracking-wider font-semibold transition-colors rounded-[2px]"
            >
              Command Console
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#2457FF] text-[#F4F6FA] hover:bg-[#1B46D9] uppercase tracking-wider font-semibold border border-[#7595FF]/40 transition-all rounded-[2px] shadow-[0_0_15px_rgba(36,87,255,0.3)]"
            >
              <span>Commence Intake</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 border border-[#252C38] text-[#C5CAD3] hover:text-[#F4F6FA] hover:bg-[#252C38] rounded-[2px]"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#252C38] bg-[#171C26] p-4 space-y-3 font-mono text-xs">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-[#C5CAD3] hover:text-[#7595FF] uppercase tracking-wider"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#252C38] flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-center border border-[#252C38] bg-[#090B10] uppercase text-[#F4F6FA] rounded-[2px]"
            >
              Enter Living Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default MarketingNav;
export const PublicNav = MarketingNav;

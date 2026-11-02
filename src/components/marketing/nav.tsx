'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const PRIMARY_NAV_ITEMS = [
  { label: 'Living Universe', href: '/#universe' },
  { label: 'Dynamic Trajectory', href: '/#trajectory' },
  { label: 'Family Constellation', href: '/#constellation' },
  { label: 'Encrypted Vault', href: '/#vault' },
  { label: 'Licensing & Membership', href: '/pricing' },
  { label: 'DPDP Security', href: '/#privacy' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] text-[#0F172A] font-sans shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Left: Monogram + Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 focus:outline-none"
            >
              <div className="w-8 h-8 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-display font-bold text-sm tracking-tighter group-hover:bg-[#1D4ED8] transition-all shadow-sm shadow-blue-500/25">
                P
              </div>
              <span className="font-display text-xl tracking-[0.1em] uppercase font-bold text-[#0F172A]">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-[#E2E8F0]" />
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2563EB] font-medium">
              LIVING FINANCIAL UNIVERSE
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7"
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
                      ? 'text-[#2563EB] font-bold border-b-2 border-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#2563EB]',
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
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] hover:border-[#2563EB] uppercase tracking-wider font-semibold transition-colors rounded-lg shadow-sm"
            >
              Command Console
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] uppercase tracking-wider font-semibold transition-all rounded-lg shadow-sm shadow-blue-500/25"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white p-4 space-y-3 font-mono text-xs shadow-lg">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-[#475569] hover:text-[#2563EB] border-b border-[#F1F5F9]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 border border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] font-semibold uppercase rounded-lg"
            >
              Command Console
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 bg-[#2563EB] text-white font-semibold uppercase rounded-lg shadow-sm"
            >
              Commence Intake
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;
export default MarketingNav;

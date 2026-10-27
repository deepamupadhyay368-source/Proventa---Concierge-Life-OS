'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const INDEX_NAV_ITEMS = [
  { index: '01', label: 'DIRECTORY', href: '/businesses', meta: 'Entities' },
  { index: '02', label: 'CATALOG', href: '/listings', meta: 'Offerings' },
  { index: '03', label: 'SECTORS', href: '/#categories', meta: '18 Codes' },
  { index: '04', label: 'FOR BUSINESSES', href: '/for-businesses', meta: 'Publish' },
  { index: '05', label: 'PROTOCOL', href: '/how-it-works', meta: 'RFQ Flow' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F4F1EA] border-b-2 border-[#0D0E11]">
      {/* Top Archival Specification Strip */}
      <div className="bg-[#0D0E11] text-[#F4F1EA] border-b border-[#26282E]">
        <div className="container-wide flex h-8 items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em]">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 bg-[#C8F904] text-[#0D0E11] px-1.5 py-0.5 font-bold tracking-[0.12em]">
              <span className="h-1.5 w-1.5 bg-[#0D0E11]" />
              IDX // LIVE
            </span>
            <span className="truncate text-[#CFCAC0]">
              THE BUSINESS INDEX — UNIVERSAL COMMERCIAL REGISTRY &amp; QUOTATION EXCHANGE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-[#CFCAC0] shrink-0">
            <span>EDITION: IN-GLOBAL // 18 SECTORS</span>
            <span className="text-[#52514E]">|</span>
            <Link
              href="/enquiries/new"
              className="text-[#C8F904] hover:underline underline-offset-4 font-semibold"
            >
              DISPATCH BUYER ENQUIRY →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Swiss Grid Masthead */}
      <div className="container-wide">
        <div className="grid grid-cols-12 items-stretch min-h-[64px]">
          {/* Brand Identity Cell */}
          <div className="col-span-7 sm:col-span-5 lg:col-span-3 flex items-center pr-4 border-r border-[#CFCAC0]">
            <Link
              href="/"
              className="group flex items-center gap-3 py-2 focus:outline-none"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#0D0E11] text-[#F4F1EA] border border-[#0D0E11] font-mono text-xs font-bold tracking-tighter transition-colors group-hover:bg-[#C8F904] group-hover:text-[#0D0E11]">
                PV/I
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-[-0.04em] text-[#0D0E11] leading-none">
                  {BRAND_CONFIG.name}
                </span>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#52514E]">
                  THE BUSINESS INDEX
                </span>
              </div>
            </Link>
          </div>

          {/* Numbered Editorial Navigation Cells (Desktop) */}
          <nav
            aria-label="Primary Index Navigation"
            className="hidden lg:grid lg:col-span-6 grid-cols-5 border-r border-[#CFCAC0]"
          >
            {INDEX_NAV_ITEMS.map((item) => {
              const isActive =
                item.href !== '/#categories' &&
                (pathname === item.href || pathname?.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex flex-col justify-between px-3.5 py-2.5 border-r last:border-r-0 border-[#CFCAC0] transition-colors',
                    isActive
                      ? 'bg-[#0D0E11] text-[#F4F1EA]'
                      : 'hover:bg-[#EAE5DA] text-[#0D0E11]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-[0.12em]',
                        isActive
                          ? 'text-[#C8F904] font-bold'
                          : 'text-[#52514E] group-hover:text-[#0D0E11]',
                      )}
                    >
                      /{item.index}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[9px] uppercase tracking-[0.08em]',
                        isActive ? 'text-[#CFCAC0]' : 'text-[#78756F]',
                      )}
                    >
                      {item.meta}
                    </span>
                  </div>
                  <span className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Action / Access Cell */}
          <div className="col-span-5 sm:col-span-7 lg:col-span-3 flex items-center justify-end gap-2 pl-4">
            <div className="hidden sm:flex items-center gap-2 w-full justify-end">
              <Link
                href="/sign-in"
                className="px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0E11] hover:bg-[#EAE5DA] transition-colors"
              >
                SIGN IN
              </Link>
              <Link
                href="/business/register"
                className="inline-flex items-center gap-1.5 bg-[#C8F904] text-[#0D0E11] border border-[#0D0E11] px-3.5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#0D0E11] hover:text-[#C8F904] transition-colors"
              >
                <span>LIST BUSINESS</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle index navigation"
              aria-expanded={mobileOpen}
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center border border-[#0D0E11] bg-[#FAF8F3] text-[#0D0E11] hover:bg-[#C8F904]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Ledger Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t-2 border-[#0D0E11] bg-[#FAF8F3]">
          <div className="divide-y divide-[#CFCAC0]">
            {INDEX_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#EAE5DA]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#0D0E11] bg-[#C8F904] px-1.5 py-0.5 border border-[#0D0E11]">
                    {item.index}
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#0D0E11]">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#52514E]">
                  {item.meta} →
                </span>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 border-t-2 border-[#0D0E11]">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#0D0E11] border-r border-[#0D0E11] bg-[#F4F1EA]"
            >
              SIGN IN
            </Link>
            <Link
              href="/business/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#0D0E11] bg-[#C8F904]"
            >
              LIST BUSINESS <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;


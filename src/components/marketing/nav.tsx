'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Platform', href: '/#platform' },
  { label: 'For Families', href: '/#families' },
  { label: 'Pricing', href: '/pricing' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090B10]/95 backdrop-blur-md border-b border-[#252C38] text-[#F4F6FA] font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Brand Monogram & Name */}
          <Link
            href="/"
            className="group flex items-center gap-3.5 focus:outline-none"
          >
            <div className="w-10 h-10 bg-[#2457FF] text-[#F4F6FA] flex items-center justify-center font-heading font-black text-lg tracking-tight rounded-xs group-hover:bg-[#1D4ED8] transition-colors shadow-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl tracking-[0.08em] uppercase font-black text-[#F4F6FA]">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#858D9B]">
                Financial Intelligence
              </span>
            </div>
          </Link>

          {/* Simple Main Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-9"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium tracking-wide transition-colors py-1',
                    isActive
                      ? 'text-[#2457FF] font-bold'
                      : 'text-[#C5CAD3] hover:text-[#F4F6FA]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Direct Authentication Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#C5CAD3] hover:text-[#F4F6FA] transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#F4F6FA] text-[#090B10] hover:bg-white font-medium text-xs tracking-wider uppercase rounded-xs transition-all shadow-sm group"
            >
              {/* Google G Icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-[#C5CAD3] hover:text-[#F4F6FA] focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#252C38] bg-[#171C26] px-6 py-6 space-y-4 font-sans">
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-[#C5CAD3] hover:text-[#F4F6FA] py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#252C38] flex flex-col gap-3">
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 text-sm text-[#C5CAD3] hover:text-[#F4F6FA]"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F4F6FA] text-[#090B10] font-medium text-xs tracking-wider uppercase rounded-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

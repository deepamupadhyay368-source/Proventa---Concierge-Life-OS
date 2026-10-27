'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/businesses', label: 'Explore Businesses' },
  { href: '/#categories', label: 'Categories' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-businesses', label: 'For Businesses' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E9ED] bg-[#FAFAF8]/95 backdrop-blur-md">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 focus-visible:outline-none"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#15171B] text-[13px] font-bold tracking-tight text-white transition-colors group-hover:bg-[#304FFE]">
              P
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold tracking-[-0.03em] text-[#15171B]">
                PROVENTA
              </span>
              <span className="hidden xl:inline-block text-[11px] font-medium text-[#696D76] border-l border-[#E8E9ED] pl-2">
                Every Business. One Place.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary Navigation"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href !== '/#categories' &&
                (pathname === link.href || pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2 rounded-[8px] text-[14px] font-medium transition-colors',
                    isActive
                      ? 'text-[#15171B] bg-[#F2F3F6]'
                      : 'text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6]/70',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-3.5 py-2 rounded-[8px] text-[14px] font-medium text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6]/70 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/enquiries/new"
              className="hidden lg:inline-flex items-center justify-center rounded-[9px] border border-[#E8E9ED] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#15171B] hover:bg-[#F2F3F6] hover:border-[#D1D4DC] transition-colors"
            >
              Post Enquiry
            </Link>
            <Link
              href="/business/register"
              className="inline-flex items-center gap-1.5 rounded-[9px] bg-[#15171B] px-4 py-2 text-[13px] font-semibold text-white shadow-card hover:bg-[#304FFE] transition-colors"
            >
              <span>List Your Business</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-[8px] border border-[#E8E9ED] bg-[#FFFFFF] text-[#15171B] hover:bg-[#F2F3F6] transition-colors"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E9ED] bg-[#FFFFFF] px-4 pt-3 pb-6 shadow-elevated animate-fade-in">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href !== '/#categories' &&
                (pathname === link.href || pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3.5 py-2.5 rounded-[8px] text-[15px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#F2F3F6] text-[#15171B]'
                      : 'text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6]',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/listings"
              onClick={() => setMobileOpen(false)}
              className="px-3.5 py-2.5 rounded-[8px] text-[15px] font-medium text-[#696D76] hover:text-[#15171B] hover:bg-[#F2F3F6] transition-colors"
            >
              Products & Services Catalog
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-[#E8E9ED] flex flex-col gap-2.5">
            <Link
              href="/business/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-[9px] bg-[#15171B] text-white text-[14px] font-semibold hover:bg-[#304FFE] transition-colors"
            >
              <span>List Your Business</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/enquiries/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-2.5 px-3 rounded-[9px] border border-[#E8E9ED] bg-[#FAFAF8] text-[#15171B] text-[14px] font-medium hover:bg-[#F2F3F6] transition-colors"
              >
                Post Enquiry
              </Link>
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-2.5 px-3 rounded-[9px] border border-[#E8E9ED] bg-[#FFFFFF] text-[#15171B] text-[14px] font-medium hover:bg-[#F2F3F6] transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { MarketingNav as PublicNav };

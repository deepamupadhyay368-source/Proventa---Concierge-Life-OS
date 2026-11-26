'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'PROVENTA PRICE', href: '/price' },
  { label: 'Locations', href: '/location-intelligence' },
  { label: 'Projects', href: '/project-intelligence' },
  { label: 'Investment', href: '/investment-intelligence' },
  { label: 'Research', href: '/reports' },
];

export function RealEstateNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#C8C4BA] bg-[#F5F3ED] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Lockup */}
        <Link href="/" className="flex flex-col group py-1">
          <span className="font-sans text-xl sm:text-[22px] font-black tracking-[0.16em] uppercase text-[#202B3C] leading-none">
            PROVENTA
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.28em] text-[#547568] font-bold mt-1 leading-none">
            Real Estate Intelligence
          </span>
        </Link>

        {/* Middle: Horizontal Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-[0.08em] transition-colors relative py-2 ${
                  active
                    ? 'text-[#202B3C] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#202B3C]'
                    : 'text-[#69717B] hover:text-[#202B3C]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-[0.08em] text-[#202B3C] hover:text-[#547568] transition-colors py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-9 px-4 text-xs font-bold uppercase tracking-[0.1em] bg-[#202B3C] text-white hover:bg-[#151D29] transition-all shadow-xs"
          >
            Create account
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex sm:hidden items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-[#202B3C]"
          >
            Sign in
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 text-[#202B3C] hover:text-[#547568] focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="sm:hidden border-t border-[#C8C4BA] bg-[#F5F3ED] px-4 py-5 space-y-4">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-xs font-bold uppercase tracking-wider text-[#202B3C] py-1 border-b border-[#C8C4BA]/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="w-full text-center py-2.5 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

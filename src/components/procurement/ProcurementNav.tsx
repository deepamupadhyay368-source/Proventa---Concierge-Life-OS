'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Building2, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { href: '/for-buyers', label: 'For Buyers' },
  { href: '/for-suppliers', label: 'For Suppliers' },
  { href: '/buyer/catalogue', label: 'Materials' },
  { href: '/buyer/comparison', label: 'Comparison Engine' },
  { href: '/pilot/pacifica', label: 'Institutional Pilot' },
];

export function ProcurementNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#D5DCE2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#172B3A] text-white flex items-center justify-center rounded-xs">
              <Building2 className="w-4 h-4 text-[#C9A45B]" />
            </div>
            <div className="leading-none">
              <span className="block text-sm font-bold tracking-[0.14em] text-[#172B3A]">
                PROVENTA
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-[0.18em] text-[#0F6B50] mt-0.5">
                Construction Procurement
              </span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'text-[#0F6B50] border-b-2 border-[#0F6B50] py-1'
                      : 'text-[#292F3D] hover:text-[#0F6B50]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-semibold text-[#172B3A] hover:text-[#0F6B50] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/buyer/dashboard"
              className="px-4 py-2 bg-[#E9ECEF] hover:bg-[#DCE2E8] text-[#172B3A] text-xs font-semibold rounded-xs transition-colors"
            >
              Buyer Workspace
            </Link>
            <Link
              href="/rfq/new"
              className="px-4 py-2 bg-[#172B3A] hover:bg-[#292F3D] text-white text-xs font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5"
            >
              <span>Create RFQ</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9A45B]" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#172B3A] border border-[#D5DCE2] rounded-xs"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#D5DCE2] px-4 py-4 space-y-3">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-semibold text-[#172B3A] hover:text-[#0F6B50] border-b border-[#E9ECEF]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/buyer/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center bg-[#E9ECEF] text-[#172B3A] text-xs font-semibold rounded-xs"
            >
              Buyer Workspace
            </Link>
            <Link
              href="/supplier/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center border border-[#172B3A] text-[#172B3A] text-xs font-semibold rounded-xs"
            >
              Supplier Workspace
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center bg-[#172B3A] text-white text-xs font-semibold rounded-xs"
            >
              Create RFQ
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

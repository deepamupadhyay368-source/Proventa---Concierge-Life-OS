'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Building2,
  FileSpreadsheet,
  FileText,
  Settings,
  Layers,
  Store,
  Package,
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

// Architectural Navigation Links matching prompt requirements
const NAV_ITEMS = [
  { label: 'Platform', href: '/how-it-works' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'About', href: '/about' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === 'authenticated' && !!session?.user?.id;
  const userRoles: string[] = (session?.user as { roles?: string[] })?.roles || [];
  const hasSupplierRole = userRoles.includes('SUPPLIER');
  const hasBuyerRole = userRoles.includes('BUYER');
  const isSupplier = hasSupplierRole && !hasBuyerRole ? true : (pathname.startsWith('/supplier') ? true : false);
  const isBuyer = hasBuyerRole && !hasSupplierRole ? true : (!pathname.startsWith('/supplier') ? true : false);
  const dashboardHref = pathname.startsWith('/supplier')
    ? '/supplier/dashboard'
    : (hasBuyerRole ? '/buyer/dashboard' : (hasSupplierRole ? '/supplier/dashboard' : '/buyer/dashboard'));
  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My Account';
  const userEmail = session?.user?.email || '';

  // Track scroll position for transparent navigation transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200 font-sans',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E2E8EF] shadow-xs text-[#243447]'
          : 'bg-white/80 backdrop-blur-md border-b border-[#E2E8EF]/80 text-[#243447]'
      )}
    >
      {/* Top Utility Datum Line */}
      <div className="hidden lg:block bg-[#F4F7FA] border-b border-[#E2E8EF] text-[11px] font-mono text-[#6B7785] py-1.5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#243447] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 bg-[#315F91]" />
              PROVENTA • INDUSTRIAL PROCUREMENT PLATFORM
            </span>
            <span className="text-[#AEBBC6]">|</span>
            <span className="text-[#6B7785]">SOURCE. PROCURE. DELIVER. SETTLE.</span>
          </div>
          <div className="flex items-center gap-4 text-[#6B7785]">
            <Link href="/buyer/dashboard" className="hover:text-[#315F91] transition-colors">
              Buyer Portal
            </Link>
            <span className="text-[#AEBBC6]">•</span>
            <Link href="/supplier/dashboard" className="hover:text-[#315F91] transition-colors">
              Supplier Portal
            </Link>
            <span className="text-[#AEBBC6]">•</span>
            <Link href="/how-it-works" className="hover:text-[#315F91] transition-colors">
              Verification Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Architectural Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-6">
          {/* Brand Wordmark & Monogram */}
          <Link href="/" className="flex items-center gap-3 focus:outline-none group">
            <div className="w-7 h-7 bg-[#315F91] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-xs tracking-tight rounded-xs group-hover:bg-[#264B74] transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl tracking-[0.18em] uppercase font-black text-[#243447] leading-none">
                {BRAND_CONFIG.name}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#6B7785] uppercase">
                Architecture &amp; Industry
              </span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 text-[12px]',
                    isActive
                      ? 'text-[#315F91]'
                      : 'text-[#6B7785] hover:text-[#243447]'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#315F91]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/sign-in"
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px]',
                    pathname === '/sign-in' ? 'text-[#315F91]' : 'text-[#6B7785] hover:text-[#243447]'
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] hover:text-[#315F91] font-semibold text-xs tracking-wider uppercase transition-colors rounded-xs"
                >
                  Get Started
                </Link>
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-semibold text-xs tracking-wider uppercase transition-colors rounded-xs shadow-xs"
                >
                  <span>Start Procuring</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={dashboardHref}
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px] flex items-center gap-1.5',
                    pathname.startsWith('/buyer/dashboard') || pathname.startsWith('/supplier/dashboard')
                      ? 'text-[#315F91]'
                      : 'text-[#6B7785] hover:text-[#243447]'
                  )}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Authenticated Account Menu Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F7FA] hover:bg-white border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs text-xs font-mono text-[#243447] transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#315F91] text-white flex items-center justify-center text-[10px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate font-semibold">{displayName}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white text-[#315F91] border border-[#E2E8EF] rounded-xs">
                      {isSupplier ? 'Supplier' : 'Buyer'}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-[#6B7785] transition-transform', accountMenuOpen && 'rotate-180')} />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8EF] rounded-xs shadow-lg py-2 z-50 font-sans text-xs">
                      {/* Identity header */}
                      <div className="px-4 py-2 border-b border-[#E2E8EF]">
                        <p className="font-semibold text-[#243447] truncate">{displayName}</p>
                        <p className="font-mono text-[11px] text-[#6B7785] truncate">{userEmail}</p>
                      </div>

                      {/* Role-Based Navigation Options */}
                      <div className="py-1">
                        {isBuyer ? (
                          <>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <User className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <Building2 className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>My Business</span>
                            </Link>
                            <Link
                              href="/buyer/rfqs"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>My RFQs</span>
                            </Link>
                            <Link
                              href="/buyer/orders"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <Package className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Purchase Orders</span>
                            </Link>
                            <Link
                              href="/buyer/payments"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Payment Intelligence</span>
                            </Link>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <Settings className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Account Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <Building2 className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>My Business Profile</span>
                            </Link>
                            <Link
                              href="/supplier/catalogue"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <Package className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Products &amp; Categories</span>
                            </Link>
                            <Link
                              href="/settings/business-profile?tab=tax"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Verification Status</span>
                            </Link>
                            <Link
                              href="/supplier/rfqs"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Received RFQs</span>
                            </Link>
                            <Link
                              href="/supplier/payments"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#243447] hover:bg-[#F4F7FA] hover:text-[#315F91]"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#315F91]" />
                              <span>Payment Intelligence</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-[#E2E8EF]">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#D9534F] hover:bg-[#F4F7FA] font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/rfq/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-semibold text-xs tracking-wider uppercase transition-colors rounded-xs shadow-xs"
                >
                  <span>Start Procuring</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#243447] hover:bg-[#F4F7FA] transition-colors rounded-xs"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8EF] px-6 py-6 space-y-4 font-sans shadow-lg">
          {isLoggedIn && (
            <div className="p-3 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#243447] truncate">{displayName}</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white text-[#315F91] border border-[#E2E8EF] rounded-xs">
                  {isSupplier ? 'Supplier' : 'Buyer'}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#6B7785] truncate">{userEmail}</p>
            </div>
          )}

          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'text-sm uppercase tracking-wider font-semibold py-1.5 flex items-center justify-between',
                    isActive ? 'text-[#315F91]' : 'text-[#6B7785] hover:text-[#243447]'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 bg-[#315F91]" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#E2E8EF] flex flex-col gap-3 font-mono">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#FFFFFF] bg-[#315F91] hover:bg-[#264B74] rounded-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#D9534F] border border-[#E2E8EF] bg-white rounded-xs hover:bg-[#F4F7FA] transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#243447] border border-[#E2E8EF] bg-white hover:bg-[#F4F7FA] rounded-xs"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#FFFFFF] bg-[#315F91] hover:bg-[#264B74] rounded-xs transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#315F91] text-[#243447] hover:text-[#315F91] text-xs uppercase tracking-wider font-bold rounded-xs mt-1"
            >
              Start Procuring
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

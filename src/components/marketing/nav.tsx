'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  ArrowUpRight,
  User,
  ChevronDown,
  LogOut,
  Building2,
  FileSpreadsheet,
  Settings,
  Layers,
  Store,
  CheckCircle2,
  Package,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Materials', href: '/categories' },
  { label: 'For Buyers', href: '/for-buyers' },
  { label: 'For Suppliers', href: '/for-suppliers' },
  { label: 'About', href: '/how-it-works#about' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === 'authenticated' && !!session?.user?.id;
  const userRoles: string[] = (session?.user as { roles?: string[] })?.roles || [];
  const isSupplier = userRoles.includes('SUPPLIER');
  const isBuyer = userRoles.includes('BUYER') || !isSupplier;
  const dashboardHref = isSupplier ? '/supplier/dashboard' : '/buyer/dashboard';
  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My Account';
  const userEmail = session?.user?.email || '';

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
    <header className="sticky top-0 z-50 w-full bg-[#191B20] border-b border-[#414957] text-[#F1F2F4] font-sans">
      {/* Top Utility Bar */}
      <div className="hidden lg:block bg-[#121418] border-b border-[#414957]/60 text-xs text-[#A8ADB7] py-1.5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[#F1F2F4] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 bg-[#C66A42]" />
              PROVENTA — CONSTRUCTION & INFRASTRUCTURE PROCUREMENT PLATFORM
            </span>
            <span className="text-[#414957]">|</span>
            <span className="text-[#A8ADB7]">AHMEDABAD & GUJARAT REGION</span>
          </div>
          <div className="flex items-center gap-5 text-[#A8ADB7]">
            <Link href="/buyer/dashboard" className="hover:text-[#F1F2F4] transition-colors">
              Buyer Portal
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/supplier/dashboard" className="hover:text-[#F1F2F4] transition-colors">
              Supplier Portal
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/logistics/deliveries" className="hover:text-[#F1F2F4] transition-colors">
              Fleet Tracking
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/admin/verification" className="hover:text-[#F1F2F4] transition-colors">
              Compliance Desk
            </Link>
            <span className="text-[#414957]">|</span>
            <Link href="/admin/procurement" className="hover:text-[#F1F2F4] transition-colors">
              Procurement Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-6">
          {/* PROVENTA Architectural Wordmark */}
          <Link href="/" className="flex items-center gap-3 focus:outline-none">
            <div className="w-7 h-7 bg-[#536B88] text-[#FFFFFF] flex items-center justify-center font-mono font-bold text-xs tracking-tight rounded-sm">
              P
            </div>
            <span className="font-heading text-lg sm:text-xl tracking-[0.16em] uppercase font-black text-[#F1F2F4] leading-none">
              {BRAND_CONFIG.name}
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 text-[12px]',
                    isActive
                      ? 'text-[#FFFFFF]'
                      : 'text-[#A8ADB7] hover:text-[#FFFFFF]'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C66A42]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs: Conditional on authentication state */}
          <div className="hidden sm:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/sign-up"
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px]',
                    pathname === '/sign-up' ? 'text-[#FFFFFF]' : 'text-[#C66A42] hover:text-[#FFFFFF]'
                  )}
                >
                  Create Account
                </Link>
                <Link
                  href="/sign-in"
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px]',
                    pathname === '/sign-in' ? 'text-[#FFFFFF]' : 'text-[#A8ADB7] hover:text-[#FFFFFF]'
                  )}
                >
                  Sign In
                  {pathname === '/sign-in' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C66A42]" />
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={dashboardHref}
                  className={cn(
                    'relative text-xs uppercase tracking-wider font-semibold transition-colors py-2 font-mono text-[12px] flex items-center gap-1.5',
                    pathname.startsWith('/buyer/dashboard') || pathname.startsWith('/supplier/dashboard')
                      ? 'text-[#FFFFFF]'
                      : 'text-[#A8ADB7] hover:text-[#FFFFFF]'
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#252B38] hover:bg-[#303746] border border-[#414957] hover:border-[#536B88] rounded-sm text-xs font-mono text-[#FFFFFF] transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#536B88] text-white flex items-center justify-center text-[10px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate font-semibold">{displayName}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#191B20] text-[#C66A42] border border-[#C66A42]/40 rounded-xs">
                      {isSupplier ? 'Supplier' : 'Buyer'}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-[#A8ADB7] transition-transform', accountMenuOpen && 'rotate-180')} />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#191B20] border border-[#414957] rounded-sm shadow-xl py-2 z-50 font-sans text-xs">
                      {/* Identity header */}
                      <div className="px-4 py-2 border-b border-[#414957]/60">
                        <p className="font-semibold text-[#FFFFFF] truncate">{displayName}</p>
                        <p className="font-mono text-[11px] text-[#A8ADB7] truncate">{userEmail}</p>
                      </div>

                      {/* Role-Based Navigation Options */}
                      <div className="py-1">
                        {isBuyer ? (
                          <>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <User className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Building2 className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>My Business</span>
                            </Link>
                            <Link
                              href="/buyer/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>My RFQs</span>
                            </Link>
                            <Link
                              href="/buyer/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>My Quotations</span>
                            </Link>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Settings className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Account Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Building2 className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>My Business Profile</span>
                            </Link>
                            <Link
                              href="/settings/business-profile?tab=overview"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <User className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Business Details</span>
                            </Link>
                            <Link
                              href="/supplier/catalogue"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Package className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Products &amp; Categories</span>
                            </Link>
                            <Link
                              href="/settings/business-profile?tab=tax"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Verification Status</span>
                            </Link>
                            <Link
                              href="/supplier/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Received RFQs</span>
                            </Link>
                            <Link
                              href="/supplier/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Submitted Quotations</span>
                            </Link>
                            <Link
                              href="/settings/business-profile"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-[#F1F2F4] hover:bg-[#252B38] hover:text-[#FFFFFF]"
                            >
                              <Settings className="w-3.5 h-3.5 text-[#536B88]" />
                              <span>Account Settings</span>
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-1 border-t border-[#414957]/60">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-[#D9534F] hover:bg-[#252B38] hover:text-[#ff6b6b] font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Post a Requirement Action */}
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs tracking-wider uppercase transition-colors rounded-sm shadow-sm"
            >
              <span>POST A REQUIREMENT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#F1F2F4] hover:bg-[#252B38] transition-colors rounded-sm"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#191B20] border-b border-[#414957] px-6 py-6 space-y-4 font-sans">
          {/* If Logged In: Identity Banner in Mobile Drawer */}
          {isLoggedIn && (
            <div className="p-3 bg-[#252B38] border border-[#414957] rounded-sm space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#FFFFFF] truncate">{displayName}</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#191B20] text-[#C66A42] border border-[#C66A42]/40 rounded-xs">
                  {isSupplier ? 'Supplier' : 'Buyer'}
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#A8ADB7] truncate">{userEmail}</p>
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
                    isActive ? 'text-[#C66A42]' : 'text-[#A8ADB7] hover:text-[#F1F2F4]'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 bg-[#C66A42]" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#414957] flex flex-col gap-3 font-mono">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#FFFFFF] border border-[#536B88] bg-[#252B38] rounded-sm hover:bg-[#303746] transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {isBuyer ? (
                  <>
                    <Link
                      href="/settings/business-profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <User className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings/business-profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>My Business</span>
                    </Link>
                    <Link
                      href="/buyer/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>My RFQs</span>
                    </Link>
                    <Link
                      href="/buyer/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>My Quotations</span>
                    </Link>
                    <Link
                      href="/settings/business-profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Account Settings</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/settings/business-profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>My Business Profile</span>
                    </Link>
                    <Link
                      href="/settings/business-profile?tab=overview"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <User className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Business Details</span>
                    </Link>
                    <Link
                      href="/supplier/catalogue"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Package className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Products &amp; Categories</span>
                    </Link>
                    <Link
                      href="/settings/business-profile?tab=tax"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Verification Status</span>
                    </Link>
                    <Link
                      href="/supplier/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Received RFQs</span>
                    </Link>
                    <Link
                      href="/supplier/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Submitted Quotations</span>
                    </Link>
                    <Link
                      href="/settings/business-profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 text-xs uppercase tracking-wider font-semibold text-[#F1F2F4] hover:text-white flex items-center gap-2 border-b border-[#414957]/40"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#536B88]" />
                      <span>Account Settings</span>
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#D9534F] border border-[#D9534F]/40 bg-[#252B38] rounded-sm hover:bg-[#303746] transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#FFFFFF] border border-[#C66A42] bg-[#C66A42] hover:bg-[#B35A33] rounded-sm transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs uppercase tracking-wider font-bold text-[#F1F2F4] border border-[#414957] bg-[#252B38] rounded-sm hover:bg-[#303746]"
                >
                  Sign In
                </Link>
              </>
            )}

            <Link
              href="/rfq/new"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2.5 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold rounded-sm mt-1"
            >
              POST A REQUIREMENT
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const PublicNav = MarketingNav;

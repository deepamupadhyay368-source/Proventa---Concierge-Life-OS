'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown, 
  Wrench, 
  User, 
  Briefcase, 
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react';

export default function HomeNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Services', href: '/services' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Membership', href: '/membership' },
    { label: 'Service Areas', href: '/service-areas' },
    { label: 'Societies', href: '/societies' },
    { label: 'Partners', href: '/partners' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F2F0E9]/95 backdrop-blur-md border-b border-[#E3DFD5]">
      {/* Top emergency & locality bar */}
      <div className="bg-[#171A17] text-[#E3DFD5] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white">Live in Ahmedabad:</span>
            <span className="text-stone-300">Bopal, South Bopal, Satellite, Prahlad Nagar, Gota, Science City & more</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>24/7 Breakdown Dispatch: <strong className="text-white">+91 79 4900 8800</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-[#53634A] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:bg-[#43523B] transition">
            P
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-xl text-[#171A17]">PROVENTA</span>
              <span className="text-xs uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded bg-[#53634A]/10 text-[#53634A]">
                HOME
              </span>
            </div>
            <span className="text-[10px] text-stone-500 tracking-wider uppercase font-medium">Household Maintenance Membership</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition py-1 ${
                  isActive 
                    ? 'text-[#53634A] font-semibold border-b-2 border-[#53634A]' 
                    : 'text-stone-700 hover:text-[#53634A]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Portal Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Portal Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 px-3 py-2 rounded-lg border border-[#E3DFD5] transition shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#53634A]" />
              <span>Portals</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {portalDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50"
                onMouseLeave={() => setPortalDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                  Select Workspace
                </div>
                <Link
                  href="/customer/dashboard"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-stone-800 hover:bg-stone-50 transition"
                >
                  <User className="w-4 h-4 text-[#53634A]" />
                  <div>
                    <div className="font-semibold">Customer Portal</div>
                    <div className="text-[11px] text-stone-500">Bookings, visits & passport</div>
                  </div>
                </Link>
                <Link
                  href="/partner/dashboard"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-stone-800 hover:bg-stone-50 transition"
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">Technician Partner</div>
                    <div className="text-[11px] text-stone-500">Live jobs, payouts & KYC</div>
                  </div>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setPortalDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-stone-800 hover:bg-stone-50 transition"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold">Control Centre</div>
                    <div className="text-[11px] text-stone-500">Dispatch, finance & SLA</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/customer/book"
            className="flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Book a Service</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-stone-700 hover:bg-stone-200/50 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#171A17]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F2F0E9] border-b border-[#E3DFD5] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-stone-800 hover:text-[#53634A] py-1.5 px-2 rounded-md hover:bg-stone-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E3DFD5] space-y-2">
            <Link
              href="/customer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 p-2 rounded-lg bg-white border border-[#E3DFD5]"
            >
              <User className="w-4 h-4 text-[#53634A]" /> Customer Dashboard
            </Link>
            <Link
              href="/partner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 p-2 rounded-lg bg-white border border-[#E3DFD5]"
            >
              <Wrench className="w-4 h-4 text-amber-600" /> Technician Partner Portal
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-stone-700 p-2 rounded-lg bg-white border border-[#E3DFD5]"
            >
              <Briefcase className="w-4 h-4 text-indigo-600" /> Admin Control Centre
            </Link>
            <Link
              href="/customer/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#53634A] text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" /> Book a Service
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

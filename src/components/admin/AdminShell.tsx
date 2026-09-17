'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  ListTodo,
  CalendarCheck,
  Headphones,
  BarChart3,
  ShieldAlert,
  HeartPulse,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export function AdminShell({
  children,
  sessionUser,
}: {
  children: React.ReactNode;
  sessionUser: any;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // If on login page, render children without sidebar/chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const primaryNavItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/requests', label: 'Requests', icon: ListTodo },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/admin/concierge', label: 'Concierge Operations', icon: Headphones },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/audit', label: 'Audit Logs', icon: ShieldAlert },
    { href: '/admin/system', label: 'System Health', icon: HeartPulse },
  ];

  const secondaryNavItems = [
    { href: '/admin/wave1', label: 'Wave 1 Waitlist' },
    { href: '/admin/providers', label: 'Partner Providers' },
    { href: '/admin/settings', label: 'Platform Settings' },
  ];

  const userRoles = (sessionUser?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/requests?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#0e0d0c] text-[#f5f3ef] flex font-sans selection:bg-[#9c8260] selection:text-white">
      {/* Sleek Dark Luxury Sidebar */}
      <aside className="w-64 border-r border-[#23201c] bg-[#141210] flex flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Top Brand Banner */}
          <div className="p-6 border-b border-[#23201c]">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#9c8260] to-[#c8b99d] flex items-center justify-center font-serif text-black font-bold text-lg shadow-md shadow-[#9c8260]/20">
                P
              </div>
              <div>
                <div className="font-serif font-semibold tracking-wider text-base text-[#fafaf9]">
                  PROVENTA
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#9c8260]">
                  Founder OS
                </div>
              </div>
            </Link>

            {/* Elevated Status Pill */}
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-[#1c1916] border border-[#2e2924] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#c8b99d] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN ROOT'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#736f68]">
              Platform Intelligence
            </div>
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    active
                      ? 'bg-[#26211b] text-[#f5f3ef] border border-[#3e352b] shadow-sm'
                      : 'text-[#a8a49c] hover:bg-[#1a1714] hover:text-[#f5f3ef]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-[#c8b99d]' : 'text-[#6e6b65] group-hover:text-[#a8a49c]'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#c8b99d]" />}
                </Link>
              );
            })}
          </div>

          {/* Secondary Operations */}
          <div className="px-3 py-3 border-t border-[#23201c] space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#736f68]">
              Operations &amp; Network
            </div>
            {secondaryNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? 'text-[#f5f3ef] font-medium bg-[#1e1a16]'
                      : 'text-[#858077] hover:text-[#f5f3ef]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-[#524e47]" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Session & Sign Out */}
        <div className="p-4 border-t border-[#23201c] bg-[#100f0d] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2a241e] border border-[#3d342a] flex items-center justify-center font-mono text-xs font-bold text-[#c8b99d]">
              {sessionUser?.name ? sessionUser.name.charAt(0) : 'D'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-medium text-[#f5f3ef] truncate">
                {sessionUser?.name || 'Deepam G Upadhyay'}
              </div>
              <div className="text-[10px] text-[#736f68] font-mono truncate">
                {sessionUser?.email || 'deepamupadhyay368@gmail.com'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/dashboard"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1714] hover:bg-[#23201c] border border-[#2e2924] text-[11px] text-[#a8a49c] hover:text-[#f5f3ef] transition-colors"
            >
              <span>Live App</span>
              <ArrowUpRight className="w-3 h-3 text-[#6e6b65]" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="px-2.5 py-1.5 rounded-lg bg-[#1a1714] hover:bg-red-950/30 hover:border-red-900/50 border border-[#2e2924] text-[11px] text-[#a8a49c] hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Secure Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop & Mobile Header Bar */}
        <header className="h-16 bg-[#141210]/95 backdrop-blur-md border-b border-[#23201c] px-6 flex items-center justify-between sticky top-0 z-30">
          <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#736f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (requests, customers, bookings, intent)..."
              className="w-full bg-[#1c1916] border border-[#2e2924] focus:border-[#9c8260] focus:ring-1 focus:ring-[#9c8260] rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f3ef] placeholder-[#736f68] transition-all outline-hidden"
            />
          </form>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1c1916] border border-[#2e2924] text-[11px] font-mono text-[#a8a49c]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SYSTEM · AHMEDABAD COHORT 1</span>
            </div>

            <Link
              href="/dashboard"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#1a1714] hover:bg-[#23201c] border border-[#2e2924] text-xs text-[#c8b99d] flex items-center gap-1.5 transition-colors"
            >
              <span>Customer View</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#9c8260]" />
            </Link>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

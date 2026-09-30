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
  KeyRound,
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
    { href: '/admin/account/security', label: 'Security & Password' },
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#1F2933] flex font-sans selection:bg-[#1F2933] selection:text-white">
      {/* Sleek Deep Slate Sidebar */}
      <aside className="w-64 border-r border-[#1F2933] bg-[#111820] text-white flex flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Top Brand Banner */}
          <div className="p-6 border-b border-[#1F2933]/60">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1F2933] border border-[#A7B0B8]/30 flex items-center justify-center font-serif text-white font-bold text-lg shadow-xs">
                P
              </div>
              <div>
                <div className="font-serif font-semibold tracking-wider text-base text-white">
                  PROVENTA
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#A7B0B8]">
                  Founder OS
                </div>
              </div>
            </Link>

            {/* Elevated Status Pill */}
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-[#1F2933] border border-[#303942] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#E5E9ED] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN ROOT'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
            </div>
          </div>

          {/* Primary Navigation */}
          <div className="px-3 py-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#A7B0B8]">
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
                      ? 'bg-[#1F2933] text-white border border-[#303942] shadow-xs'
                      : 'text-[#A7B0B8] hover:bg-[#1F2933]/50 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-white' : 'text-[#66717C] group-hover:text-white'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
          </div>

          {/* Secondary Operations */}
          <div className="px-3 py-3 border-t border-[#1F2933]/60 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#A7B0B8]">
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
                      ? 'text-white font-medium bg-[#1F2933]'
                      : 'text-[#A7B0B8] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-[#66717C]" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Session & Sign Out */}
        <div className="p-4 border-t border-[#1F2933]/60 bg-[#111820] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1F2933] border border-[#303942] flex items-center justify-center font-mono text-xs font-bold text-white">
              {sessionUser?.name ? sessionUser.name.charAt(0) : 'D'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-medium text-white truncate">
                {sessionUser?.name || 'Deepam G Upadhyay'}
              </div>
              <div className="text-[10px] text-[#A7B0B8] font-mono truncate">
                {sessionUser?.email || 'deepamupadhyay368@gmail.com'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/admin/account/security"
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1F2933] hover:bg-[#303942] border border-[#303942] text-[11px] text-[#E5E9ED] transition-colors"
              title="Change Password & Security"
            >
              <KeyRound className="w-3 h-3 text-[#A7B0B8]" />
              <span>Security</span>
            </Link>
            <Link
              href="/dashboard"
              target="_blank"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F2933] hover:bg-[#303942] border border-[#303942] text-[11px] text-[#A7B0B8] hover:text-white transition-colors"
              title="Open Live App"
            >
              <span>App</span>
              <ArrowUpRight className="w-3 h-3 text-[#A7B0B8]" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="px-2.5 py-1.5 rounded-lg bg-[#1F2933] hover:bg-red-950/40 hover:border-red-800 border border-[#303942] text-[11px] text-[#A7B0B8] hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
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
        <header className="h-16 bg-white border-b border-[#E1E5E8] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#66717C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (requests, customers, bookings, intent)..."
              className="w-full bg-[#F7F8FA] border border-[#E1E5E8] focus:border-[#1F2933] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#1F2933] placeholder-[#66717C] transition-all outline-hidden"
            />
          </form>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/admin/account/security"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F8FA] border border-[#E1E5E8] text-xs font-mono text-[#1F2933] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#1F2933]" />
              <span>Change Password</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] font-mono text-[#1F2933]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE SYSTEM</span>
            </div>

            <Link
              href="/dashboard"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#1F2933] hover:bg-[#111820] text-xs text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Customer View</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#A7B0B8]" />
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


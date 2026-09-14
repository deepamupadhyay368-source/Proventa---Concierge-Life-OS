'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Bot,
  ListTodo,
  CalendarCheck,
  CreditCard,
  HeartPulse,
  ShieldAlert,
  Sliders,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function AdminShell({
  children,
  sessionUser,
}: {
  children: React.ReactNode;
  sessionUser: any;
}) {
  const pathname = usePathname();

  // If on login page, render children without sidebar/chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const primaryNavItems = [
    { href: '/admin', label: 'Command Center', icon: LayoutDashboard, exact: true },
    { href: '/admin/clients', label: 'Client Vault', icon: Users },
    { href: '/admin/agents', label: 'AI Agent Fleet', icon: Bot },
    { href: '/admin/tasks', label: 'Autonomous Tasks', icon: ListTodo },
    { href: '/admin/bookings', label: 'Bookings Hub', icon: CalendarCheck },
    { href: '/admin/transactions', label: 'Transactions & GMV', icon: CreditCard },
    { href: '/admin/system', label: 'System Health', icon: HeartPulse },
    { href: '/admin/audit', label: 'Audit & Security', icon: ShieldAlert },
    { href: '/admin/settings', label: 'Platform Settings', icon: Sliders },
  ];

  const secondaryNavItems = [
    { href: '/admin/wave1', label: 'Wave 1 Waitlist' },
    { href: '/admin/providers', label: 'Partner Providers' },
    { href: '/concierge-ops/queue', label: 'Concierge Operator Desk' },
  ];

  const userRoles = (sessionUser?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

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
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-[#141210] border-b border-[#23201c] px-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-serif font-bold text-sm text-[#f5f3ef]">
            <span>PROVENTA</span>
            <span className="text-[10px] font-mono bg-[#26211b] text-[#c8b99d] px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/admin/clients" className="text-[#a8a49c] hover:text-white px-2 py-1">
              Clients
            </Link>
            <Link href="/admin/tasks" className="text-[#a8a49c] hover:text-white px-2 py-1">
              Tasks
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="text-[#a8a49c] p-1">
              <LogOut className="w-4 h-4" />
            </button>
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

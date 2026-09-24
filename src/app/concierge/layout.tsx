'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Inbox,
  LayoutDashboard,
  Users,
  UserCheck,
  Bell,
  Clock,
  ShieldAlert,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  Headphones,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';

export default function ConciergePortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState<{
    unassigned: number;
    escalated: number;
    myTasks: number;
    dueSoon: number;
  }>({ unassigned: 0, escalated: 0, myTasks: 0, dueSoon: 0 });

  const userRoles: string[] = currentUser?.roles || [];
  const primaryRole = userRoles[0] || 'CONCIERGE';
  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Operator';

  const isSeniorOrManager = userRoles.some((r: string) =>
    ['FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'CONCIERGE_MANAGER', 'SENIOR_CONCIERGE'].includes(r)
  );

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const s = await res.json();
          if (s?.user) setCurrentUser(s.user);
        }
      } catch (e) {}
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/concierge/tasks?filter=all');
        if (res.ok) {
          const data = await res.json();
          if (data.metrics) {
            setQueueMetrics({
              unassigned: data.metrics.unassigned || 0,
              escalated: data.metrics.escalated || 0,
              myTasks: data.metrics.myTasks || 0,
              dueSoon: data.metrics.slaUrgent || 0,
            });
          }
        }
      } catch (err) {
        // silent fail in nav
      }
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/concierge', icon: LayoutDashboard, exact: true },
    {
      name: 'Operations Queue',
      href: '/concierge/tasks',
      icon: Inbox,
      badge: queueMetrics.unassigned > 0 ? queueMetrics.unassigned : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      name: 'My Active Tasks',
      href: '/concierge/tasks?filter=my_tasks',
      icon: Headphones,
      badge: queueMetrics.myTasks > 0 ? queueMetrics.myTasks : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    { name: 'Private Clients', href: '/concierge/customers', icon: Users },
    ...(isSeniorOrManager
      ? [
          {
            name: 'Team & Reassignment',
            href: '/concierge/team',
            icon: UserCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/concierge" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold text-base shadow-lg shadow-amber-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wider text-sm text-neutral-100 group-hover:text-amber-300 transition-colors">
                  PROVENTA
                </span>
                <span className="text-[10px] uppercase tracking-widest font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Operations OS
                </span>
              </div>
            </div>
          </Link>

          {/* Shift status badge */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-950/60 border border-neutral-800 px-3 py-1 rounded-full text-xs text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-neutral-300">Live Shift (IST)</span>
            <span className="text-neutral-500 font-mono text-[11px]">• 09:00 - 21:00</span>
          </div>
        </div>

        {/* Right Header actions */}
        <div className="flex items-center gap-3">
          {queueMetrics.escalated > 0 && (
            <Link
              href="/concierge/tasks?filter=escalated"
              className="flex items-center gap-1.5 bg-rose-950/40 text-rose-300 border border-rose-800/50 px-2.5 py-1 rounded-md text-xs hover:bg-rose-900/60 transition-colors animate-pulse"
              title="Escalated Tasks Needing Attention"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-semibold">{queueMetrics.escalated} Escalated</span>
            </Link>
          )}

          {/* Customer / Admin Switcher for admins */}
          {userRoles.some((r: string) => ['SUPER_ADMIN', 'FOUNDER', 'ADMIN'].includes(r)) && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Center</span>
            </Link>
          )}

          <Link
            href="/dashboard"
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 px-2.5 py-1.5 rounded-md transition-colors"
            title="Preview Customer App"
          >
            <span>Customer View</span>
            <ExternalLink className="h-3 w-3 text-neutral-500" />
          </Link>

          {/* User badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <Link
              href="/concierge/profile"
              className="flex items-center gap-2.5 p-1 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-semibold text-amber-300">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-medium text-neutral-200 leading-tight">{displayName}</div>
                <div className="text-[10px] font-mono text-amber-400/80">{primaryRole.replace(/_/g, ' ')}</div>
              </div>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/sign-in' })}
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/80 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Shell: Sidebar + Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-800/70 p-4 space-y-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-3 pb-2">
              Human Workspace
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          item.badgeColor || 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Filters / Shortcuts */}
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-3 pb-2">
              Execution Shortcuts
            </div>
            <div className="space-y-1 text-xs">
              <Link
                href="/concierge/tasks?filter=ready_to_execute"
                className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 rounded-md transition-colors"
              >
                <span>Ready to Execute</span>
                <span className="text-[10px] font-mono text-emerald-400">Approved</span>
              </Link>
              <Link
                href="/concierge/tasks?filter=waiting_provider"
                className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 rounded-md transition-colors"
              >
                <span>Awaiting Provider</span>
                <span className="text-[10px] font-mono text-cyan-400">Pending</span>
              </Link>
              <Link
                href="/concierge/tasks?filter=waiting_customer"
                className="flex items-center justify-between px-3 py-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 rounded-md transition-colors"
              >
                <span>Needs Member Info</span>
                <span className="text-[10px] font-mono text-amber-400">Action</span>
              </Link>
            </div>
          </div>

          {/* Zero-Fabrication Directive Card */}
          <div className="mt-auto p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Zero-Fabrication Policy</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Every booking reference must be obtained directly from verified venue or service desks. Synthetic IDs are strictly prohibited.
            </p>
          </div>
        </aside>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-amber-500/10 text-amber-300 font-semibold' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Work Area */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}

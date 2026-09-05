'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Users, UserCheck, Store, Inbox, Calendar, Shield, Sliders, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/wave1', label: 'Wave 1 Waitlist', icon: Users },
    { href: '/admin/providers', label: 'Providers Network', icon: Store },
    { href: '/admin/requests', label: 'All Requests', icon: Inbox },
    { href: '/admin/audit', label: 'Audit & Security', icon: Shield },
    { href: '/admin/settings', label: 'System Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      <header className="bg-neutral-900 text-white px-6 h-14 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-white text-base">Proventa Admin</span>
            <span className="text-[10px] bg-red-900 text-red-200 border border-red-800 px-2 py-0.5 rounded font-mono">
              ROOT ACCESS
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                    active ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/concierge-ops/queue"
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
          >
            <span>Concierge Ops</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Customer App</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-neutral-400 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}

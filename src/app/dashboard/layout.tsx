'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building,
  Bookmark,
  FileText,
  Bell,
  CreditCard,
  User,
  Lock,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/property-vault', label: 'Property OS Vault', icon: ShieldCheck, badge: 'Vault' },
  { href: '/dashboard/properties', label: 'My Properties', icon: Building },
  { href: '/dashboard/watchlist', label: 'Saved Watchlists', icon: Bookmark },
  { href: '/dashboard/reports', label: 'My Reports', icon: FileText },
  { href: '/dashboard/alerts', label: 'Market Alerts', icon: Bell },
  { href: '/dashboard/membership', label: 'Membership & Billing', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile Settings', icon: User },
  { href: '/dashboard/security', label: 'Security & Access', icon: Lock },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = session?.user?.name || 'Member Account';
  const userEmail = session?.user?.email || '';
  const initials = userName
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#202B38] font-sans flex flex-col">
      {/* Top White Corporate Header */}
      <header className="bg-[#FFFFFF] border-b border-[#E8EBEF] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#202B38] hover:bg-[#F7F8FA] border border-[#E8EBEF]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-[0.18em] text-[#202B38]">
                PROVENTA
              </span>
              <span className="text-[9px] font-medium tracking-[0.16em] text-[#697586] uppercase mt-0.5">
                Real Estate Intelligence
              </span>
            </Link>

            <span className="hidden sm:inline-block text-[10px] font-semibold px-2.5 py-0.5 bg-[#F3F5F7] text-[#29465F] border border-[#E8EBEF] uppercase tracking-wider">
              Member Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/market-intelligence"
              className="hidden md:inline-flex items-center gap-1 text-xs text-[#697586] hover:text-[#202B38] font-medium transition-colors"
            >
              <span>Market Intelligence</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="h-4 w-px bg-[#E8EBEF] hidden md:block" />

            <Link
              href="/dashboard/alerts"
              className="p-2 text-[#697586] hover:text-[#202B38] relative hover:bg-[#F7F8FA] transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#697586] hover:text-[#202B38] hover:bg-[#F7F8FA] transition-colors border border-[#E8EBEF]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Left Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-5">
          <div className="bg-[#FFFFFF] border border-[#E8EBEF] p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#29465F] text-[#FFFFFF] flex items-center justify-center text-xs font-semibold">
                {initials || 'PR'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#202B38] truncate">{userName}</p>
                <p className="text-[11px] text-[#697586] truncate">{userEmail || 'Authenticated Member'}</p>
              </div>
            </div>
          </div>

          <nav className="bg-[#FFFFFF] border border-[#E8EBEF] p-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#29465F] text-[#FFFFFF]'
                      : 'text-[#697586] hover:text-[#202B38] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${active ? 'text-[#FFFFFF]' : 'text-[#29465F]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 uppercase font-semibold ${
                        active ? 'bg-white/20 text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#29465F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 bg-[#FFFFFF] border border-[#E8EBEF] space-y-2">
            <p className="text-xs font-semibold text-[#202B38]">Research Desk Support</p>
            <p className="text-[11px] text-[#697586] leading-relaxed">
              Questions about an Ahmedabad property valuation or Gujarat RERA record?
            </p>
            <a
              href="mailto:research@proventa.in"
              className="text-xs font-semibold text-[#29465F] hover:underline block pt-1"
            >
              Contact Analyst Desk &rarr;
            </a>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 lg:hidden flex">
            <div className="w-72 bg-[#FFFFFF] border-r border-[#E8EBEF] h-full p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                  <span className="font-semibold text-xs uppercase tracking-wider text-[#202B38]">
                    Member Menu
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold p-1 text-[#697586]"
                  >
                    ✕
                  </button>
                </div>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium ${
                          active ? 'bg-[#29465F] text-[#FFFFFF]' : 'text-[#697586] hover:text-[#202B38]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-2 bg-[#F7F8FA] text-[#202B38] text-xs font-semibold border border-[#E8EBEF]"
              >
                Sign Out
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

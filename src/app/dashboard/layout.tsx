'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/property-vault', label: 'Personal Property Vault', icon: ShieldCheck, badge: 'Vault' },
  { href: '/dashboard/properties', label: 'My Properties', icon: Building },
  { href: '/dashboard/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/dashboard/reports', label: 'Saved Reports', icon: FileText },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[#C8C4BA] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#202B3C] hover:bg-[#F5F3ED]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-[#202B3C]">
                PROVENTA
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#547568] uppercase font-semibold">
                Real Estate Intelligence
              </span>
            </Link>

            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 bg-[#547568]/10 text-[#547568] border border-[#547568]/20 font-bold uppercase">
              Member Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/property-intelligence"
              className="hidden md:inline-flex items-center gap-1 text-xs text-[#69717B] hover:text-[#202B3C] font-medium"
            >
              <span>Valuation Tool</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="h-4 w-px bg-[#C8C4BA] hidden md:block" />

            <Link
              href="/dashboard/alerts"
              className="p-2 text-[#69717B] hover:text-[#202B3C] relative hover:bg-[#F5F3ED]"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#547568] rounded-full" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#69717B] hover:text-[#202B3C] hover:bg-[#F5F3ED] transition-colors border border-transparent hover:border-[#C8C4BA]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Left Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          {/* User Account Card */}
          <div className="bg-white border border-[#C8C4BA] p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-[#202B3C] text-white flex items-center justify-center font-display font-bold text-sm">
                PR
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#202B3C] truncate">Member Portfolio</p>
                <p className="text-[11px] text-[#547568] font-mono">Personal Plan Active</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#C8C4BA]/40 flex justify-between text-[11px] text-[#69717B]">
              <span>Vault Limit</span>
              <span className="font-mono font-bold text-[#202B3C]">2 / 10 Units</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="bg-white border border-[#C8C4BA] p-2 space-y-1 shadow-2xs">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#202B3C] text-white shadow-xs'
                      : 'text-[#69717B] hover:text-[#202B3C] hover:bg-[#F5F3ED]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-[#547568]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 uppercase font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-[#547568]/10 text-[#547568]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Institutional Help Link */}
          <div className="p-4 bg-white border border-[#C8C4BA] space-y-2">
            <p className="text-xs font-bold text-[#202B3C]">Research Desk Support</p>
            <p className="text-[11px] text-[#69717B] leading-relaxed">
              Have questions about an Ahmedabad property valuation or RERA filing?
            </p>
            <a
              href="mailto:research@proventa.in"
              className="text-xs font-semibold text-[#547568] hover:underline block pt-1"
            >
              Contact Analyst Desk →
            </a>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex">
            <div className="w-72 bg-white h-full p-4 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-3">
                  <span className="font-display font-bold text-base text-[#202B3C]">Dashboard Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold p-1">
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
                          active ? 'bg-[#202B3C] text-white' : 'text-[#69717B] hover:text-[#202B3C]'
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
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-2 bg-[#F5F3ED] text-[#202B3C] text-xs font-semibold border border-[#C8C4BA]"
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

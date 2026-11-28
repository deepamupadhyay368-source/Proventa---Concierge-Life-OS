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
    <div className="min-h-screen bg-[#080E18] text-[#F5F7FA] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-[#101A29] border-b border-[#29384B] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#F5F7FA] hover:bg-[#152235] border border-[#29384B]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex flex-col">
              <span className="text-base font-bold tracking-[0.18em] text-[#F5F7FA]">
                PROVENTA
              </span>
              <span className="text-[9px] font-mono tracking-[0.16em] text-[#4D9FFF] uppercase font-bold">
                Real Estate Intelligence
              </span>
            </Link>

            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 bg-[#152235] text-[#D7AD69] border border-[#29384B] font-bold uppercase tracking-wider">
              Intelligence Terminal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/market-intelligence"
              className="hidden md:inline-flex items-center gap-1 text-xs text-[#AAB6C5] hover:text-[#4D9FFF] font-medium transition-colors"
            >
              <span>Market Intelligence</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <div className="h-4 w-px bg-[#29384B] hidden md:block" />

            <Link
              href="/dashboard/alerts"
              className="p-2 text-[#AAB6C5] hover:text-[#F5F7FA] relative hover:bg-[#152235] transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#4D9FFF] rounded-full" />
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#AAB6C5] hover:text-[#F5F7FA] hover:bg-[#152235] transition-colors border border-transparent hover:border-[#29384B]"
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
        <aside className="w-64 shrink-0 hidden lg:block space-y-5">
          {/* Account Workspace Card */}
          <div className="bg-[#152235] border border-[#29384B] p-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-[#080E18] border border-[#29384B] text-[#D7AD69] flex items-center justify-center font-mono text-xs font-bold">
                PR
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#F5F7FA] truncate">Member Terminal</p>
                <p className="text-[11px] text-[#4D9FFF] font-mono">Authenticated Session</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#29384B] flex justify-between text-[11px] text-[#748398]">
              <span>Workspace</span>
              <span className="font-mono font-semibold text-[#AAB6C5]">Property OS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="bg-[#101A29] border border-[#29384B] p-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#1B2A3D] text-[#F5F7FA] border-l-2 border-[#4D9FFF]'
                      : 'text-[#AAB6C5] hover:text-[#F5F7FA] hover:bg-[#152235]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${active ? 'text-[#4D9FFF]' : 'text-[#748398]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 uppercase font-bold ${
                        active
                          ? 'bg-[#080E18] text-[#D7AD69] border border-[#29384B]'
                          : 'bg-[#152235] text-[#D7AD69]'
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
          <div className="p-4 bg-[#101A29] border border-[#29384B] space-y-2">
            <p className="text-xs font-bold text-[#F5F7FA]">Research Desk Support</p>
            <p className="text-[11px] text-[#AAB6C5] leading-relaxed">
              Questions about an Ahmedabad property valuation, Gujarat RERA filing, or satellite corridor record?
            </p>
            <a
              href="mailto:research@proventa.in"
              className="text-xs font-mono text-[#4D9FFF] hover:underline block pt-1"
            >
              Contact Analyst Desk &rarr;
            </a>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 lg:hidden flex">
            <div className="w-72 bg-[#101A29] border-r border-[#29384B] h-full p-4 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#29384B] pb-3">
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#F5F7FA]">
                    Terminal Menu
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold p-1 text-[#AAB6C5]"
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
                          active
                            ? 'bg-[#1B2A3D] text-[#F5F7FA] border-l-2 border-[#4D9FFF]'
                            : 'text-[#AAB6C5] hover:text-[#F5F7FA]'
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
                className="w-full py-2 bg-[#152235] text-[#F5F7FA] text-xs font-semibold border border-[#29384B]"
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

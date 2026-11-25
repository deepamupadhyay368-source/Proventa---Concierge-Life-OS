'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Users, FileBarChart, TrendingUp, ArrowLeft, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const PROF_NAV = [
  { href: '/professional', label: 'Advisory Overview', icon: Briefcase },
  { href: '/professional/clients', label: 'Client Portfolios', icon: Users },
  { href: '/professional/reports', label: 'Institutional Reports', icon: FileBarChart },
  { href: '/professional/market', label: 'Market Analytics', icon: TrendingUp },
];

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[#C8C4BA] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col">
              <span className="font-editorial text-xl font-normal tracking-tight text-[#202B3C]">
                PROVENTA
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#547568] uppercase font-bold">
                Professional Suite
              </span>
            </Link>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#202B3C] text-white font-bold uppercase">
              Advisory Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#69717B] hover:text-[#202B3C] flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Personal Dashboard</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-1.5 text-xs font-semibold text-[#69717B] hover:text-[#202B3C] border border-[#C8C4BA] hover:bg-[#F5F3ED]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white border border-[#C8C4BA] p-4 space-y-2">
            <p className="text-xs font-bold text-[#202B3C]">Advisory Firm Profile</p>
            <p className="text-xs text-[#69717B] font-mono">Mehta & Partners Wealth Desk</p>
            <div className="pt-2 border-t border-[#C8C4BA]/40 text-[11px] text-[#547568] font-mono">
              Professional Plan • 150 Asset Limit
            </div>
          </div>

          <nav className="bg-white border border-[#C8C4BA] p-2 space-y-1">
            {PROF_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    active ? 'bg-[#202B3C] text-white' : 'text-[#69717B] hover:text-[#202B3C] hover:bg-[#F5F3ED]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

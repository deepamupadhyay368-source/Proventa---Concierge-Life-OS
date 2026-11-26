'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShieldCheck, Database, Building, FileText, Users, CreditCard, Activity, ArrowLeft } from 'lucide-react';

const ADMIN_REAL_ESTATE_LINKS = [
  { code: '01', label: 'Intelligence Overview', href: '/admin' },
  { code: '02', label: 'Data Coverage & Eligibility', href: '/admin/coverage' },
  { code: '03', label: 'Transaction Evidence', href: '/admin/transactions' },
  { code: '04', label: 'RERA Projects & Devs', href: '/admin/projects' },
  { code: '05', label: 'Discovery Candidates', href: '/admin/research/candidates' },
  { code: '06', label: 'Data Sources & Feeds', href: '/admin/data-sources' },
  { code: '07', label: 'Hedonic Valuations', href: '/admin/valuations' },
  { code: '08', label: 'Property Records', href: '/admin/properties' },
  { code: '09', label: 'User Directory', href: '/admin/users' },
  { code: '10', label: 'Evidence Audit Logs', href: '/admin/audit' },
];

export function AdminShell({
  children,
  sessionUser,
}: {
  children: React.ReactNode;
  sessionUser?: unknown;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F3ED] text-[#202B3C]">
      {/* Left Operations Rail */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#202B3C] text-[#F5F3ED] border-b lg:border-b-0 lg:border-r border-[#323E51] flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-[#323E51] flex items-center justify-between">
            <Link href="/" className="block">
              <span className="font-editorial text-lg font-normal tracking-wider text-white block">
                PROVENTA
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#547568] block mt-0.5 font-bold">
                Real Estate Administration
              </span>
            </Link>
          </div>

          <nav className="divide-y divide-[#323E51]/60">
            {ADMIN_REAL_ESTATE_LINKS.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                    active
                      ? 'bg-[#547568] text-white font-bold'
                      : 'text-[#C8C4BA] hover:bg-[#2A384D] hover:text-white',
                  )}
                >
                  <span>
                    {item.code} — {item.label}
                  </span>
                  <span>→</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#323E51] space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-[#C8C4BA] hover:text-white font-mono"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Customer Dashboard</span>
          </Link>
          <div className="text-[10px] text-[#69717B] font-mono">
            Environment: Production Verified
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 min-w-0 max-w-7xl">{children}</main>
    </div>
  );
}

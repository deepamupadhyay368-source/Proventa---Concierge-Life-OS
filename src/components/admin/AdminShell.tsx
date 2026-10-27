'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const ADMIN_INDEX_LINKS = [
  { code: '01', label: 'MARKETPLACE GOVERNANCE', href: '/admin/marketplace' },
  { code: '02', label: 'CONSOLE OVERVIEW', href: '/admin' },
  { code: '03', label: 'REGISTRATIONS', href: '/admin/registrations' },
  { code: '04', label: 'PROVIDERS', href: '/admin/providers' },
  { code: '05', label: 'REQUESTS', href: '/admin/requests' },
  { code: '06', label: 'ANALYTICS', href: '/admin/analytics' },
  { code: '07', label: 'AUDIT LOGS', href: '/admin/audit-logs' },
  { code: '08', label: 'SETTINGS', href: '/admin/settings' },
];

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
  sessionUser?: unknown;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F1EA] text-[#0D0E11]">
      {/* Left Ink-Black Governance Rail */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0D0E11] text-[#F4F1EA] border-b-2 lg:border-b-0 lg:border-r-2 border-[#0D0E11] flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-[#26282E] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center bg-[#C8F904] text-[#0D0E11] font-mono text-xs font-bold">
                PV/I
              </span>
              <div>
                <span className="font-display text-sm font-bold tracking-tight text-[#F4F1EA] block leading-none">
                  {BRAND_CONFIG.name}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C8F904]">
                  ADMIN GOVERNANCE
                </span>
              </div>
            </Link>
          </div>

          <nav className="divide-y divide-[#26282E]">
            {ADMIN_INDEX_LINKS.map((item) => {
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
                      ? 'bg-[#C8F904] text-[#0D0E11] font-bold'
                      : 'text-[#CFCAC0] hover:bg-[#1B1D24] hover:text-[#F4F1EA]',
                  )}
                >
                  <span>
                    /{item.code} {item.label}
                  </span>
                  <span>→</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-[#26282E] font-mono text-[10px] space-y-2">
          <Link
            href="/businesses"
            className="flex items-center justify-between text-[#C8F904] hover:underline"
          >
            <span>PUBLIC DIRECTORY</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="text-[#78756F]">INDEX GOVERNANCE v2.4</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-[#0D0E11] bg-[#FAF8F3] px-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
          <span>REGISTRY CONTROL // ADMINISTRATIVE LEDGER</span>
          <Link href="/" className="font-bold text-[#0D0E11] hover:underline">
            EXIT TO PUBLIC INDEX →
          </Link>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

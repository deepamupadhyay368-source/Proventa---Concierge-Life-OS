'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/lib/brand';
import { cn } from '@/lib/utils';

const ADMIN_INDEX_LINKS = [
  { code: '01', label: 'Marketplace Moderation', href: '/admin/marketplace' },
  { code: '02', label: 'Console Overview', href: '/admin' },
  { code: '03', label: 'Registrations', href: '/admin/registrations' },
  { code: '04', label: 'Providers', href: '/admin/providers' },
  { code: '05', label: 'Requests', href: '/admin/requests' },
  { code: '06', label: 'Analytics', href: '/admin/analytics' },
  { code: '07', label: 'Audit Logs', href: '/admin/audit-logs' },
  { code: '08', label: 'Settings', href: '/admin/settings' },
];

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
  sessionUser?: unknown;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F0E5] text-[#181914]">
      {/* Left Architectural Charcoal Governance Rail */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#171A14] text-[#F6F0E4] border-b lg:border-b-0 lg:border-r border-[#4C4A40]/70 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-[#4C4A40]/70 flex items-center justify-between">
            <Link href="/" className="block">
              <span className="font-sans text-base font-semibold uppercase tracking-[0.26em] text-[#F6F0E4] block">
                {BRAND_CONFIG.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#B94E2D] block mt-0.5">
                Admin Governance
              </span>
            </Link>
          </div>

          <nav className="divide-y divide-[#4C4A40]/40">
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
                    'flex items-center justify-between px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                    active
                      ? 'bg-[#B94E2D] text-[#F6F0E4] font-semibold'
                      : 'text-[#A7A194] hover:bg-[#20211C] hover:text-[#F6F0E4]',
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

        <div className="p-5 border-t border-[#4C4A40]/70 font-mono text-[10px] space-y-2">
          <Link
            href="/businesses"
            className="flex items-center justify-between text-[#A98253] hover:text-[#F6F0E4]"
          >
            <span>PUBLIC DIRECTORY</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="text-[#6B675E]">PROVENTA GOVERNANCE CONSOLE</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-[#D5CBB8] bg-[#FAF6EC] px-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[#6B675E]">
          <span>Marketplace Trust &amp; Moderation</span>
          <Link
            href="/"
            className="font-semibold text-[#181914] hover:text-[#B94E2D]"
          >
            Return to Public Website →
          </Link>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

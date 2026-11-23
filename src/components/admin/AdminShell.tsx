'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_INDEX_LINKS = [
  { code: '01', label: 'Operations Overview', href: '/admin' },
  { code: '02', label: 'Dispatch Engine', href: '/admin/dispatch' },
  { code: '03', label: 'Customers & Members', href: '/admin/customers' },
  { code: '04', label: 'Technician Partners', href: '/admin/partners' },
  { code: '05', label: 'Service Requests', href: '/admin/requests' },
  { code: '06', label: 'Subscriptions', href: '/admin/subscriptions' },
  { code: '07', label: 'Finance & Payouts', href: '/admin/finance' },
  { code: '08', label: 'Service Areas', href: '/admin/service-areas' },
  { code: '09', label: 'Society Accounts', href: '/admin/societies' },
  { code: '10', label: 'Settings', href: '/admin/settings' },
  { code: '11', label: 'Industrial Procurement (Archive)', href: '/admin/procurement' },
];

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
  sessionUser?: unknown;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F2F0E9] text-[#171A17]">
      {/* Left Charcoal Operations Rail */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#171A17] text-[#F2F0E9] border-b lg:border-b-0 lg:border-r border-[#323631] flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-[#323631] flex items-center justify-between">
            <Link href="/" className="block">
              <span className="font-sans text-base font-bold uppercase tracking-[0.2em] text-[#F2F0E9] block">
                PROVENTA HOME
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#89947F] block mt-0.5">
                Operations Control Centre
              </span>
            </Link>
          </div>

          <nav className="divide-y divide-[#323631]/60">
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
                      ? 'bg-[#53634A] text-white font-bold'
                      : 'text-[#89947F] hover:bg-[#20241F] hover:text-[#F2F0E9]',
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

        <div className="p-5 border-t border-[#323631] font-mono text-[10px] space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between text-[#89947F] hover:text-white"
          >
            <span>PUBLIC PLATFORM</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="text-stone-500">PROVENTA AHMEDABAD DISPATCH ENGINE</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[#E3DFD5] bg-white px-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-[#171A17]">Ahmedabad Operations Live</span>
            <span className="text-stone-400">• Bopal / Satellite / Prahlad Nagar</span>
          </div>
          <Link
            href="/"
            className="font-semibold text-[#53634A] hover:text-[#171A17] flex items-center gap-1"
          >
            Return to Public Website →
          </Link>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

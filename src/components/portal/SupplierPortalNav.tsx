'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  Store,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUPPLIER_PORTAL_LINKS = [
  { label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
  { label: 'RFQ Invitations', href: '/supplier/rfqs', icon: FileSpreadsheet },
  { label: 'Submitted Quotations', href: '/supplier/rfqs?tab=submitted', icon: Layers },
  { label: 'Product Catalogue', href: '/supplier/catalogue', icon: Store },
  { label: 'Performance', href: '/supplier/performance', icon: TrendingUp },
  { label: 'Invoices & Payments', href: '/supplier/payments', icon: CreditCard },
  { label: 'Verification', href: '/settings/business-profile?tab=tax', icon: ShieldCheck },
  { label: 'Settings', href: '/settings/business-profile', icon: Settings },
];

export function SupplierPortalNav() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-[#191B20] border-b border-[#414957] overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-1 py-1">
          <div className="hidden md:flex items-center gap-1.5 pr-4 border-r border-[#414957] font-mono text-[10px] uppercase tracking-wider text-[#536B88] font-bold shrink-0">
            <span className="w-1.5 h-1.5 bg-[#536B88]" />
            <span>Supplier Portal</span>
          </div>

          <nav className="flex items-center gap-1 flex-nowrap shrink-0">
            {SUPPLIER_PORTAL_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/supplier/dashboard'
                  ? pathname === '/supplier/dashboard'
                  : pathname.startsWith(item.href.split('?')[0]);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded-sm shrink-0',
                    isActive
                      ? 'bg-[#303746] text-[#FFFFFF] font-bold border-b-2 border-[#536B88]'
                      : 'text-[#A8ADB7] hover:text-[#FFFFFF] hover:bg-[#252B38]'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#C66A42]' : 'text-[#536B88]')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

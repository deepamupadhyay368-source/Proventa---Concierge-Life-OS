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
  { label: 'Overview', href: '/supplier/dashboard', icon: LayoutDashboard },
  { label: 'Incoming RFQs', href: '/supplier/rfqs', icon: FileSpreadsheet },
  { label: 'Submitted Quotes', href: '/supplier/rfqs?tab=submitted', icon: Layers },
  { label: 'Product Catalogue', href: '/supplier/catalogue', icon: Store },
  { label: 'Business Performance', href: '/supplier/performance', icon: TrendingUp },
  { label: 'Payment Tracking', href: '/supplier/payments', icon: CreditCard },
  { label: 'Verification', href: '/settings/business-profile?tab=tax', icon: ShieldCheck },
  { label: 'Business Profile', href: '/settings/business-profile', icon: Settings },
];

export function SupplierPortalNav() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E2E8EF] overflow-x-auto scrollbar-none shadow-2xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-1 py-1.5">
          <div className="hidden md:flex items-center gap-2 pr-4 border-r border-[#E2E8EF] font-mono text-[10px] uppercase tracking-wider text-[#315F91] font-bold shrink-0">
            <span className="w-1.5 h-1.5 bg-[#315F91] rounded-xs" />
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
                    'flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded-xs shrink-0',
                    isActive
                      ? 'bg-[#F4F7FA] text-[#315F91] font-bold border-b-2 border-[#315F91]'
                      : 'text-[#6B7785] hover:text-[#243447] hover:bg-[#F4F7FA]'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#315F91]' : 'text-[#AEBBC6]')} />
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Users,
  Scale,
  CheckSquare,
  Package,
  Truck,
  Receipt,
  CreditCard,
  BarChart3,
  AlertTriangle,
  Layers,
  Settings,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  CalendarClock,
  Award,
  Network,
  Workflow,
} from 'lucide-react';

const CORE_NAV_ITEMS = [
  { href: '/buyer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/buyer/projects', label: 'Projects', icon: Building2 },
  { href: '/buyer/requirements', label: 'Requirements & BOQ', icon: ClipboardList },
  { href: '/buyer/catalogue', label: 'Material Catalogue', icon: Layers },
  { href: '/buyer/rfqs', label: 'RFQs', icon: FileSpreadsheet },
  { href: '/buyer/discovery', label: 'Suppliers', icon: Users },
  { href: '/buyer/comparison', label: 'Compare & Landed Cost', icon: Scale },
];

const INTELLIGENCE_NAV_ITEMS = [
  { href: '/buyer/intelligence/leakage', label: 'Leakage Detector', icon: ShieldAlert },
  { href: '/buyer/intelligence/prices', label: 'Material Price Intelligence', icon: TrendingUp },
  { href: '/buyer/intelligence/timing', label: 'Procurement Timing', icon: CalendarClock },
  { href: '/buyer/intelligence/suppliers', label: 'Supplier Reliability', icon: Award },
  { href: '/buyer/intelligence/multi-project', label: 'Multi-Project Intelligence', icon: Network },
  { href: '/buyer/autopilot', label: 'Procurement Autopilot', icon: Workflow },
];

const EXECUTION_NAV_ITEMS = [
  { href: '/buyer/approvals', label: 'Team & Approvals', icon: CheckSquare },
  { href: '/buyer/orders', label: 'Purchase Orders', icon: Package },
  { href: '/buyer/deliveries', label: 'Deliveries & GRN', icon: Truck },
  { href: '/buyer/invoices', label: 'Invoices & 3-Way Match', icon: Receipt },
  { href: '/buyer/payments', label: 'Payments & Ledger', icon: CreditCard },
  { href: '/buyer/analytics', label: 'Reports & Savings', icon: BarChart3 },
  { href: '/buyer/disputes', label: 'Disputes & Quality', icon: AlertTriangle },
  { href: '/settings/business-profile', label: 'Settings', icon: Settings },
];

export function BuyerWorkspaceShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const renderLink = (item: { href: string; label: string; icon: any }) => {
    const Icon = item.icon;
    const active = pathname === item.href || pathname?.startsWith(item.href + '/');
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xs transition-colors ${
          active
            ? 'bg-[#0F6B50] text-white font-semibold'
            : 'text-[#C5CFD8] hover:bg-[#292F3D] hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-[#172B3A] font-sans flex">
      {/* Left Industrial Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#172B3A] text-[#E9ECEF] shrink-0 border-r border-[#292F3D]">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#292F3D]">
          <div className="w-7 h-7 bg-[#292F3D] border border-[#C9A45B]/50 flex items-center justify-center rounded-xs">
            <Building2 className="w-4 h-4 text-[#C9A45B]" />
          </div>
          <Link href="/" className="leading-none">
            <span className="block text-sm font-bold tracking-[0.14em] text-white">PROVENTA</span>
            <span className="block text-[9px] font-mono uppercase tracking-[0.16em] text-[#C9A45B] mt-0.5">
              Procurement Intelligence
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto" aria-label="Buyer Workspace">
          <div className="space-y-0.5">{CORE_NAV_ITEMS.map(renderLink)}</div>

          <div className="space-y-1 pt-2 border-t border-[#292F3D]">
            <div className="px-3 text-[10px] font-mono uppercase tracking-[0.16em] text-[#C9A45B] font-semibold">
              Procurement Intelligence
            </div>
            <div className="space-y-0.5">{INTELLIGENCE_NAV_ITEMS.map(renderLink)}</div>
          </div>

          <div className="space-y-1 pt-2 border-t border-[#292F3D]">
            <div className="px-3 text-[10px] font-mono uppercase tracking-[0.16em] text-[#9AA7B4] font-semibold">
              Execution &amp; Control
            </div>
            <div className="space-y-0.5">{EXECUTION_NAV_ITEMS.map(renderLink)}</div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#292F3D] space-y-2">
          <Link
            href="/pilot/pacifica"
            className="flex items-center gap-2 px-3 py-2 bg-[#292F3D] hover:bg-[#343C4E] border border-[#C9A45B]/40 text-[11px] font-mono text-[#C9A45B] rounded-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Pacifica Pilot Mode</span>
          </Link>
          <Link
            href="/supplier/dashboard"
            className="block text-center text-[11px] text-[#9AA7B4] hover:text-white py-1"
          >
            Switch to Supplier Workspace &rarr;
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-[#D5DCE2] px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#172B3A] tracking-tight">{title}</h1>
              <p className="text-xs text-[#4A5568] mt-1">{subtitle}</p>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
}

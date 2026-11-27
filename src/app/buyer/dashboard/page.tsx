'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BuyerWorkspaceShell } from '@/components/procurement/BuyerWorkspaceShell';
import {
  PlusCircle,
  ArrowRight,
  FileSpreadsheet,
  Package,
  Scale,
  CheckSquare,
  Truck,
  Receipt,
  BarChart3,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function BuyerDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [businessName, setBusinessName] = useState('Buyer Procurement Command Desk');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [resAnalytics, resRfqs, resOrders, resProfile] = await Promise.all([
          fetch('/api/procurement/analytics').catch(() => null),
          fetch('/api/procurement/rfqs?buyerId=all').catch(() => null),
          fetch('/api/procurement/orders?buyerId=all').catch(() => null),
          fetch('/api/business/profile').catch(() => null),
        ]);

        if (resAnalytics?.ok) {
          const json = await resAnalytics.json();
          if (json.success) setAnalytics(json.data);
        }
        if (resRfqs?.ok) {
          const json = await resRfqs.json();
          if (json.success) setRfqs(json.data || []);
        }
        if (resOrders?.ok) {
          const json = await resOrders.json();
          if (json.success) setOrders(json.data || []);
        }
        if (resProfile?.ok) {
          const json = await resProfile.json();
          if (json.success && json.data?.business?.name) {
            setBusinessName(json.data.business.name);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BuyerWorkspaceShell
      title={businessName}
      subtitle="Live construction procurement command desk across projects, RFQs, quotations, approvals, purchase orders, deliveries, and savings reconciliation."
      actions={
        <>
          <Link
            href="/buyer/projects"
            className="px-3.5 py-2 bg-[#E9ECEF] hover:bg-[#DCE2E8] text-[#172B3A] text-xs font-semibold rounded-xs"
          >
            Manage Projects
          </Link>
          <Link
            href="/rfq/new"
            className="px-4 py-2 bg-[#0F6B50] hover:bg-[#0C5842] text-white text-xs font-semibold rounded-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create RFQ</span>
          </Link>
        </>
      }
    >
      {/* Live DB-Computed KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Active RFQs</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {loading ? '—' : analytics?.activeRfqsCount ?? rfqs.length}
          </div>
          <Link href="/buyer/rfqs" className="text-[11px] text-[#0F6B50] font-semibold mt-1 inline-block">
            View RFQs &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Pending Approvals</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {loading ? '—' : analytics?.pendingApprovalsCount ?? 0}
          </div>
          <Link href="/buyer/approvals" className="text-[11px] text-[#0F6B50] font-semibold mt-1 inline-block">
            Review Queue &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Purchase Orders</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {loading ? '—' : analytics?.activePurchaseOrdersCount ?? orders.length}
          </div>
          <Link href="/buyer/orders" className="text-[11px] text-[#0F6B50] font-semibold mt-1 inline-block">
            Track Orders &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#4A5568]">Pending / Delayed Deliveries</div>
          <div className="text-2xl font-bold font-mono text-[#172B3A] mt-1 tabular-nums">
            {loading ? '—' : `${analytics?.pendingDeliveriesCount ?? 0} / ${analytics?.delayedDeliveriesCount ?? 0}`}
          </div>
          <Link href="/buyer/deliveries" className="text-[11px] text-[#0F6B50] font-semibold mt-1 inline-block">
            Deliveries &amp; GRN &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[#D5DCE2] p-4 rounded-xs">
          <div className="text-[10px] font-mono uppercase text-[#0F6B50]">Verified Realised Savings</div>
          <div className="text-xl font-bold font-mono text-[#0F6B50] mt-1 tabular-nums">
            {loading ? '—' : analytics?.realisedSavingsFormatted ?? '₹0.00'}
          </div>
          <Link href="/buyer/analytics" className="text-[11px] text-[#172B3A] font-semibold mt-1 inline-block">
            Savings Intelligence &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Operational Launchpads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/buyer/comparison" className="bg-white border border-[#D5DCE2] hover:border-[#0F6B50] p-5 rounded-xs space-y-2 transition-colors">
          <Scale className="w-5 h-5 text-[#0F6B50]" />
          <div className="text-sm font-bold text-[#172B3A]">Intelligent Comparison Centre</div>
          <p className="text-xs text-[#4A5568]">
            Compare quotations like-for-like across landed cost, GST, freight, delivery lead time, and BIS specification compliance.
          </p>
        </Link>

        <Link href="/buyer/invoices" className="bg-white border border-[#D5DCE2] hover:border-[#0F6B50] p-5 rounded-xs space-y-2 transition-colors">
          <Receipt className="w-5 h-5 text-[#0F6B50]" />
          <div className="text-sm font-bold text-[#172B3A]">Invoices &amp; 3-Way Matching</div>
          <p className="text-xs text-[#4A5568]">
            Reconcile PO + Goods Receipt Note + Supplier Invoice in integer paise with automatic discrepancy holds.
          </p>
        </Link>

        <Link href="/buyer/requirements" className="bg-white border border-[#D5DCE2] hover:border-[#0F6B50] p-5 rounded-xs space-y-2 transition-colors">
          <FileSpreadsheet className="w-5 h-5 text-[#0F6B50]" />
          <div className="text-sm font-bold text-[#172B3A]">Procurement Requirements</div>
          <p className="text-xs text-[#4A5568]">
            Log site material requirements against project budgets and convert approved items into multi-supplier RFQs.
          </p>
        </Link>
      </div>

      {/* Recent RFQs & Orders Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D5DCE2] rounded-xs">
          <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172B3A] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0F6B50]" />
              <span>Recent RFQs</span>
            </h2>
            <Link href="/buyer/rfqs" className="text-xs font-semibold text-[#0F6B50] inline-flex items-center gap-1">
              <span>All RFQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E9ECEF]">
            {rfqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5568]">
                No RFQs found for your organisation yet. Click <strong>Create RFQ</strong> to launch one.
              </div>
            ) : (
              rfqs.slice(0, 5).map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#172B3A]">{r.title}</div>
                    <div className="text-[11px] font-mono text-[#4A5568] mt-0.5">
                      {r.id} &bull; {r.items?.length || 0} line items
                    </div>
                  </div>
                  <Link
                    href={`/buyer/rfqs/${r.id}/compare`}
                    className="px-2.5 py-1 bg-[#E9ECEF] hover:bg-[#172B3A] hover:text-white text-[#172B3A] font-semibold rounded-xs transition-colors"
                  >
                    Compare
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#D5DCE2] rounded-xs">
          <div className="p-4 border-b border-[#E9ECEF] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172B3A] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0F6B50]" />
              <span>Recent Purchase Orders</span>
            </h2>
            <Link href="/buyer/orders" className="text-xs font-semibold text-[#0F6B50] inline-flex items-center gap-1">
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E9ECEF]">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#4A5568]">
                No Purchase Orders issued yet. Awards automatically generate auditable POs here.
              </div>
            ) : (
              orders.slice(0, 5).map((o) => (
                <div key={o.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold font-mono text-[#172B3A]">{o.id}</div>
                    <div className="text-[11px] text-[#4A5568] mt-0.5">{o.supplierName}</div>
                  </div>
                  <Link
                    href={`/buyer/orders/${o.id}`}
                    className="px-2.5 py-1 bg-[#E9ECEF] hover:bg-[#172B3A] hover:text-white text-[#172B3A] font-semibold rounded-xs transition-colors"
                  >
                    Track PO
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </BuyerWorkspaceShell>
  );
}

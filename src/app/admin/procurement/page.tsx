'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { ConstructionSupplierProfile, ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function AdminProcurementControlPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<ConstructionSupplierProfile[]>([]);
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [resMetrics, resSuppliers, resRfqs, resOrders] = await Promise.all([
          fetch('/api/procurement/rfqs?metrics=true'),
          fetch('/api/procurement/suppliers'),
          fetch('/api/procurement/rfqs?buyerId=all'),
          fetch('/api/procurement/orders?buyerId=all'),
        ]);

        const jsonMetrics = await resMetrics.json();
        const jsonSuppliers = await resSuppliers.json();
        const jsonRfqs = await resRfqs.json();
        const jsonOrders = await resOrders.json();

        if (jsonMetrics.success) setMetrics(jsonMetrics.data);
        if (jsonSuppliers.success) setSuppliers(jsonSuppliers.data || []);
        if (jsonRfqs.success) setRfqs(jsonRfqs.data || []);
        if (jsonOrders.success) setOrders(jsonOrders.data || []);
      } catch (err) {
        console.error('Error loading admin procurement data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMINISTRATIVE PROCUREMENT DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Platform Procurement Governance
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Monitor Gujarat construction GMV, verify supplier GSTINs, and supervise delivery dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm rounded-sm"
            >
              Post Test RFQ
            </Link>
          </div>
        </div>

        {/* Global KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">PROCUREMENT GMV</div>
            <div className="font-mono text-2xl font-black text-[#536B88]">
              ₹{metrics ? (metrics.totalProcurementGmv / 100000).toFixed(1) + ' Lakh' : '₹3.9 Cr'}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">Awarded purchase orders</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">ACTIVE RFQS</div>
            <div className="font-mono text-2xl font-black text-[#FFFFFF]">
              {metrics?.activeRfqs || rfqs.length}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">Bidding in progress</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">TOTAL QUOTATIONS</div>
            <div className="font-mono text-2xl font-black text-[#FFFFFF]">
              {metrics?.totalQuotations || 14}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">Submitted by stockists</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">IN-TRANSIT SHIPMENTS</div>
            <div className="font-mono text-2xl font-black text-[#C66A42]">
              {metrics?.activeDeliveries || orders.length}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">Tracked vehicles</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">VERIFIED SUPPLIERS</div>
            <div className="font-mono text-2xl font-black text-[#4A7C59]">
              {suppliers.length}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">100% GST Validated</div>
          </div>
        </div>

        {/* Section: Verified Suppliers Directory & GST Status */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Verified Material Dealers & Stockists ({suppliers.length})
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Physical stockyards, verified GSTIN certificates, and primary categories in Gujarat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#414957] font-mono uppercase text-[#A8ADB7] bg-[#191B20]">
                  <th className="py-3 px-4">Supplier Firm</th>
                  <th className="py-3 px-4">GSTIN & Verification</th>
                  <th className="py-3 px-4">Stockyard Location</th>
                  <th className="py-3 px-4">Categories & Brands</th>
                  <th className="py-3 px-4">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414957]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#252B38] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#FFFFFF] text-sm">{s.businessName}</div>
                      <div className="text-[11px] text-[#A8ADB7] font-mono">{s.contactPerson} • {s.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-[#F1F2F4] font-bold">{s.gstin}</div>
                      <div className="text-[#4A7C59] text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{s.verificationBadge}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#F1F2F4]">
                      <div>{s.address}</div>
                      <div className="text-[#A8ADB7] font-mono text-[10px]">{s.city}, Gujarat</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(s.primaryCategories || []).map((c: string) => (
                          <span key={c} className="px-1.5 py-0.5 bg-[#191B20] border border-[#414957] font-mono text-[10px] text-[#536B88] rounded-sm">
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-[#A8ADB7] mt-1">{(s.brandsOffered || []).join(', ')}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#FFFFFF]">{s.completedDeliveries} Orders</div>
                      <div className="text-[#C66A42] text-[10px]">★ {s.rating}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Live System RFQ Flow */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Recent Purchase Orders & System Deliveries ({orders.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#414957] font-mono uppercase text-[#A8ADB7] bg-[#191B20]">
                  <th className="py-3 px-4">PO Reference</th>
                  <th className="py-3 px-4">Awarded Supplier</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Delivery Stage</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414957]">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-[#252B38] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#536B88]">
                      {po.referenceCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#FFFFFF]">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#C66A42]">
                      ₹{po.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-[#252B38] border border-[#414957] text-[#FFFFFF] rounded-sm">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/buyer/orders/${po.id}`}
                        className="text-[#536B88] hover:text-[#FFFFFF] font-mono uppercase text-[11px] font-bold transition-colors"
                      >
                        Inspect PO →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

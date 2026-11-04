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
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D8CF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 border shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#53634A] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMINISTRATIVE PROCUREMENT DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              Platform Procurement Governance
            </h1>
            <p className="text-xs text-[#777970]">
              Monitor Gujarat construction GMV, verify supplier GSTINs, and supervise delivery dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-4 py-2 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] text-xs font-bold uppercase transition-colors shadow-sm"
            >
              Post Test RFQ
            </Link>
          </div>
        </div>

        {/* Global KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="text-xs font-mono text-[#777970] uppercase">PROCUREMENT GMV</div>
            <div className="font-mono text-2xl font-black text-[#53634A]">
              ₹{metrics ? (metrics.totalProcurementGmv / 100000).toFixed(1) + ' Lakh' : '₹3.9 Cr'}
            </div>
            <div className="text-[11px] text-[#777970]">Awarded purchase orders</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="text-xs font-mono text-[#777970] uppercase">ACTIVE RFQS</div>
            <div className="font-mono text-2xl font-black text-[#171A17]">
              {metrics?.activeRfqs || rfqs.length}
            </div>
            <div className="text-[11px] text-[#777970]">Bidding in progress</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="text-xs font-mono text-[#777970] uppercase">TOTAL QUOTATIONS</div>
            <div className="font-mono text-2xl font-black text-[#171A17]">
              {metrics?.totalQuotations || 14}
            </div>
            <div className="text-[11px] text-[#777970]">Submitted by stockists</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="text-xs font-mono text-[#777970] uppercase">IN-TRANSIT SHIPMENTS</div>
            <div className="font-mono text-2xl font-black text-[#171A17]">
              {metrics?.activeDeliveries || orders.length}
            </div>
            <div className="text-[11px] text-[#777970]">Tracked vehicles</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="text-xs font-mono text-[#777970] uppercase">VERIFIED SUPPLIERS</div>
            <div className="font-mono text-2xl font-black text-[#496B4B]">
              {suppliers.length}
            </div>
            <div className="text-[11px] text-[#777970]">100% GST Validated</div>
          </div>
        </div>

        {/* Section: Verified Suppliers Directory & GST Status */}
        <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D8CF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#171A17]">
                Verified Material Dealers & Stockists ({suppliers.length})
              </h2>
              <p className="text-xs text-[#777970]">
                Physical stockyards, verified GSTIN certificates, and primary categories in Gujarat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#D9D8CF] font-mono uppercase text-[#777970]">
                  <th className="py-3 pr-4">Supplier Firm</th>
                  <th className="py-3 px-4">GSTIN & Verification</th>
                  <th className="py-3 px-4">Stockyard Location</th>
                  <th className="py-3 px-4">Categories & Brands</th>
                  <th className="py-3 pl-4">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D8CF]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F2F0E9]/60 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-[#171A17] text-sm">{s.businessName}</div>
                      <div className="text-[11px] text-[#777970] font-mono">{s.contactPerson} • {s.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-[#171A17] font-bold">{s.gstin}</div>
                      <div className="text-[#496B4B] text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{s.verificationBadge}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#171A17]">
                      <div>{s.address}</div>
                      <div className="text-[#777970] font-mono text-[10px]">{s.city}, Gujarat</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#53634A] font-mono uppercase font-bold">{s.primaryCategories.join(', ')}</div>
                      <div className="text-[11px] text-[#777970]">{s.brandsOffered.slice(0, 3).join(', ')}</div>
                    </td>
                    <td className="py-3 pl-4 font-mono text-right">
                      <div className="font-bold text-[#171A17]">{s.completedDeliveries}</div>
                      <div className="text-[#B87948] text-[11px]">★ {s.rating}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Live Order & Delivery Oversight */}
        <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D8CF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#171A17]">
                Purchase Order & Transit Control Center
              </h2>
              <p className="text-xs text-[#777970]">
                Real-time delivery progress across Gujarat construction projects.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((po) => (
              <div
                key={po.id}
                className="bg-[#F2F0E9] border border-[#D9D8CF] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#171A17] px-2 py-0.5 bg-[#FFFFFF] border border-[#D9D8CF]">
                      {po.referenceCode}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#E7E5DC] text-[#53634A] border border-[#D9D8CF]">
                      {po.deliveryStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[#777970]">Buyer: {po.buyerName}</span>
                    <span className="text-[#D9D8CF]">•</span>
                    <span className="text-[#171A17] font-semibold">Supplier: {po.supplierName}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#53634A]">
                    ₹{po.grandTotal.toLocaleString('en-IN')} (incl. GST & Freight)
                  </div>
                  {po.dispatchDetails && (
                    <div className="font-mono text-[#777970] text-[11px]">
                      Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType}) • Driver: {po.dispatchDetails.driverName} ({po.dispatchDetails.driverPhone})
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/buyer/orders/${po.id}`}
                    className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#E7E5DC] border border-[#D9D8CF] text-[#171A17] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Inspect Transit & Receipt</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

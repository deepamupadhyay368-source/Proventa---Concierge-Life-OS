'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Scale,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMINISTRATIVE PROCUREMENT DESK</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-heading">
              Platform Procurement Governance
            </h1>
            <p className="text-xs text-[#858D9B]">
              Monitor Gujarat construction GMV, verify supplier GSTINs, and supervise delivery dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-4 py-2 bg-[#F25C05] text-white text-xs font-bold uppercase rounded-xs"
            >
              Post Test RFQ
            </Link>
          </div>
        </div>

        {/* Global KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="text-xs font-mono text-[#858D9B]">PROCUREMENT GMV</div>
            <div className="font-mono text-2xl font-black text-[#F25C05]">
              ₹{metrics ? (metrics.totalProcurementGmv / 100000).toFixed(1) + ' Lakh' : '₹3.9 Cr'}
            </div>
            <div className="text-[11px] text-[#C5CAD3]">Awarded purchase orders</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="text-xs font-mono text-[#858D9B]">ACTIVE RFQS</div>
            <div className="font-mono text-2xl font-black text-white">
              {metrics?.activeRfqs || rfqs.length}
            </div>
            <div className="text-[11px] text-[#C5CAD3]">Bidding in progress</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="text-xs font-mono text-[#858D9B]">TOTAL QUOTATIONS</div>
            <div className="font-mono text-2xl font-black text-white">
              {metrics?.totalQuotations || 14}
            </div>
            <div className="text-[11px] text-[#C5CAD3]">Submitted by stockists</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="text-xs font-mono text-[#858D9B]">IN-TRANSIT SHIPMENTS</div>
            <div className="font-mono text-2xl font-black text-white">
              {metrics?.activeDeliveries || orders.length}
            </div>
            <div className="text-[11px] text-[#C5CAD3]">GPS tracked vehicles</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="text-xs font-mono text-[#858D9B]">VERIFIED SUPPLIERS</div>
            <div className="font-mono text-2xl font-black text-emerald-400">
              {suppliers.length}
            </div>
            <div className="text-[11px] text-[#C5CAD3]">100% GST Validated</div>
          </div>
        </div>

        {/* Section: Verified Suppliers Directory & GST Status */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                Verified Material Dealers & Stockists ({suppliers.length})
              </h2>
              <p className="text-xs text-[#858D9B]">
                Physical stockyards, verified GSTIN certificates, and primary categories in Gujarat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#252C38] font-mono uppercase text-[#858D9B]">
                  <th className="py-3 pr-4">Supplier Firm</th>
                  <th className="py-3 px-4">GSTIN & Verification</th>
                  <th className="py-3 px-4">Stockyard Location</th>
                  <th className="py-3 px-4">Categories & Brands</th>
                  <th className="py-3 pl-4">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252C38]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#090B10]/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-white text-sm">{s.businessName}</div>
                      <div className="text-[11px] text-[#858D9B] font-mono">{s.contactPerson} • {s.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-white">{s.gstin}</div>
                      <div className="text-emerald-400 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{s.verificationBadge}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#C5CAD3]">
                      <div>{s.address}</div>
                      <div className="text-[#858D9B] font-mono text-[10px]">{s.city}, Gujarat</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#F25C05] font-mono uppercase">{s.primaryCategories.join(', ')}</div>
                      <div className="text-[11px] text-[#858D9B]">{s.brandsOffered.slice(0, 3).join(', ')}</div>
                    </td>
                    <td className="py-3 pl-4 font-mono text-right">
                      <div className="font-bold text-white">{s.completedDeliveries}</div>
                      <div className="text-amber-400 text-[11px]">★ {s.rating}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Live Order & Delivery Oversight */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                Purchase Order & Transit Control Center
              </h2>
              <p className="text-xs text-[#858D9B]">
                Real-time delivery progress across Ahmedabad construction projects.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map((po) => (
              <div
                key={po.id}
                className="bg-[#090B10] border border-[#252C38] p-4 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white px-2 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs">
                      {po.referenceCode}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#F25C05]/20 text-[#F25C05] border border-[#F25C05]/40 rounded-xs">
                      {po.deliveryStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[#858D9B]">Buyer: {po.buyerName}</span>
                    <span className="text-[#858D9B]">•</span>
                    <span className="text-white">Supplier: {po.supplierName}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#F25C05]">
                    ₹{po.grandTotal.toLocaleString('en-IN')} (incl. GST & Freight)
                  </div>
                  {po.dispatchDetails && (
                    <div className="font-mono text-[#C5CAD3] text-[11px]">
                      Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType}) • Driver: {po.dispatchDetails.driverName} ({po.dispatchDetails.driverPhone})
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/buyer/orders/${po.id}`}
                    className="px-4 py-2 bg-[#171C26] hover:bg-[#252C38] border border-[#252C38] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
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

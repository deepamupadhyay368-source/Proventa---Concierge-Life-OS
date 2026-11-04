'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  FileSpreadsheet,
  Scale,
  Truck,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function SupplierDashboardPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Active supplier context (using first seeded Ahmedabad supplier)
  const supplierId = 'supp-gujarat-steel-cement';

  useEffect(() => {
    async function loadData() {
      try {
        const [resRfqs, resOrders] = await Promise.all([
          fetch(`/api/procurement/rfqs?supplierId=${supplierId}`),
          fetch(`/api/procurement/orders?supplierId=${supplierId}`),
        ]);
        const jsonRfqs = await resRfqs.json();
        const jsonOrders = await resOrders.json();

        if (jsonRfqs.success) setRfqs(jsonRfqs.data || []);
        if (jsonOrders.success) setOrders(jsonOrders.data || []);
      } catch (err) {
        console.error('Error loading supplier data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
              <Store className="w-3.5 h-3.5" />
              <span>SUPPLIER & DISTRIBUTOR PORTAL</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-heading">
              Supplier Command Dashboard
            </h1>
            <p className="text-xs text-[#858D9B]">
              Logged in as: <strong className="text-white">Gujarat Building Materials Syndicate</strong> • Ahmedabad Depot
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/supplier/register"
              className="px-4 py-2 bg-[#171C26] hover:bg-[#252C38] border border-[#252C38] text-xs font-mono uppercase tracking-wider rounded-xs text-[#C5CAD3]"
            >
              Update Dealership Profile
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>MATCHING OPEN RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#F25C05]">{rfqs.length}</div>
            <div className="text-[11px] text-[#C5CAD3]">Ready for quotation submission</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>ACTIVE ORDERS</span>
              <Truck className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-white">{orders.length}</div>
            <div className="text-[11px] text-[#C5CAD3]">In processing & transit</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>DELIVERY RATING</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono text-3xl font-black text-white">4.9 / 5.0</div>
            <div className="text-[11px] text-emerald-400 font-mono">Premium Verified Badge</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>COMPLETED TONNAGE</span>
              <Building2 className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-white">520+</div>
            <div className="text-[11px] text-[#C5CAD3]">Verified Site Deliveries</div>
          </div>
        </div>

        {/* Section: Incoming Matching RFQs to Quote On */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                New Buyer Requirements Matching Your Inventory
              </h2>
              <p className="text-xs text-[#858D9B]">
                Submit itemized rates, GST %, freight charges, and delivery lead times.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#858D9B]">Loading matching RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#858D9B]">No matching open RFQs in your category at this moment.</div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="bg-[#090B10] border border-[#252C38] p-5 rounded-xs hover:border-[#858D9B] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#F25C05] px-2 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs">
                        {rfq.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#252C38] text-[#C5CAD3] rounded-xs">
                        {rfq.projectType}
                      </span>
                      <span className="text-xs text-[#858D9B]">
                        Delivery to: <strong className="text-white">{rfq.delivery?.addressLine}, {rfq.delivery?.city}</strong>
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-base text-white">
                      {rfq.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-xs text-[#C5CAD3]">
                      {rfq.items.map((it, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs font-mono text-[11px]">
                          {it.materialName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#252C38]">
                    <div className="text-right">
                      <div className="text-xs text-[#858D9B] font-mono">Needed by</div>
                      <div className="text-xs font-bold text-white">{rfq.requiredDeliveryDate}</div>
                    </div>

                    <Link
                      href={`/supplier/rfqs/${rfq.id}/quote`}
                      className="px-5 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      <span>Submit Quotation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Active Purchase Orders & Dispatch Updates */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                Orders Won & Dispatch Coordination
              </h2>
              <p className="text-xs text-[#858D9B]">
                Update vehicle assignments, driver contact details, and advance delivery tracking stages.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#858D9B]">
              No active purchase orders won yet. Quote on open RFQs above to win orders.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((po) => (
                <div
                  key={po.id}
                  className="bg-[#090B10] border border-[#252C38] p-5 rounded-xs hover:border-[#858D9B] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs">
                        {po.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#F25C05]/20 text-[#F25C05] border border-[#F25C05]/40 rounded-xs font-bold">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#858D9B]">
                        Buyer: <strong className="text-white">{po.buyerName}</strong>
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Order Amount: ₹{po.grandTotal.toLocaleString('en-IN')} (incl. GST & Freight)
                    </div>

                    <div className="text-xs text-[#C5CAD3] font-mono">
                      Site: {po.delivery?.siteName} ({po.delivery?.addressLine}, {po.delivery?.city})
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#252C38]">
                    <Link
                      href={`/buyer/orders/${po.id}`}
                      className="px-5 py-2.5 bg-[#171C26] hover:bg-[#252C38] border border-[#252C38] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Update Dispatch & Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

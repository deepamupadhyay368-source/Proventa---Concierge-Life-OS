'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Scale,
  Truck,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function BuyerDashboardPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRfqs, resOrders] = await Promise.all([
          fetch('/api/procurement/rfqs?buyerId=all'),
          fetch('/api/procurement/orders?buyerId=all'),
        ]);
        const jsonRfqs = await resRfqs.json();
        const jsonOrders = await resOrders.json();

        if (jsonRfqs.success) setRfqs(jsonRfqs.data || []);
        if (jsonOrders.success) setOrders(jsonOrders.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalQuotesReceived = rfqs.reduce((acc, r) => acc + (r.quotationIds?.length || 0), 0);
  const activeOrdersCount = orders.filter((o) =>
    ['ORDER_CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT'].includes(o.deliveryStatus)
  ).length;
  const completedOrdersCount = orders.filter((o) => o.deliveryStatus === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
              <Building2 className="w-3.5 h-3.5" />
              <span>BUYER PROCUREMENT COMMAND CENTRE</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-heading">
              Construction Procurement Dashboard
            </h1>
            <p className="text-xs text-[#858D9B]">
              Manage requirements, compare incoming quotations, and track active site deliveries in Ahmedabad.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-5 py-3 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-lg shadow-[#F25C05]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New RFQ</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>ACTIVE RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-white">{rfqs.length}</div>
            <div className="text-[11px] text-[#C5CAD3]">Open for supplier quotations</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>QUOTES RECEIVED</span>
              <Scale className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#F25C05]">{totalQuotesReceived}</div>
            <div className="text-[11px] text-[#C5CAD3]">Ready for side-by-side comparison</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>IN-TRANSIT DISPATCHES</span>
              <Truck className="w-4 h-4 text-[#F25C05]" />
            </div>
            <div className="font-mono text-3xl font-black text-white">{activeOrdersCount}</div>
            <div className="text-[11px] text-[#C5CAD3]">With GPS & vehicle tracking</div>
          </div>

          <div className="bg-[#171C26] border border-[#252C38] p-5 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#858D9B]">
              <span>COMPLETED ORDERS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono text-3xl font-black text-white">{completedOrdersCount}</div>
            <div className="text-[11px] text-[#C5CAD3]">Delivered & verified by site</div>
          </div>
        </div>

        {/* Section: Active RFQs & Quotations Matrix Access */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                My Requirements & Incoming Quotations
              </h2>
              <p className="text-xs text-[#858D9B]">
                Review side-by-side matrix and explicitly award Purchase Orders.
              </p>
            </div>
            <Link
              href="/rfq/new"
              className="text-xs font-mono text-[#F25C05] hover:underline"
            >
              + Post Another RFQ
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#858D9B]">Loading active requirements...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-sm text-[#C5CAD3]">No requirements posted yet.</div>
              <Link
                href="/rfq/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F25C05] text-white text-xs font-bold uppercase rounded-xs"
              >
                <span>Post Your First Requirement</span>
              </Link>
            </div>
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
                        Site: {rfq.delivery?.city || 'Ahmedabad'}, Gujarat
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
                      <div className="font-mono text-base font-black text-[#F25C05]">
                        {rfq.quotationIds?.length || 0} Quotes
                      </div>
                      <div className="text-[11px] text-[#858D9B]">
                        {rfq.status === 'PO_ISSUED' ? 'PO Generated' : 'Bidding Active'}
                      </div>
                    </div>

                    <Link
                      href={`/buyer/rfqs/${rfq.id}/compare`}
                      className="px-4 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Compare Quotes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Active Purchase Orders & Live Tracking */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                Purchase Orders & Delivery Dispatch Trackers
              </h2>
              <p className="text-xs text-[#858D9B]">
                Track vehicles, driver phone contacts, e-way bills, and sign off site delivery receipts.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#858D9B]">
              No purchase orders issued yet. Award a quotation above to trigger automated PO generation.
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
                        Supplier: <strong className="text-white">{po.supplierName}</strong>
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Grand Total: ₹{po.grandTotal.toLocaleString('en-IN')} (incl. GST & Delivery)
                    </div>

                    {po.dispatchDetails && (
                      <div className="text-xs font-mono text-[#C5CAD3] flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-[#F25C05]" />
                        <span>Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType})</span>
                        <span>•</span>
                        <span>Driver: {po.dispatchDetails.driverName} ({po.dispatchDetails.driverPhone})</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#252C38]">
                    <Link
                      href={`/buyer/orders/${po.id}`}
                      className="px-5 py-2.5 bg-[#171C26] hover:bg-[#252C38] border border-[#252C38] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Track & Confirm Delivery</span>
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

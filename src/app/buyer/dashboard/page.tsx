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
  Building2,
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
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>BUYER PROCUREMENT COMMAND DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Construction Procurement Dashboard
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Manage project requirements, compare incoming quotations, and track active site deliveries in Gujarat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-5 py-3 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New RFQ</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>ACTIVE RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#536B88]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{rfqs.length}</div>
            <div className="text-[11px] text-[#A8ADB7]">Open for supplier quotations</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>QUOTES RECEIVED</span>
              <Scale className="w-4 h-4 text-[#536B88]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#536B88]">{totalQuotesReceived}</div>
            <div className="text-[11px] text-[#A8ADB7]">Ready for side-by-side comparison</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>IN-TRANSIT DISPATCHES</span>
              <Truck className="w-4 h-4 text-[#C66A42]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{activeOrdersCount}</div>
            <div className="text-[11px] text-[#A8ADB7]">With vehicle & driver tracking</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>COMPLETED ORDERS</span>
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{completedOrdersCount}</div>
            <div className="text-[11px] text-[#A8ADB7]">Delivered & verified by site</div>
          </div>
        </div>

        {/* Section: Active RFQs & Quotations Matrix Access */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                My Requirements & Incoming Quotations
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Review side-by-side matrix and award Purchase Orders.
              </p>
            </div>
            <Link
              href="/rfq/new"
              className="text-xs font-mono font-bold text-[#C66A42] hover:underline"
            >
              + Post Another RFQ
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#A8ADB7]">Loading active requirements...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-sm text-[#A8ADB7]">No requirements posted yet.</div>
              <Link
                href="/rfq/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] text-[#FFFFFF] text-xs font-bold uppercase rounded-sm"
              >
                <span>Post Your First Requirement</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="bg-[#252B38] border border-[#414957] p-5 hover:border-[#536B88] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#536B88] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                        {rfq.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#303746] text-[#F1F2F4] rounded-sm">
                        {rfq.projectType}
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Site: {rfq.delivery?.city || 'Ahmedabad'}, Gujarat
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-base text-[#FFFFFF]">
                      {rfq.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-xs text-[#F1F2F4]">
                      {rfq.items.map((it, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#191B20] border border-[#414957] font-mono text-[11px] text-[#A8ADB7] rounded-sm">
                          {it.materialName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#414957]">
                    <div className="text-right">
                      <div className="font-mono text-base font-black text-[#536B88]">
                        {rfq.quotationIds?.length || 0} Quotes
                      </div>
                      <div className="text-[11px] text-[#A8ADB7]">
                        {rfq.status === 'PO_ISSUED' ? 'PO Generated' : 'Bidding Active'}
                      </div>
                    </div>

                    <Link
                      href={`/buyer/rfqs/${rfq.id}/compare`}
                      className="px-4 py-2.5 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-sm"
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
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Purchase Orders & Delivery Dispatch Trackers
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Track vehicles, driver phone contacts, e-way bills, and sign off site delivery receipts.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8ADB7]">
              No purchase orders issued yet. Award a quotation above to trigger automated PO generation.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((po) => (
                <div
                  key={po.id}
                  className="bg-[#252B38] border border-[#414957] p-5 hover:border-[#536B88] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                        {po.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#303746] text-[#536B88] border border-[#414957] font-bold rounded-sm">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Supplier: <strong className="text-[#FFFFFF]">{po.supplierName}</strong>
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#F1F2F4]">
                      Grand Total: ₹{po.grandTotal.toLocaleString('en-IN')} (incl. GST & Delivery)
                    </div>

                    {po.dispatchDetails && (
                      <div className="text-xs font-mono text-[#A8ADB7] flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-[#536B88]" />
                        <span>Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType})</span>
                        <span>•</span>
                        <span>Driver: {po.dispatchDetails.driverName} ({po.dispatchDetails.driverPhone})</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#414957]">
                    <Link
                      href={`/buyer/orders/${po.id}`}
                      className="px-5 py-2.5 bg-[#303746] hover:bg-[#191B20] border border-[#414957] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-sm"
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

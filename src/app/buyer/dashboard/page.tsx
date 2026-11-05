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
  Clock,
  Layers,
  Store,
  Search,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function BuyerDashboardPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRfqs, resOrders, resProfile] = await Promise.all([
          fetch('/api/procurement/rfqs?buyerId=all'),
          fetch('/api/procurement/orders?buyerId=all'),
          fetch('/api/business/profile').catch(() => null),
        ]);
        const jsonRfqs = await resRfqs.json();
        const jsonOrders = await resOrders.json();

        if (jsonRfqs.success) setRfqs(jsonRfqs.data || []);
        if (jsonOrders.success) setOrders(jsonOrders.data || []);

        if (resProfile && resProfile.ok) {
          const jsonProf = await resProfile.json();
          if (jsonProf.success && jsonProf.data?.business) {
            setBusinessProfile(jsonProf.data.business);
          }
        }
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

  const role = businessProfile?.platformRole || 'BUYER';
  const businessName = businessProfile?.name || 'Buyer Enterprise';

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>BUYER PROCUREMENT COMMAND DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              {businessName}
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Manage project requirements, compare incoming quotations, and track active site deliveries in Gujarat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/buyer/discovery"
              className="px-4 py-2.5 bg-[#536B88] hover:bg-[#637d9e] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <Search className="w-4 h-4" />
              <span>Discover Suppliers</span>
            </Link>
            {role === 'BOTH' && (
              <Link
                href="/supplier/dashboard"
                className="px-3.5 py-2.5 bg-[#252B38] hover:bg-[#191B20] border border-[#536B88] text-xs font-mono uppercase tracking-wider text-[#FFFFFF] font-bold rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Store className="w-3.5 h-3.5 text-[#536B88]" />
                <span>Switch to Supplier Portal</span>
              </Link>
            )}
            <Link
              href="/settings/business-profile"
              className="px-4 py-2.5 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono uppercase tracking-wider text-[#F1F2F4] font-bold rounded-sm transition-colors"
            >
              Business Settings
            </Link>
            <Link
              href="/rfq/new"
              className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
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
            <div className="text-[11px] text-[#A8ADB7]">Real-time GPS tracked shipments</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>FULFILLED DELIVERIES</span>
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{completedOrdersCount}</div>
            <div className="text-[11px] text-[#A8ADB7]">Verified site deliveries</div>
          </div>
        </div>

        {/* Section 1: Active Material Requirements (RFQs) */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Active Material Requirements (RFQs)
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Live procurement requests sent to verified Ahmedabad building material suppliers.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#A8ADB7]">Loading procurement data...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8ADB7]">No active RFQs created yet.</div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => {
                const quoteCount = rfq.quotationIds?.length || 0;
                return (
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
                          {rfq.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-[#A8ADB7]">
                          Site: <strong className="text-[#FFFFFF]">{rfq.delivery?.siteName || rfq.delivery?.addressLine}</strong>
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
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-[#FFFFFF]">
                          {quoteCount} {quoteCount === 1 ? 'Quotation' : 'Quotations'}
                        </div>
                        <div className="text-[10px] text-[#536B88] uppercase">
                          {quoteCount > 0 ? 'Ready to compare' : 'Awaiting bids'}
                        </div>
                      </div>

                      {quoteCount > 0 ? (
                        <Link
                          href={`/buyer/rfqs/${rfq.id}/compare`}
                          className="px-4 py-2 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm rounded-sm"
                        >
                          <span>Compare Quotes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-[#252B38] border border-[#414957] text-[#6B7280] text-xs font-mono uppercase rounded-sm cursor-not-allowed"
                        >
                          Awaiting Quotes
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Active Orders & Live Logistics Tracking */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                Active Purchase Orders & Site Logistics
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Track dispatches, transit GPS, and confirm delivery weighbridge receipts.
              </p>
            </div>
            <Link
              href="/logistics/deliveries"
              className="text-xs font-mono font-bold text-[#536B88] hover:text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>Full Fleet View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#A8ADB7]">Loading active deliveries...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8ADB7]">No purchase orders issued yet.</div>
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
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#536B88]/20 text-[#536B88] border border-[#536B88]/40 rounded-sm font-bold">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Supplier: <strong className="text-[#FFFFFF]">{po.supplierName}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-[#A8ADB7]">
                      Delivery to: <span className="text-[#F1F2F4] font-medium">{po.delivery?.siteName || po.delivery?.addressLine}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 font-mono text-xs">
                      <span className="text-[#FFFFFF] font-bold">
                        ₹{po.grandTotal.toLocaleString('en-IN')} (All-inclusive landed)
                      </span>
                      {po.dispatchDetails?.vehicleNumber && (
                        <span className="text-[#536B88]">
                          Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.driverName || 'Driver'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#414957]">
                    <Link
                      href={`/logistics/deliveries/${po.id}`}
                      className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-sm"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#C66A42]" />
                      <span>Track Delivery</span>
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

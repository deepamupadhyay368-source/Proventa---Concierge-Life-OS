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
  CreditCard,
  Package,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';
import type { LedgerFinancialSummary } from '@/lib/payment-intelligence/types';

export default function BuyerDashboardPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [financialSummary, setFinancialSummary] = useState<LedgerFinancialSummary | null>(null);
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
            const biz = jsonProf.data.business;
            setBusinessProfile(biz);
            if (biz.id) {
              const resSum = await fetch(`/api/payment-intelligence/summary?buyerBusinessId=${encodeURIComponent(biz.id)}`).catch(() => null);
              if (resSum && resSum.ok) {
                const jsonSum = await resSum.json();
                if (jsonSum.success) setFinancialSummary(jsonSum.data);
              }
            }
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
    <div className="min-h-screen bg-[#F4F7FA] text-[#243447] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E2E8EF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 shadow-xs rounded-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#315F91] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>BUYER PROCUREMENT COMMAND DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#243447] font-heading">
              {businessName}
            </h1>
            <p className="text-xs text-[#6B7785]">
              Manage project requirements, compare incoming quotations, and track active site deliveries in Gujarat and PAN India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/buyer/discovery"
              className="px-4 py-2.5 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs rounded-xs"
            >
              <Search className="w-4 h-4 text-[#315F91]" />
              <span>Discover Suppliers</span>
            </Link>
            {role === 'BOTH' && (
              <Link
                href="/supplier/dashboard"
                className="px-3.5 py-2.5 bg-white hover:bg-[#F4F7FA] border border-[#315F91] text-xs font-mono uppercase tracking-wider text-[#315F91] font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-[#315F91]" />
                <span>Switch to Supplier Portal</span>
              </Link>
            )}
            <Link
              href="/settings/business-profile"
              className="px-4 py-2.5 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] text-xs font-mono uppercase tracking-wider text-[#6B7785] hover:text-[#243447] font-bold rounded-xs transition-colors"
            >
              Business Settings
            </Link>
            <Link
              href="/rfq/new"
              className="px-5 py-2.5 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs rounded-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New RFQ</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>ACTIVE RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#243447]">{rfqs.length}</div>
            <div className="text-[11px] text-[#6B7785]">Open for supplier quotations</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>QUOTES RECEIVED</span>
              <Scale className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#315F91]">{totalQuotesReceived}</div>
            <div className="text-[11px] text-[#6B7785]">Ready for side-by-side comparison</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>IN-TRANSIT DISPATCHES</span>
              <Truck className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#243447]">{activeOrdersCount}</div>
            <div className="text-[11px] text-[#6B7785]">Active shipments in transit</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>FULFILLED DELIVERIES</span>
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#243447]">{completedOrdersCount}</div>
            <div className="text-[11px] text-[#6B7785]">Weighbridge verified site deliveries</div>
          </div>
        </div>

        {/* Quick Portal Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/buyer/rfqs"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Schedule</div>
              <div className="text-xs font-bold uppercase text-[#243447]">All Requirements</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/buyer/orders"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Orders</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Purchase Orders</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/buyer/discovery"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Vendors</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Supplier Network</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/buyer/payments"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#315F91] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#315F91]">Ledger</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Payment Intelligence</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Section 1: Active Material Requirements (RFQs) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-6 sm:p-8 space-y-5 shadow-xs rounded-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#243447]">
                Active Material Requirements (RFQs)
              </h2>
              <p className="text-xs text-[#6B7785]">
                Live procurement requests sent to verified building material suppliers.
              </p>
            </div>
            <Link
              href="/buyer/rfqs"
              className="text-xs font-mono font-bold text-[#315F91] hover:text-[#264B74] uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>View All ({rfqs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#6B7785]">Loading procurement data...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#6B7785]">No active RFQs created yet.</div>
          ) : (
            <div className="space-y-4">
              {rfqs.slice(0, 5).map((rfq) => {
                const quoteCount = rfq.quotationIds?.length || 0;
                return (
                  <div
                    key={rfq.id}
                    className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 hover:border-[#315F91] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xs shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#315F91] px-2 py-0.5 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs">
                          {rfq.referenceCode}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#F4F7FA] text-[#243447] rounded-xs">
                          {rfq.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-[#6B7785]">
                          Site: <strong className="text-[#243447]">{rfq.delivery?.siteName || rfq.delivery?.addressLine}</strong>
                        </span>
                      </div>

                      <h3 className="font-heading font-black text-base text-[#243447]">
                        {rfq.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-xs text-[#243447]">
                        {rfq.items.map((it, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#F4F7FA] border border-[#E2E8EF] font-mono text-[11px] text-[#6B7785] rounded-xs">
                            {it.materialName} ({it.quantity} {it.unit})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8EF]">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-[#243447]">
                          {quoteCount} {quoteCount === 1 ? 'Quotation' : 'Quotations'}
                        </div>
                        <div className="text-[10px] text-[#315F91] uppercase">
                          {quoteCount > 0 ? 'Ready to compare' : 'Awaiting bids'}
                        </div>
                      </div>

                      {rfq.status === 'CANCELLED' ? (
                        <span className="px-3 py-1.5 bg-[#F4F7FA] border border-[#D9534F]/40 text-[#D9534F] text-xs font-mono uppercase rounded-xs font-bold">
                          Withdrawn
                        </span>
                      ) : quoteCount > 0 ? (
                        <Link
                          href={`/buyer/rfqs/${rfq.id}/compare`}
                          className="px-4 py-2 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs rounded-xs"
                        >
                          <span>Compare Quotes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/buyer/rfqs/${rfq.id}/compare`}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] text-[#6B7785] hover:text-[#243447] text-xs font-mono uppercase rounded-xs transition-colors flex items-center gap-1.5"
                        >
                          <span>View RFQ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Active Orders & Live Logistics Tracking */}
        <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-6 sm:p-8 space-y-5 shadow-xs rounded-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#243447]">
                Active Purchase Orders &amp; Site Logistics
              </h2>
              <p className="text-xs text-[#6B7785]">
                Track dispatches, verify driver details, and confirm delivery weighbridge receipts.
              </p>
            </div>
            <Link
              href="/buyer/orders"
              className="text-xs font-mono font-bold text-[#315F91] hover:text-[#264B74] uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>View All Orders ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#6B7785]">Loading active deliveries...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#6B7785]">No purchase orders issued yet.</div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((po) => (
                <div
                  key={po.id}
                  className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 hover:border-[#315F91] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xs shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#243447] px-2 py-0.5 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs">
                        {po.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#315F91]/10 text-[#315F91] border border-[#315F91]/20 rounded-xs font-bold">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#6B7785]">
                        Supplier: <strong className="text-[#243447]">{po.supplierName}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-[#6B7785]">
                      Delivery to: <span className="text-[#243447] font-medium">{po.delivery?.siteName || po.delivery?.addressLine}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 font-mono text-xs">
                      <span className="text-[#243447] font-bold">
                        ₹{po.grandTotal.toLocaleString('en-IN')} (All-inclusive landed)
                      </span>
                      {po.dispatchDetails?.vehicleNumber && (
                        <span className="text-[#315F91]">
                          Vehicle: {po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.driverName || 'Driver'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8EF]">
                    <Link
                      href={`/logistics/deliveries/${po.id}`}
                      className="px-4 py-2 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#315F91]" />
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

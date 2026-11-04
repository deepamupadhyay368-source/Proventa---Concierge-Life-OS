'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  ArrowRight,
  Building2,
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
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D8CF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 border shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#53634A] font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>SUPPLIER & DISTRIBUTOR PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171A17] font-heading">
              Supplier Command Dashboard
            </h1>
            <p className="text-xs text-[#777970]">
              Logged in as: <strong className="text-[#171A17]">Gujarat Building Materials Syndicate</strong> • Ahmedabad Depot
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/supplier/register"
              className="px-4 py-2 bg-[#E7E5DC] hover:bg-[#D9D8CF] border border-[#D9D8CF] text-xs font-mono uppercase tracking-wider text-[#171A17] font-bold"
            >
              Update Dealership Profile
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#777970] uppercase">
              <span>MATCHING OPEN RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#53634A]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#53634A]">{rfqs.length}</div>
            <div className="text-[11px] text-[#777970]">Ready for quotation submission</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#777970] uppercase">
              <span>ACTIVE ORDERS</span>
              <Truck className="w-4 h-4 text-[#53634A]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#171A17]">{orders.length}</div>
            <div className="text-[11px] text-[#777970]">In processing & transit</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#777970] uppercase">
              <span>DELIVERY RATING</span>
              <CheckCircle2 className="w-4 h-4 text-[#496B4B]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#171A17]">4.9 / 5.0</div>
            <div className="text-[11px] text-[#496B4B] font-mono font-bold">Verified Dealer Status</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#777970] uppercase">
              <span>DELIVERED TONNAGE</span>
              <Building2 className="w-4 h-4 text-[#53634A]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#171A17]">520+ MT</div>
            <div className="text-[11px] text-[#777970]">Verified Site Deliveries</div>
          </div>
        </div>

        {/* Section: Incoming Matching RFQs to Quote On */}
        <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9D8CF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#171A17]">
                New Buyer Requirements Matching Your Inventory
              </h2>
              <p className="text-xs text-[#777970]">
                Submit itemized rates, GST %, freight charges, and delivery lead times.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#777970]">Loading matching RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#777970]">No matching open RFQs in your category at this moment.</div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="bg-[#F2F0E9] border border-[#D9D8CF] p-5 hover:border-[#53634A] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#53634A] px-2 py-0.5 bg-[#FFFFFF] border border-[#D9D8CF]">
                        {rfq.referenceCode}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#E7E5DC] text-[#171A17]">
                        {rfq.urgency} Urgency
                      </span>
                      <span className="text-xs text-[#777970]">
                        Deliver to: <strong className="text-[#171A17]">{rfq.delivery?.city || 'Ahmedabad'}</strong> ({rfq.delivery?.vehicleAccessibility || 'Standard Access'})
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-base text-[#171A17]">
                      {rfq.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-xs text-[#171A17]">
                      {rfq.items.map((it, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#FFFFFF] border border-[#D9D8CF] font-mono text-[11px]">
                          {it.materialName} ({it.quantity} {it.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#D9D8CF]">
                    <Link
                      href={`/supplier/rfqs/${rfq.id}/quote`}
                      className="px-5 py-2.5 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
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
      </div>
    </div>
  );
}

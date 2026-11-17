'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { PurchaseOrder } from '@/lib/procurement/types';
import { DELIVERY_STAGES_SEQUENCE } from '@/lib/procurement/types';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/procurement/orders?buyerId=all');
        const json = await res.json();
        if (json.success) {
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error('Error loading purchase orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const inTransitCount = orders.filter((o) =>
    ['PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT'].includes(o.deliveryStatus)
  ).length;
  const completedCount = orders.filter((o) => o.deliveryStatus === 'COMPLETED').length;

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'IN_TRANSIT')
      return ['PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'IN_TRANSIT'].includes(order.deliveryStatus);
    if (activeFilter === 'DELIVERED')
      return ['DELIVERED', 'COMPLETED'].includes(order.deliveryStatus);
    if (activeFilter === 'CONFIRMED')
      return order.deliveryStatus === 'ORDER_CONFIRMED';
    return true;
  });

  const getStageIndex = (stage: string) => {
    const idx = DELIVERY_STAGES_SEQUENCE.indexOf(stage as any);
    return idx >= 0 ? idx : 0;
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'ORDER_CONFIRMED':
        return 'text-[#536B88] border-[#536B88]/40 bg-[#191B20]';
      case 'PROCESSING':
      case 'READY_FOR_DISPATCH':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/60';
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return 'text-[#C66A42] border-[#C66A42]/40 bg-[#191B20]';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60';
      default:
        return 'text-[#A8ADB7] border-[#414957] bg-[#191B20]';
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              <span>COMMERCIAL PURCHASE ORDERS &bull; FULFILMENT DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Purchase Orders &amp; Site Logistics
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Monitor legally binding PO commitments, vehicle dispatch notices, and site weighbridge receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/rfqs"
              className="px-4 py-2.5 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>View Active RFQs</span>
            </Link>
            <Link
              href="/rfq/new"
              className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>New Requirement</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2">
            <div className="text-xs font-mono text-[#A8ADB7] uppercase">Total Purchase Orders</div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{orders.length}</div>
            <div className="text-[11px] text-[#A8ADB7]">Issued to verified suppliers</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2">
            <div className="text-xs font-mono text-[#C66A42] uppercase">In Processing / Transit</div>
            <div className="font-mono text-3xl font-black text-[#C66A42]">{inTransitCount}</div>
            <div className="text-[11px] text-[#A8ADB7]">Active shipments</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2">
            <div className="text-xs font-mono text-[#4A7C59] uppercase">Completed Deliveries</div>
            <div className="font-mono text-3xl font-black text-emerald-400">{completedCount}</div>
            <div className="text-[11px] text-[#A8ADB7]">Weighbridge verified</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2">
            <div className="text-xs font-mono text-[#536B88] uppercase">Total PO Value</div>
            <div className="font-mono text-xl sm:text-2xl font-black text-[#FFFFFF] truncate">
              ₹{orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#A8ADB7]">All-inclusive landed commitments</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#414957] pb-3">
          {[
            { id: 'ALL', label: 'All Orders', count: orders.length },
            { id: 'IN_TRANSIT', label: 'In Transit', count: inTransitCount },
            { id: 'DELIVERED', label: 'Delivered', count: completedCount },
            { id: 'CONFIRMED', label: 'Confirmed', count: orders.filter((o) => o.deliveryStatus === 'ORDER_CONFIRMED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-[#536B88] text-[#FFFFFF] font-bold'
                  : 'bg-[#303746] text-[#A8ADB7] hover:text-[#FFFFFF] border border-[#414957]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#191B20]/60 rounded-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#A8ADB7] bg-[#303746] border border-[#414957] rounded-sm">
            Loading purchase orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#303746] border border-[#414957] p-8 rounded-sm">
            <Package className="w-10 h-10 text-[#414957] mx-auto" />
            <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">
              No Purchase Orders Found
            </h3>
            <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
              Once you evaluate supplier quotations on your RFQs and confirm an award, your formal purchase orders will appear here.
            </p>
            <Link
              href="/buyer/rfqs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>View Active RFQs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((po) => {
              const currentStageIndex = getStageIndex(po.deliveryStatus);
              return (
                <div
                  key={po.id}
                  className="bg-[#303746] border border-[#414957] p-6 hover:border-[#536B88] transition-colors rounded-sm space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#414957]/60 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                        {po.referenceCode}
                      </span>
                      <span
                        className={`font-mono text-[11px] px-2.5 py-0.5 border rounded-sm font-bold uppercase ${getStageBadgeColor(
                          po.deliveryStatus
                        )}`}
                      >
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Supplier: <strong className="text-[#FFFFFF]">{po.supplierName}</strong>
                      </span>
                      {po.supplierGstin && (
                        <span className="text-[10px] font-mono text-[#536B88]">
                          GSTIN: {po.supplierGstin}
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-sm font-black text-[#FFFFFF]">
                      ₹{po.grandTotal.toLocaleString('en-IN')} (All-inclusive Landed)
                    </div>
                  </div>

                  {/* 7-Stage Pipeline Tracker */}
                  <div className="py-2">
                    <div className="text-[10px] font-mono uppercase text-[#A8ADB7] mb-2">
                      Fulfillment Pipeline
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {DELIVERY_STAGES_SEQUENCE.map((stage, idx) => {
                        const isPast = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        return (
                          <div key={stage} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                isPast
                                  ? 'bg-[#4A7C59]'
                                  : isCurrent
                                  ? 'bg-[#C66A42]'
                                  : 'bg-[#191B20]'
                              }`}
                            />
                            <div
                              className={`text-[9px] font-mono truncate ${
                                isCurrent
                                  ? 'text-[#FFFFFF] font-bold'
                                  : isPast
                                  ? 'text-[#A8ADB7]'
                                  : 'text-[#414957]'
                              }`}
                            >
                              {stage.replace(/_/g, ' ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details & Delivery Site */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                    <div className="space-y-1 text-xs text-[#A8ADB7]">
                      <div>
                        Delivery Destination:{' '}
                        <strong className="text-[#FFFFFF]">
                          {po.delivery?.siteName || po.delivery?.addressLine || 'Project Site'}
                        </strong>{' '}
                        ({po.delivery?.city || 'Gujarat'})
                      </div>
                      {po.dispatchDetails?.vehicleNumber && (
                        <div className="font-mono text-[11px] text-[#536B88]">
                          Vehicle: {po.dispatchDetails.vehicleNumber} &bull; Driver: {po.dispatchDetails.driverName || 'Assigned'} ({po.dispatchDetails.driverPhone || 'N/A'})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/logistics/deliveries/${po.id}`}
                        className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#536B88] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-sm"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#C66A42]" />
                        <span>Track Delivery</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

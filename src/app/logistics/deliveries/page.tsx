'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Phone,
  ArrowRight,
} from 'lucide-react';
import type { PurchaseOrder } from '@/lib/procurement/types';

export default function LogisticsDeliveriesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogistics() {
      try {
        const res = await fetch('/api/procurement/orders?buyerId=all');
        const json = await res.json();
        if (json.success) {
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error('Error loading logistics dispatches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogistics();
  }, []);

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" />
              <span>LOGISTICS & TRANSPORTER FLEET DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Dispatch & Site Delivery Coordination
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Real-time vehicle assignment, transit status updates, and proof of delivery verification across Gujarat.
            </p>
          </div>
        </div>

        {/* Section: Dispatches Table */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
              Active Shipments & Fleet Assignments ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#A8ADB7]">Loading active shipments...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8ADB7]">No active dispatches at this time.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((po) => (
                <div
                  key={po.id}
                  className="bg-[#252B38] border border-[#414957] p-5 hover:border-[#536B88] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                        {po.referenceCode}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#303746] text-[#536B88] border border-[#414957] rounded-sm">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Vehicle Clearance: <strong className="text-[#FFFFFF]">{po.delivery?.vehicleAccessibility || 'Standard Access'}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-[#A8ADB7] font-mono">Destination Site:</div>
                        <div className="font-bold text-[#FFFFFF] text-sm">{po.delivery?.siteName}</div>
                        <div className="text-[#A8ADB7]">{po.delivery?.addressLine}, {po.delivery?.city}</div>
                      </div>

                      {po.dispatchDetails && (
                        <div>
                          <div className="text-[#A8ADB7] font-mono">Assigned Vehicle & Driver:</div>
                          <div className="font-bold text-[#FFFFFF] font-mono">{po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType})</div>
                          <div className="text-[#536B88] font-mono flex items-center gap-1 font-bold">
                            <Phone className="w-3 h-3" />
                            <span>{po.dispatchDetails.driverName} • {po.dispatchDetails.driverPhone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#414957]">
                    <Link
                      href={`/buyer/orders/${po.id}`}
                      className="px-5 py-2.5 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm rounded-sm"
                    >
                      <span>Update Dispatch Status</span>
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

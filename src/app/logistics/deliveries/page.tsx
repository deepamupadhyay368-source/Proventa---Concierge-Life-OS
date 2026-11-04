'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
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
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
              <Truck className="w-3.5 h-3.5" />
              <span>LOGISTICS & TRANSPORTER FLEET DESK</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-heading">
              Dispatch & Site Delivery Coordination
            </h1>
            <p className="text-xs text-[#858D9B]">
              Real-time vehicle assignment, transit status updates, and proof of delivery verification across Gujarat.
            </p>
          </div>
        </div>

        {/* Section: Dispatches Table */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252C38] pb-4">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
              Active Shipments & Fleet Assignments ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#858D9B]">Loading active shipments...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#858D9B]">No active dispatches at this time.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((po) => (
                <div
                  key={po.id}
                  className="bg-[#090B10] border border-[#252C38] p-5 rounded-xs hover:border-[#858D9B] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#171C26] border border-[#252C38] rounded-xs">
                        {po.referenceCode}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#F25C05]/20 text-[#F25C05] border border-[#F25C05]/40 rounded-xs">
                        {po.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[#858D9B]">
                        Vehicle Clearance: <strong className="text-white">{po.delivery?.vehicleAccessibility || 'Standard Access'}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-[#858D9B] font-mono">Destination Site:</div>
                        <div className="font-bold text-white text-sm">{po.delivery?.siteName}</div>
                        <div className="text-[#C5CAD3]">{po.delivery?.addressLine}, {po.delivery?.city}</div>
                      </div>

                      {po.dispatchDetails && (
                        <div>
                          <div className="text-[#858D9B] font-mono">Assigned Vehicle & Driver:</div>
                          <div className="font-bold text-white font-mono">{po.dispatchDetails.vehicleNumber} ({po.dispatchDetails.vehicleType})</div>
                          <div className="text-[#F25C05] font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{po.dispatchDetails.driverName} • {po.dispatchDetails.driverPhone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#252C38]">
                    <Link
                      href={`/buyer/orders/${po.id}`}
                      className="px-5 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-md"
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

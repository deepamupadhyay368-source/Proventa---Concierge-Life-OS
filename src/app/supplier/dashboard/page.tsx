'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  ArrowRight,
  Building2,
  ShoppingCart,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { ConstructionRfq, PurchaseOrder } from '@/lib/procurement/types';

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [authorizedBusinesses, setAuthorizedBusinesses] = useState<any[]>([]);
  const [activeSupplierId, setActiveSupplierId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch user business profile to dynamically determine active supplier context
        const searchParams = new URLSearchParams(window.location.search);
        const querySupplierId = searchParams.get('supplierId');

        let resolvedId = querySupplierId || '';

        try {
          const profileRes = await fetch('/api/business/profile');
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            if (profileJson.success) {
              const activeBiz = profileJson.data?.business;
              const allBizs = profileJson.data?.authorizedBusinesses || [];
              setBusinessProfile(activeBiz);
              setAuthorizedBusinesses(allBizs);

              if (!resolvedId && activeBiz?.id) {
                resolvedId = activeBiz.id;
              }
            }
          }
        } catch (e) {
          console.warn('Profile fetch notice:', e);
        }

        setActiveSupplierId(resolvedId);

        // 2. Load matching RFQs and active orders for authenticated supplier
        const queryStr = resolvedId ? `?supplierId=${encodeURIComponent(resolvedId)}` : '';
        const [resRfqs, resOrders] = await Promise.all([
          fetch(`/api/procurement/rfqs${queryStr}`),
          fetch(`/api/procurement/orders${queryStr}`),
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

  const handleBusinessSwitch = (newBusinessId: string) => {
    setActiveSupplierId(newBusinessId);
    router.push(`/supplier/dashboard?supplierId=${encodeURIComponent(newBusinessId)}`);
    window.location.href = `/supplier/dashboard?supplierId=${encodeURIComponent(newBusinessId)}`;
  };

  const businessName = businessProfile?.name || 'Registered Supplier Portal';
  const role = businessProfile?.platformRole || 'SUPPLIER';
  const verificationStatus = businessProfile?.verificationStatus || 'DRAFT';

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#243447] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header with Multi-Business Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E2E8EF] pb-6 bg-[#FFFFFF] p-6 sm:p-8 shadow-xs rounded-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#315F91] font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>SUPPLIER &amp; DISTRIBUTOR PORTAL</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#243447] font-heading">
                {businessName}
              </h1>

              {verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold uppercase rounded-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Supplier</span>
                </span>
              ) : (
                <Link
                  href="/settings/business-profile"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-bold uppercase rounded-xs hover:underline"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Verification: {verificationStatus}</span>
                </Link>
              )}

              {/* Multi-Business Switcher */}
              {authorizedBusinesses.length > 1 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F4F7FA] border border-[#E2E8EF] rounded-xs text-xs font-mono">
                  <Building2 className="w-3 h-3 text-[#315F91]" />
                  <span className="text-[#6B7785] mr-1">Business:</span>
                  <select
                    value={activeSupplierId}
                    onChange={(e) => handleBusinessSwitch(e.target.value)}
                    className="bg-transparent text-[#243447] font-bold outline-none cursor-pointer"
                  >
                    {authorizedBusinesses.map((b) => (
                      <option key={b.id} value={b.id} className="bg-white text-[#243447]">
                        {b.name} ({b.platformRole})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <p className="text-xs text-[#6B7785]">
              Certified Material Stockist &amp; Logistics Desk • Ahmedabad, Gujarat Region
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/supplier/catalogue"
              className="px-3.5 py-2 bg-[#315F91] hover:bg-[#264B74] text-xs font-mono uppercase tracking-wider text-[#FFFFFF] font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Product Catalogue</span>
            </Link>
            <Link
              href="/supplier/performance"
              className="px-3.5 py-2 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] text-xs font-mono uppercase tracking-wider text-[#243447] font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#315F91]" />
              <span>Performance</span>
            </Link>
            {role === 'BOTH' && (
              <Link
                href="/buyer/dashboard"
                className="px-3.5 py-2 bg-white hover:bg-[#F4F7FA] border border-[#315F91] text-xs font-mono uppercase tracking-wider text-[#315F91] font-bold rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#315F91]" />
                <span>Switch to Buyer Desk</span>
              </Link>
            )}
            <Link
              href="/settings/business-profile"
              className="px-4 py-2 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] text-xs font-mono uppercase tracking-wider text-[#6B7785] hover:text-[#243447] font-bold rounded-xs transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>MATCHING OPEN RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#315F91]">{rfqs.length}</div>
            <div className="text-[11px] text-[#6B7785]">Ready for quotation submission</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>ACTIVE ORDERS</span>
              <Truck className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#243447]">{orders.length}</div>
            <div className="text-[11px] text-[#6B7785]">In processing &amp; transit</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>FULFILLED DELIVERIES</span>
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#243447]">
              {orders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.deliveryStatus)).length}
            </div>
            <div className="text-[11px] text-[#6B7785]">Site weighbridge confirmed</div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-5 space-y-2 shadow-xs rounded-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#6B7785] uppercase">
              <span>PAYMENT INTEGRITY</span>
              <Building2 className="w-4 h-4 text-[#315F91]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#315F91]">
              {orders.length > 0 ? `${orders.length} Orders` : '—'}
            </div>
            <div className="text-[11px] text-[#6B7785]">Commercial transaction depth</div>
          </div>
        </div>

        {/* Quick Portal Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/supplier/rfqs"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Bidding</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Open RFQs</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/supplier/catalogue"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Inventory</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Product Catalogue</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/supplier/performance"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#6B7785]">Reputation</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Performance Desk</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/supplier/payments"
            className="p-4 bg-white hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#315F91] rounded-xs transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-[#315F91]">Invoices</div>
              <div className="text-xs font-bold uppercase text-[#243447]">Payment Intelligence</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#315F91] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Section: Incoming Matching RFQs to Quote On */}
        <div className="bg-[#FFFFFF] border border-[#E2E8EF] p-6 sm:p-8 space-y-5 shadow-xs rounded-xs">
          <div className="flex items-center justify-between border-b border-[#E2E8EF] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#243447]">
                New Buyer Requirements Matching Your Inventory
              </h2>
              <p className="text-xs text-[#6B7785]">
                Submit itemized rates, GST %, freight charges, and delivery lead times.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#6B7785]">Loading matching RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#6B7785]">No matching open RFQs in your category at this moment.</div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
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
                        {rfq.urgency} Urgency
                      </span>
                      <span className="text-xs text-[#6B7785]">
                        Deliver to: <strong className="text-[#243447]">{rfq.delivery?.city || 'Ahmedabad'}</strong> ({rfq.delivery?.vehicleAccessibility || 'Standard Access'})
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

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8EF]">
                    <Link
                      href={`/supplier/rfqs/${rfq.id}/quote`}
                      className="px-5 py-2.5 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs rounded-xs"
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

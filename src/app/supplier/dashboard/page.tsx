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
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header with Multi-Business Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>SUPPLIER & DISTRIBUTOR PORTAL</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                {businessName}
              </h1>

              {verificationStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-mono font-bold uppercase rounded-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Supplier</span>
                </span>
              ) : (
                <Link
                  href="/settings/business-profile"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950/80 border border-amber-500/60 text-amber-400 text-xs font-mono font-bold uppercase rounded-sm hover:underline"
                >
                  <Clock className="w-3 h-3" />
                  <span>Verification: {verificationStatus}</span>
                </Link>
              )}

              {/* Multi-Business Switcher */}
              {authorizedBusinesses.length > 1 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#191B20] border border-[#536B88] rounded-sm text-xs font-mono">
                  <Building2 className="w-3 h-3 text-[#C66A42]" />
                  <span className="text-[#A8ADB7] mr-1">Business:</span>
                  <select
                    value={activeSupplierId}
                    onChange={(e) => handleBusinessSwitch(e.target.value)}
                    className="bg-transparent text-[#FFFFFF] font-bold outline-none cursor-pointer"
                  >
                    {authorizedBusinesses.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#191B20] text-[#FFFFFF]">
                        {b.name} ({b.platformRole})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <p className="text-xs text-[#A8ADB7]">
              Certified Material Stockist & Logistics Desk &bull; Ahmedabad, Gujarat Region
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/supplier/catalogue"
              className="px-3.5 py-2 bg-[#536B88] hover:bg-[#637d9e] text-xs font-mono uppercase tracking-wider text-[#FFFFFF] font-bold rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Product Catalogue</span>
            </Link>
            <Link
              href="/supplier/performance"
              className="px-3.5 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#536B88] text-xs font-mono uppercase tracking-wider text-[#FFFFFF] font-bold rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#536B88]" />
              <span>Performance</span>
            </Link>
            {role === 'BOTH' && (
              <Link
                href="/buyer/dashboard"
                className="px-3.5 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#C66A42] text-xs font-mono uppercase tracking-wider text-[#FFFFFF] font-bold rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#C66A42]" />
                <span>Switch to Buyer Desk</span>
              </Link>
            )}
            <Link
              href="/settings/business-profile"
              className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono uppercase tracking-wider text-[#F1F2F4] font-bold rounded-sm transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* 4 Clean Metric Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>MATCHING OPEN RFQS</span>
              <FileSpreadsheet className="w-4 h-4 text-[#536B88]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#536B88]">{rfqs.length}</div>
            <div className="text-[11px] text-[#A8ADB7]">Ready for quotation submission</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>ACTIVE ORDERS</span>
              <Truck className="w-4 h-4 text-[#C66A42]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">{orders.length}</div>
            <div className="text-[11px] text-[#A8ADB7]">In processing & transit</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>DELIVERY RATING</span>
              <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">4.9 / 5.0</div>
            <div className="text-[11px] text-[#4A7C59] font-mono font-bold">Verified Dealer Status</div>
          </div>

          <div className="bg-[#303746] border border-[#414957] p-5 space-y-2 shadow-sm rounded-sm">
            <div className="flex items-center justify-between text-xs font-mono text-[#A8ADB7] uppercase">
              <span>DELIVERED TONNAGE</span>
              <Building2 className="w-4 h-4 text-[#536B88]" />
            </div>
            <div className="font-mono text-3xl font-black text-[#FFFFFF]">520+ MT</div>
            <div className="text-[11px] text-[#A8ADB7]">Verified Site Deliveries</div>
          </div>
        </div>

        {/* Section: Incoming Matching RFQs to Quote On */}
        <div className="bg-[#303746] border border-[#414957] p-6 sm:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex items-center justify-between border-b border-[#414957] pb-4">
            <div>
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-[#FFFFFF]">
                New Buyer Requirements Matching Your Inventory
              </h2>
              <p className="text-xs text-[#A8ADB7]">
                Submit itemized rates, GST %, freight charges, and delivery lead times.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#A8ADB7]">Loading matching RFQs...</div>
          ) : rfqs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8ADB7]">No matching open RFQs in your category at this moment.</div>
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
                        {rfq.urgency} Urgency
                      </span>
                      <span className="text-xs text-[#A8ADB7]">
                        Deliver to: <strong className="text-[#FFFFFF]">{rfq.delivery?.city || 'Ahmedabad'}</strong> ({rfq.delivery?.vehicleAccessibility || 'Standard Access'})
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

                  <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#414957]">
                    <Link
                      href={`/supplier/rfqs/${rfq.id}/quote`}
                      className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm rounded-sm"
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

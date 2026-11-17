'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Truck,
  Scale,
} from 'lucide-react';
import type { ConstructionRfq } from '@/lib/procurement/types';

export default function SupplierRfqsPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [supplierId, setSupplierId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get active supplier context from business profile
        let resolvedId = '';
        const searchParams = new URLSearchParams(window.location.search);
        const querySupplierId = searchParams.get('supplierId');

        try {
          const profileRes = await fetch('/api/business/profile');
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            if (profileJson.success && profileJson.data?.business?.id) {
              resolvedId = profileJson.data.business.id;
            }
          }
        } catch (e) {
          console.warn('Profile fetch notice:', e);
        }

        if (querySupplierId) resolvedId = querySupplierId;
        setSupplierId(resolvedId);

        const queryStr = resolvedId ? `?supplierId=${encodeURIComponent(resolvedId)}` : '';
        const res = await fetch(`/api/procurement/rfqs${queryStr}`);
        const json = await res.json();
        if (json.success) {
          setRfqs(json.data || []);
        }
      } catch (err) {
        console.error('Error loading supplier RFQs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRfqs = rfqs.filter((rfq) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'OPEN') return rfq.status === 'OPEN' || rfq.status === 'SUPPLIERS_INVITED';
    if (activeFilter === 'QUOTED') return rfq.quotationIds && rfq.quotationIds.length > 0;
    if (activeFilter === 'AWARDED') return rfq.status === 'PO_ISSUED';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>SUPPLIER BIDDING DESK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              RFQ Invitations &amp; Open Requirements
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Review buyer material schedules matching your product categories and submit competitive itemized quotations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/supplier/catalogue"
              className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#536B88] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>Manage Catalogue</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#414957] pb-4">
          {[
            { id: 'ALL', label: 'All Matching RFQs', count: rfqs.length },
            { id: 'OPEN', label: 'Awaiting Quotes', count: rfqs.filter((r) => r.status === 'OPEN' || r.status === 'SUPPLIERS_INVITED').length },
            { id: 'QUOTED', label: 'Quotation Submitted', count: rfqs.filter((r) => (r.quotationIds?.length || 0) > 0).length },
            { id: 'AWARDED', label: 'Awarded to PO', count: rfqs.filter((r) => r.status === 'PO_ISSUED').length },
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

        {/* RFQ List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#A8ADB7] bg-[#303746] border border-[#414957] rounded-sm">
            Loading matching RFQs...
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#303746] border border-[#414957] p-8 rounded-sm">
            <FileSpreadsheet className="w-10 h-10 text-[#414957] mx-auto" />
            <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">
              No Matching Requirements Found
            </h3>
            <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
              {activeFilter === 'ALL'
                ? 'No active buyer requirements in your product categories at this moment. Ensure your product catalogue categories are updated.'
                : `No requirements matching the "${activeFilter}" filter.`}
            </p>
            <Link
              href="/supplier/catalogue"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#536B88] hover:bg-[#637d9e] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <span>Update Product Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRfqs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-[#303746] border border-[#414957] p-6 hover:border-[#536B88] transition-colors rounded-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#414957]/60 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#536B88] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                      {rfq.referenceCode}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#191B20] text-[#A8ADB7] border border-[#414957] rounded-sm">
                      {rfq.urgency} Urgency
                    </span>
                    <span className="text-xs text-[#A8ADB7] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C66A42]" />
                      <span>{rfq.delivery?.city || 'Gujarat'} &bull; {rfq.delivery?.vehicleAccessibility || 'Standard Access'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-[#A8ADB7]">
                    {rfq.requiredDeliveryDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Deliver by: {new Date(rfq.requiredDeliveryDate).toLocaleDateString('en-IN')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-heading font-black text-lg text-[#FFFFFF]">
                      {rfq.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {rfq.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-[#252B38] border border-[#414957] font-mono text-[11px] text-[#F1F2F4] rounded-sm"
                        >
                          <strong className="text-[#FFFFFF]">{it.materialName}</strong>: {it.quantity} {it.unit}
                          {it.gradeOrSpec && <span className="text-[#A8ADB7]"> ({it.gradeOrSpec})</span>}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

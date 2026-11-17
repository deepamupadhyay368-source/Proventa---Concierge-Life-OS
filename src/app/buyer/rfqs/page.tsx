'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  PlusCircle,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { ConstructionRfq } from '@/lib/procurement/types';

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<ConstructionRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/procurement/rfqs?buyerId=all');
        const json = await res.json();
        if (json.success) {
          setRfqs(json.data || []);
        }
      } catch (err) {
        console.error('Error loading RFQs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRfqs = rfqs.filter((rfq) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'OPEN') return rfq.status === 'OPEN' || rfq.status === 'SUPPLIERS_INVITED';
    if (activeFilter === 'QUOTES') return rfq.status === 'QUOTATIONS_RECEIVED' || (rfq.quotationIds && rfq.quotationIds.length > 0);
    if (activeFilter === 'PO_ISSUED') return rfq.status === 'PO_ISSUED';
    if (activeFilter === 'FULFILLED') return rfq.status === 'FULFILLED';
    if (activeFilter === 'CANCELLED') return rfq.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status: string, quotesCount: number) => {
    switch (status) {
      case 'OPEN':
      case 'SUPPLIERS_INVITED':
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-[#191B20] border border-[#536B88]/40 text-[#536B88] rounded-sm uppercase tracking-wider font-bold">
            {quotesCount > 0 ? `${quotesCount} Quotes Received` : 'Awaiting Quotations'}
          </span>
        );
      case 'QUOTATIONS_RECEIVED':
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-400 rounded-sm uppercase tracking-wider font-bold">
            Ready to Compare ({quotesCount})
          </span>
        );
      case 'PO_ISSUED':
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-sm uppercase tracking-wider font-bold">
            PO Issued
          </span>
        );
      case 'FULFILLED':
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-blue-950/60 border border-blue-500/40 text-blue-400 rounded-sm uppercase tracking-wider font-bold">
            Fulfilled
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-red-950/60 border border-red-500/40 text-red-400 rounded-sm uppercase tracking-wider font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="font-mono text-[11px] px-2.5 py-1 bg-[#191B20] text-[#A8ADB7] rounded-sm uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>MATERIAL PROCUREMENT SCHEDULES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Material Requirements &amp; RFQs
            </h1>
            <p className="text-xs text-[#A8ADB7]">
              Manage procurement requisitions, review incoming supplier bids, and compare landed costs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rfq/new"
              className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Requirement</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#414957] pb-4">
          {[
            { id: 'ALL', label: 'All RFQs', count: rfqs.length },
            { id: 'OPEN', label: 'Open', count: rfqs.filter((r) => r.status === 'OPEN' || r.status === 'SUPPLIERS_INVITED').length },
            { id: 'QUOTES', label: 'Quotations Received', count: rfqs.filter((r) => (r.quotationIds?.length || 0) > 0).length },
            { id: 'PO_ISSUED', label: 'PO Issued', count: rfqs.filter((r) => r.status === 'PO_ISSUED').length },
            { id: 'FULFILLED', label: 'Fulfilled', count: rfqs.filter((r) => r.status === 'FULFILLED').length },
            { id: 'CANCELLED', label: 'Cancelled', count: rfqs.filter((r) => r.status === 'CANCELLED').length },
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
            Loading procurement requirements...
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#303746] border border-[#414957] p-8 rounded-sm">
            <FileSpreadsheet className="w-10 h-10 text-[#414957] mx-auto" />
            <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">
              No Requirements Found
            </h3>
            <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
              {activeFilter === 'ALL'
                ? 'You have not created any material requirements yet. Create your first RFQ to invite verified suppliers.'
                : `No requirements matching the "${activeFilter}" filter.`}
            </p>
            <Link
              href="/rfq/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First RFQ</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRfqs.map((rfq) => {
              const quoteCount = rfq.quotationIds?.length || 0;
              return (
                <div
                  key={rfq.id}
                  className="bg-[#303746] border border-[#414957] p-6 hover:border-[#536B88] transition-colors rounded-sm space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#414957]/60 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                        {rfq.referenceCode}
                      </span>
                      {getStatusBadge(rfq.status, quoteCount)}
                      <span className="text-xs text-[#A8ADB7] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C66A42]" />
                        <span>{rfq.delivery?.siteName || rfq.delivery?.city || 'Project Site'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#A8ADB7]">
                      {rfq.requiredDeliveryDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Required: {new Date(rfq.requiredDeliveryDate).toLocaleDateString('en-IN')}</span>
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
                            {it.gradeOrSpec && <span className="text-[#A8ADB7]"> &bull; {it.gradeOrSpec}</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#414957]">
                      {quoteCount > 0 ? (
                        <Link
                          href={`/buyer/rfqs/${rfq.id}/compare`}
                          className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
                        >
                          <span>Compare {quoteCount} Quotes</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/buyer/rfqs/${rfq.id}/compare`}
                          className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-[#A8ADB7] hover:text-[#FFFFFF] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 rounded-sm"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
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

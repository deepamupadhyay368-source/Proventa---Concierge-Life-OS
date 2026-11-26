'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Clock,
  Lock,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface ValuationItem {
  id: string;
  referenceNo: string;
  locality: string;
  projectName?: string;
  address: string;
  bhk: number;
  carpetAreaSqFt: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  reportUrl: string;
  estimatedMidpointLakhs?: number;
  estimatedRange?: string;
  confidenceScore?: number;
  confidenceLevel?: string;
  downloadCount: number;
}

export default function SavedReportsPage() {
  const [valuations, setValuations] = useState<ValuationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadValuations() {
      try {
        const res = await fetch('/api/customer/valuations');
        const json = await res.json();
        if (json.success && json.items) {
          setValuations(json.items);
        }
      } catch (err) {
        console.error('Failed to load valuations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadValuations();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8C4BA] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            PROVENTA PRICE &bull; Research & Valuation Vault
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C]">
            Purchased Property Valuation Reports
          </h1>
        </div>

        <Link
          href="/price"
          className="h-10 px-5 bg-[#202B3C] text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#202B3C]/90 shadow-xs"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>New Property Valuation</span>
        </Link>
      </div>

      {/* Valuations Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#547568]" />
          <span>My Valuation Dossiers ({valuations.length})</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center bg-white border border-[#C8C4BA] font-mono text-xs text-[#69717B] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#547568]" />
            <span>Loading Vault Records...</span>
          </div>
        ) : valuations.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#C8C4BA] space-y-3">
            <Building2 className="w-8 h-8 text-[#C8C4BA] mx-auto" />
            <h3 className="font-editorial text-base font-bold text-[#202B3C]">No Active Property Valuations</h3>
            <p className="text-xs text-[#69717B] max-w-md mx-auto">
              You haven&apos;t commissioned any property valuations yet. Submit property details to receive an evidence-backed market range based on registered deed instruments.
            </p>
            <Link
              href="/price"
              className="inline-block mt-2 h-9 px-4 bg-[#547568] text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#547568]/90"
            >
              Evaluate a Property Now (₹999)
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#C8C4BA] divide-y divide-[#E2DFD8]">
            {valuations.map((v) => (
              <div
                key={v.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F3ED]/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="font-bold text-[#202B3C]">{v.referenceNo}</span>
                    <span className="text-[#C8C4BA]">&bull;</span>
                    <span className="text-[#69717B]">{new Date(v.createdAt).toLocaleDateString('en-IN')}</span>
                    <span className="text-[#C8C4BA]">&bull;</span>
                    <span
                      className={`px-1.5 py-0.5 uppercase tracking-wider font-bold ${
                        v.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <h3 className="font-editorial text-base font-bold text-[#202B3C]">
                    {v.bhk} BHK {v.projectName ? `${v.projectName}, ` : ''}{v.locality} ({v.carpetAreaSqFt} Sq.Ft)
                  </h3>

                  <p className="text-xs text-[#69717B] font-sans truncate max-w-xl">
                    {v.address}
                  </p>

                  {v.estimatedRange && (
                    <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                      <span className="text-[#547568] font-bold">Valuation: {v.estimatedRange}</span>
                      <span className="text-[#69717B]">(Midpoint: ₹{v.estimatedMidpointLakhs}L)</span>
                      <span className="text-[#69717B]">Confidence: {v.confidenceLevel}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <Link
                    href={v.reportUrl}
                    className={`h-9 px-4 text-xs font-mono uppercase tracking-wider font-bold inline-flex items-center gap-1.5 ${
                      v.status === 'COMPLETED'
                        ? 'bg-[#202B3C] text-white hover:bg-[#202B3C]/90'
                        : 'bg-[#547568] text-white hover:bg-[#547568]/90'
                    }`}
                  >
                    <span>{v.status === 'COMPLETED' ? 'View Report' : 'Complete Purchase'}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

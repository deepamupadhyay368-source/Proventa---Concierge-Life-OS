'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

export default function AdminValuationsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/valuations');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch admin data');
      setData(json);
      if (json.pricingConfigs?.[0]) {
        setNewPrice(json.pricingConfigs[0].priceRupees.toString());
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePrice = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PRICE',
          newPriceRupees: newPrice,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update price');
      setEditingPrice(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReview = async (requestId: string) => {
    if (!confirm('Approve manual valuation review for this property?')) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_MANUAL_REVIEW',
          requestId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to approve');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (requestId: string) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PROCESS_REFUND',
          requestId,
          refundReason: reason,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to refund');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#69717B] flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#547568]" />
        <span>Loading Administrative Operations...</span>
      </div>
    );
  }

  const { requests = [], stats = {}, pricingConfigs = [], methodology } = data || {};
  const currentPricing = pricingConfigs[0] || { priceRupees: 999 };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
            PROVENTA Operations &bull; Valuation Desk
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C]">
            Valuation Engine & Requests Console
          </h1>
          <p className="text-xs text-[#69717B] mt-1">
            Real-time audit trail of client valuation requests, payment capture verification, evidence ledger matches, and pricing controls.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="h-9 px-4 border border-[#C8C4BA] text-xs font-mono uppercase tracking-wider text-[#202B3C] hover:bg-[#F5F3ED] flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] uppercase text-[#69717B] block">Total Valuation Requests</span>
          <span className="font-editorial text-2xl font-bold text-[#202B3C] mt-1 block">
            {stats.totalRequests || 0}
          </span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] uppercase text-[#69717B] block">Paid / Captured</span>
          <span className="font-editorial text-2xl font-bold text-[#547568] mt-1 block">
            {stats.paidRequests || 0}
          </span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] uppercase text-[#69717B] block">Manual Review Queue</span>
          <span className="font-editorial text-2xl font-bold text-amber-700 mt-1 block">
            {stats.manualReviewQueue || 0}
          </span>
        </div>

        <div className="p-4 bg-white border border-[#C8C4BA]">
          <span className="text-[10px] uppercase text-[#69717B] block">Registered Deeds Indexed</span>
          <span className="font-editorial text-2xl font-bold text-[#202B3C] mt-1 block">
            {stats.totalTransactions || 0}
          </span>
        </div>
      </div>

      {/* Central Pricing Control Panel */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-4">
        <div className="border-b border-[#E2DFD8] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#547568]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C]">
              Centrally Configured Report Pricing
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#547568] font-bold">Database Backed</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div>
            <span className="text-[#69717B] block text-[10px] uppercase">Plan Specification</span>
            <span className="font-bold text-[#202B3C] text-sm">{currentPricing.name || 'RESIDENTIAL_STANDARD'}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-[#69717B] text-xs">Official Price:</span>
              {editingPrice ? (
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-24 h-8 px-2 border border-[#202B3C] font-bold text-sm"
                />
              ) : (
                <span className="font-editorial text-2xl font-bold text-[#202B3C]">
                  ₹{currentPricing.priceRupees}
                </span>
              )}
            </div>

            {editingPrice ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdatePrice}
                  disabled={actionLoading}
                  className="h-8 px-3 bg-[#547568] text-white text-[11px] font-bold uppercase hover:bg-[#547568]/90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPrice(false)}
                  className="h-8 px-3 border border-[#C8C4BA] text-[11px] uppercase hover:bg-[#F5F3ED]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingPrice(true)}
                className="h-8 px-3 border border-[#C8C4BA] text-[11px] uppercase text-[#202B3C] hover:bg-[#F5F3ED]"
              >
                Edit Price
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Valuation Requests Table */}
      <div className="bg-white border border-[#C8C4BA] space-y-4 p-6">
        <div className="border-b border-[#E2DFD8] pb-3 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#547568]" />
            <span>Valuation Requests Ledger</span>
          </h2>
          <span className="text-[10px] font-mono text-[#69717B]">Showing latest 50 submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] text-[10px] uppercase">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Client</th>
                <th className="p-3">Property</th>
                <th className="p-3">Carpet Area</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Derived Midpoint</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DFD8]">
              {requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3 font-bold text-[#202B3C]">{req.referenceNo}</td>
                  <td className="p-3 text-[#69717B] font-sans">
                    <span className="block text-[#202B3C] font-medium">{req.user?.name || 'Client'}</span>
                    <span className="text-[10px] text-[#69717B]">{req.user?.email}</span>
                  </td>
                  <td className="p-3 font-sans">
                    <span className="text-[#202B3C] font-medium block">
                      {req.bhk} BHK &bull; {req.locality?.name}
                    </span>
                    <span className="text-[10px] text-[#69717B] truncate block max-w-xs">{req.address}</span>
                  </td>
                  <td className="p-3 font-bold">{req.carpetAreaSqFt} sq.ft</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'MANUAL_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : req.status === 'PAID'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        req.payment?.status === 'CAPTURED' ? 'text-[#547568]' : 'text-[#69717B]'
                      }`}
                    >
                      {req.payment?.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-[#202B3C]">
                    {req.valuation?.estimatedMidpointLakhs ? `₹${req.valuation.estimatedMidpointLakhs}L` : '—'}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {req.status === 'COMPLETED' ? (
                      <Link
                        href={`/price/report/${req.id}`}
                        target="_blank"
                        className="inline-block px-2.5 py-1 bg-[#202B3C] text-white text-[10px] uppercase hover:bg-[#202B3C]/90"
                      >
                        Inspect
                      </Link>
                    ) : (
                      <Link
                        href={`/price/preview/${req.id}`}
                        target="_blank"
                        className="inline-block px-2.5 py-1 border border-[#C8C4BA] text-[10px] uppercase hover:bg-[#F5F3ED]"
                      >
                        Preview
                      </Link>
                    )}

                    {req.status === 'MANUAL_REVIEW' && (
                      <button
                        onClick={() => handleApproveReview(req.id)}
                        disabled={actionLoading}
                        className="px-2 py-1 bg-emerald-700 text-white text-[10px] uppercase font-bold"
                      >
                        Approve
                      </button>
                    )}

                    {req.payment?.status === 'CAPTURED' && (
                      <button
                        onClick={() => handleRefund(req.id)}
                        disabled={actionLoading}
                        className="px-2 py-1 border border-red-300 text-red-700 text-[10px] uppercase hover:bg-red-50"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

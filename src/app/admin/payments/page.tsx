'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Search, 
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  amountRupees: number;
  currency: string;
  status: string;
  method: string;
  providerRef: string | null;
  providerOrderId: string | null;
  idempotencyKey: string;
  refundStatus: string | null;
  refundAmount: number | null;
  refundRef: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  task?: {
    id: string;
    publicId: string;
    intent: string;
    category: string;
    status: string;
    vendorName: string | null;
  } | null;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState({
    totalCapturedVolumeRupees: 0,
    totalRefundVolumeRupees: 0,
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refundModal, setRefundModal] = useState<{ open: boolean; payment: PaymentItem | null; amount: number; reason: string }>({
    open: false,
    payment: null,
    amount: 0,
    reason: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      });

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleProcessRefund = async () => {
    if (!refundModal.payment) return;
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await fetch(`/api/admin/payments/${refundModal.payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaise: refundModal.amount * 100,
          reason: refundModal.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: `Refund of ₹${refundModal.amount.toLocaleString('en-IN')} processed successfully.` });
        setRefundModal({ open: false, payment: null, amount: 0, reason: '' });
        fetchPayments();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Refund failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Refund error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-100 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Console
            </span>
            <span className="text-xs text-slate-400">Payment &amp; Reconciliation Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Payment Management Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction settlement, UPI Autopay mandate tracking, and authoritative refund processing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Captured Volume</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ₹{stats.totalCapturedVolumeRupees.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Settled across customer tasks</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Refunds Processed</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            ₹{stats.totalRefundVolumeRupees.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Returned to source accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-[11px] font-mono uppercase text-slate-400">Security Architecture</div>
          <div className="text-sm font-semibold text-amber-300 flex items-center gap-1.5 mt-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Custodial Storage</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">No UPI PIN / CVV / Card Numbers Persisted</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Payment ID, customer name, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CAPTURED">Captured</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading payment ledger...</div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No payment records found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-medium">Payment Ref</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Task Intent</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 pr-3">
                      <div className="font-mono text-white font-semibold">
                        {p.providerRef || p.id.slice(0, 16)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    <td className="py-3.5 pr-3">
                      <div className="font-medium text-white">{p.customer?.name || 'Anonymous'}</div>
                      <div className="text-[11px] text-slate-400">{p.customer?.email}</div>
                    </td>

                    <td className="py-3.5 pr-3">
                      <div className="truncate max-w-[200px] text-slate-200">
                        {p.task?.intent || 'One-time Concierge Service'}
                      </div>
                      {p.task && (
                        <Link
                          href={`/tasks/${p.task.id}`}
                          className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>{p.task.publicId}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </td>

                    <td className="py-3.5 pr-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {p.method}
                      </span>
                    </td>

                    <td className="py-3.5 pr-3 font-mono font-bold text-white">
                      ₹{p.amountRupees.toLocaleString('en-IN')}
                      {p.refundStatus === 'COMPLETED' && (
                        <div className="text-[10px] text-rose-400 font-normal">
                          Refunded ₹{p.refundAmount?.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          p.status === 'CAPTURED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.status === 'REFUNDED'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : p.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5">
                      {p.status === 'CAPTURED' && p.refundStatus !== 'COMPLETED' ? (
                        <button
                          onClick={() =>
                            setRefundModal({
                              open: true,
                              payment: p,
                              amount: p.amountRupees,
                              reason: '',
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-800/40 text-[11px] font-medium transition"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal.open && refundModal.payment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-serif font-semibold">
                <RotateCcw className="h-5 w-5" />
                <span>Issue Payment Refund</span>
              </div>
              <button
                onClick={() => setRefundModal({ open: false, payment: null, amount: 0, reason: '' })}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Process authoritative refund to customer account. This will record in audit logs and update task state.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundModal.amount}
                  onChange={(e) => setRefundModal({ ...refundModal, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  max={refundModal.payment.amountRupees}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">Reason for Refund</label>
                <input
                  type="text"
                  value={refundModal.reason}
                  onChange={(e) => setRefundModal({ ...refundModal, reason: e.target.value })}
                  placeholder="e.g. Venue cancellation, Member request"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRefundModal({ open: false, payment: null, amount: 0, reason: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={actionLoading || refundModal.amount <= 0}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50 transition"
              >
                {actionLoading ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

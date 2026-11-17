'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingDown,
  Building2,
  Calendar,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { CommercialInvoiceDto, LedgerFinancialSummary } from '@/lib/payment-intelligence/types';

export default function BuyerPaymentsPage() {
  const [invoices, setInvoices] = useState<CommercialInvoiceDto[]>([]);
  const [summary, setSummary] = useState<LedgerFinancialSummary | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; invoiceId: string; invoiceNumber: string; outstanding: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const profRes = await fetch('/api/business/profile');
        if (profRes.ok) {
          const profJson = await profRes.json();
          const biz = profJson.data?.business;
          if (biz?.id) {
            setBusinessId(biz.id);
            const [invRes, sumRes] = await Promise.all([
              fetch(`/api/payment-intelligence/invoices?buyerBusinessId=${encodeURIComponent(biz.id)}`),
              fetch(`/api/payment-intelligence/summary?buyerBusinessId=${encodeURIComponent(biz.id)}`),
            ]);
            const invJson = await invRes.json();
            const sumJson = await sumRes.json();
            if (invJson.success) setInvoices(invJson.data || []);
            if (sumJson.success) setSummary(sumJson.data);
          }
        }
      } catch (err) {
        console.error('Error loading payment intelligence data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatINR = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'OVERDUE') return inv.countdown.isOverdue;
    if (activeFilter === 'DUE_SOON')
      return !inv.countdown.isOverdue && inv.countdown.daysRemaining <= 7 && inv.status !== 'PAID';
    if (activeFilter === 'DISPUTED') return inv.isDisputed;
    if (activeFilter === 'PAID') return inv.status === 'PAID';
    return true;
  });

  const getUrgencyBadge = (countdown: CommercialInvoiceDto['countdown']) => {
    if (countdown.isOverdue) {
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 border border-red-500/40 bg-red-950/60 text-red-400 font-bold uppercase rounded-sm">
          {countdown.displayStatus}
        </span>
      );
    }
    if (countdown.isDueToday) {
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 border border-amber-500/40 bg-amber-950/60 text-amber-400 font-bold uppercase rounded-sm">
          Payment Due Today
        </span>
      );
    }
    if (countdown.urgencyLevel === 'HIGH') {
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 border border-yellow-500/40 bg-yellow-950/60 text-yellow-400 font-bold uppercase rounded-sm">
          {countdown.displayStatus}
        </span>
      );
    }
    if (countdown.urgencyLevel === 'SETTLED') {
      return (
        <span className="font-mono text-[11px] px-2.5 py-0.5 border border-emerald-500/40 bg-emerald-950/60 text-emerald-400 font-bold uppercase rounded-sm">
          Fully Paid
        </span>
      );
    }
    return (
      <span className="font-mono text-[11px] px-2.5 py-0.5 border border-[#414957] bg-[#191B20] text-[#536B88] font-bold uppercase rounded-sm">
        {countdown.displayStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C66A42] uppercase tracking-wider font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>PROVENTA PAYMENT INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Invoice Ledger &amp; Payment Tracking
            </h1>
            <p className="text-xs text-[#A8ADB7] font-mono">
              PAYMENT BEHAVIOUR. MADE VISIBLE. Track contractual countdowns and record bank UTR settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/buyer/orders"
              className="px-4 py-2 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-[#FFFFFF] font-bold text-xs font-mono uppercase tracking-wider transition-colors rounded-sm"
            >
              <span>View Purchase Orders</span>
            </Link>
          </div>
        </div>

        {/* 4 Financial Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#303746] border border-[#414957] h-24 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-[#A8ADB7] uppercase">Total Payable</div>
              <div className="text-2xl font-black font-mono text-[#FFFFFF]">
                {summary ? formatINR(summary.totalOutstandingAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Outstanding balance across POs</div>
            </div>

            <div className="bg-[#303746] border border-red-500/30 p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-red-400 uppercase">Overdue Amount</div>
              <div className="text-2xl font-black font-mono text-red-400">
                {summary ? formatINR(summary.overdueAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">
                {summary?.overdueInvoicesCount || 0} overdue invoices
              </div>
            </div>

            <div className="bg-[#303746] border border-amber-500/30 p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-amber-400 uppercase">Due in 7 Days</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {summary ? formatINR(summary.dueWithin7DaysAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Upcoming contractual obligations</div>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-[#536B88] uppercase">Invoices Settled</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {summary?.paidInvoicesCount || 0} / {summary?.totalInvoicesCount || 0}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Fully cleared commercial records</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-[#414957] pb-3">
          {[
            { id: 'ALL', label: 'All Invoices', count: invoices.length },
            { id: 'OVERDUE', label: 'Overdue', count: invoices.filter((i) => i.countdown.isOverdue).length },
            { id: 'DUE_SOON', label: 'Due This Week', count: invoices.filter((i) => !i.countdown.isOverdue && i.countdown.daysRemaining <= 7 && i.status !== 'PAID').length },
            { id: 'DISPUTED', label: 'Disputed', count: invoices.filter((i) => i.isDisputed).length },
            { id: 'PAID', label: 'Paid', count: invoices.filter((i) => i.status === 'PAID').length },
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
              <span className="text-[10px] px-1.5 py-0.2 bg-[#191B20]/60 rounded-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#A8ADB7] bg-[#303746] border border-[#414957] rounded-sm">
            Loading commercial invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#303746] border border-[#414957] p-8 rounded-sm">
            <FileText className="w-10 h-10 text-[#414957] mx-auto" />
            <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">No Invoices Found</h3>
            <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
              {activeFilter === 'ALL'
                ? 'No commercial invoices have been issued against your purchase orders yet.'
                : `No invoices matching the "${activeFilter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-[#303746] border border-[#414957] p-6 hover:border-[#536B88] transition-colors rounded-sm space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#414957]/60 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                      {inv.invoiceNumber}
                    </span>
                    {getUrgencyBadge(inv.countdown)}
                    {inv.isDisputed && (
                      <span className="font-mono text-[11px] px-2 py-0.5 border border-amber-500/40 bg-amber-950/60 text-amber-400 rounded-sm font-bold">
                        DISPUTED — NOT IN DEFAULT
                      </span>
                    )}
                    <span className="text-xs text-[#A8ADB7]">
                      Supplier: <strong className="text-[#FFFFFF]">{inv.supplierBusinessName}</strong>
                    </span>
                    {inv.purchaseOrderId && (
                      <span className="text-[11px] font-mono text-[#536B88]">
                        PO Ref: {inv.purchaseOrderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#A8ADB7]">
                    <span>Issued: {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</span>
                    <span>Due: {new Date(inv.contractualDueDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div>
                        Total Invoiced: <strong className="text-[#FFFFFF]">{formatINR(inv.totalAmount)}</strong>
                      </div>
                      <div className="text-emerald-400">
                        Paid: <strong>{formatINR(inv.paidAmount)}</strong>
                      </div>
                      <div className="text-[#C66A42]">
                        Outstanding: <strong>{formatINR(inv.outstandingAmount)}</strong>
                      </div>
                    </div>

                    <div className="w-full bg-[#191B20] h-1.5 rounded-full overflow-hidden mt-2 max-w-md">
                      <div
                        className="bg-[#4A7C59] h-full"
                        style={{
                          width: `${Math.min(100, Math.round((inv.paidAmount / (inv.totalAmount || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                      <button
                        onClick={() =>
                          setPaymentModal({
                            open: true,
                            invoiceId: inv.id,
                            invoiceNumber: inv.invoiceNumber,
                            outstanding: inv.outstandingAmount,
                          })
                        }
                        className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Record Payment Modal */}
        {paymentModal?.open && (
          <RecordPaymentModal
            invoiceId={paymentModal.invoiceId}
            invoiceNumber={paymentModal.invoiceNumber}
            outstanding={paymentModal.outstanding}
            onClose={() => setPaymentModal(null)}
            onSuccess={() => {
              setPaymentModal(null);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}

function RecordPaymentModal({
  invoiceId,
  invoiceNumber,
  outstanding,
  onClose,
  onSuccess,
}: {
  invoiceId: string;
  invoiceNumber: string;
  outstanding: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(outstanding.toString());
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('RTGS');
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/payment-intelligence/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          paymentDate,
          paymentMethod: method,
          utrNumber: utrNumber || undefined,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
      } else {
        setError(json.error || 'Failed to record payment');
      }
    } catch {
      setError('Network communication failure. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#191B20]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#303746] border border-[#414957] rounded-sm p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#414957] pb-3">
          <div>
            <h3 className="font-heading font-black text-lg text-[#FFFFFF] uppercase">Record Bank Settlement</h3>
            <p className="text-xs text-[#A8ADB7] font-mono">{invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="text-[#A8ADB7] hover:text-[#FFFFFF] text-xl leading-none">
            &times;
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/60 border border-red-500/40 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#A8ADB7] uppercase">Amount Settled (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-sm text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
            />
            <div className="text-[10px] text-[#A8ADB7] font-mono">
              Outstanding obligation: ₹{outstanding.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Channel</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
              >
                <option value="RTGS">RTGS (Large value)</option>
                <option value="NEFT">NEFT</option>
                <option value="IMPS">IMPS</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">Cheque</option>
                <option value="BANK_TRANSFER">Direct Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#A8ADB7] uppercase">Bank UTR / Transaction Ref</label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
              placeholder="e.g. HDFCR52026111700912"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#A8ADB7] uppercase">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm resize-none"
              placeholder="Settlement reference or batch notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#414957] text-[#A8ADB7] hover:text-[#F1F2F4] rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-sm transition-colors disabled:opacity-60"
            >
              {submitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

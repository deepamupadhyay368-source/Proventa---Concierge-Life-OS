'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { CommercialInvoiceDto, LedgerFinancialSummary } from '@/lib/payment-intelligence/types';

export default function SupplierPaymentsPage() {
  const [invoices, setInvoices] = useState<CommercialInvoiceDto[]>([]);
  const [summary, setSummary] = useState<LedgerFinancialSummary | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [createInvoiceModal, setCreateInvoiceModal] = useState(false);

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
              fetch(`/api/payment-intelligence/invoices?supplierBusinessId=${encodeURIComponent(biz.id)}`),
              fetch(`/api/payment-intelligence/summary?supplierBusinessId=${encodeURIComponent(biz.id)}`),
            ]);
            const invJson = await invRes.json();
            const sumJson = await sumRes.json();
            if (invJson.success) setInvoices(invJson.data || []);
            if (sumJson.success) setSummary(sumJson.data);
          }
        }
      } catch (err) {
        console.error('Error loading supplier payment intelligence data:', err);
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

  const handleVerify = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/payment-intelligence/invoices/${invoiceId}/verify`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        alert(json.error || 'Failed to verify invoice');
      }
    } catch {
      alert('Network error while verifying');
    }
  };

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[#414957] pb-6 bg-[#303746] p-6 sm:p-8 border shadow-sm rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] uppercase tracking-wider font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>SUPPLIER RECEIVABLES &bull; PAYMENT INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Invoices &amp; Receivables Ledger
            </h1>
            <p className="text-xs text-[#A8ADB7] font-mono">
              PAYMENT BEHAVIOUR. MADE VISIBLE. Issue commercial invoices, monitor payment terms, and confirm receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateInvoiceModal(true)}
              className="px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue New Invoice</span>
            </button>
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
              <div className="text-xs font-mono text-[#A8ADB7] uppercase">Total Receivable</div>
              <div className="text-2xl font-black font-mono text-[#FFFFFF]">
                {summary ? formatINR(summary.totalOutstandingAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Pending buyer payments</div>
            </div>

            <div className="bg-[#303746] border border-red-500/30 p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-red-400 uppercase">Overdue Receivables</div>
              <div className="text-2xl font-black font-mono text-red-400">
                {summary ? formatINR(summary.overdueAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">
                {summary?.overdueInvoicesCount || 0} invoices past contractual due date
              </div>
            </div>

            <div className="bg-[#303746] border border-amber-500/30 p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-amber-400 uppercase">Due in 7 Days</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {summary ? formatINR(summary.dueWithin7DaysAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Contractual settlements expected</div>
            </div>

            <div className="bg-[#303746] border border-[#414957] p-5 rounded-sm space-y-2 shadow-sm">
              <div className="text-xs font-mono text-[#4A7C59] uppercase">Cleared Funds</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {summary ? formatINR(summary.totalPaidAmount) : '₹0.00'}
              </div>
              <div className="text-[11px] text-[#A8ADB7]">Verified bank settlements</div>
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
            { id: 'PAID', label: 'Settled', count: invoices.filter((i) => i.status === 'PAID').length },
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

        {/* Invoices List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#A8ADB7] bg-[#303746] border border-[#414957] rounded-sm">
            Loading receivables ledger...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-[#303746] border border-[#414957] p-8 rounded-sm">
            <FileText className="w-10 h-10 text-[#414957] mx-auto" />
            <h3 className="font-heading font-black text-lg uppercase text-[#FFFFFF]">No Invoices Found</h3>
            <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
              Issue commercial invoices linked to active Purchase Orders to begin automated contractual countdowns.
            </p>
            <button
              onClick={() => setCreateInvoiceModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue First Invoice</span>
            </button>
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
                    <span
                      className={`font-mono text-[11px] px-2.5 py-0.5 border rounded-sm font-bold uppercase ${
                        inv.countdown.isOverdue
                          ? 'border-red-500/40 bg-red-950/60 text-red-400'
                          : inv.countdown.urgencyLevel === 'SETTLED'
                          ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-400'
                          : 'border-[#536B88]/40 bg-[#191B20] text-[#536B88]'
                      }`}
                    >
                      {inv.countdown.displayStatus}
                    </span>
                    <span className="text-xs text-[#A8ADB7]">
                      Billed to: <strong className="text-[#FFFFFF]">{inv.buyerBusinessName}</strong>
                    </span>
                    {inv.purchaseOrderId && (
                      <span className="text-[11px] font-mono text-[#536B88]">
                        PO Ref: {inv.purchaseOrderId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#A8ADB7]">
                    <span>Terms: {inv.paymentTerms.replace(/_/g, ' ')}</span>
                    <span>Due: {new Date(inv.contractualDueDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div>
                        Receivable Amount: <strong className="text-[#FFFFFF]">{formatINR(inv.totalAmount)}</strong>
                      </div>
                      <div className="text-emerald-400">
                        Received: <strong>{formatINR(inv.paidAmount)}</strong>
                      </div>
                      <div className="text-[#C66A42]">
                        Pending Balance: <strong>{formatINR(inv.outstandingAmount)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {inv.verificationStatus !== 'CONFIRMED_BY_COUNTERPARTY' && inv.paidAmount > 0 && (
                      <button
                        onClick={() => handleVerify(inv.id)}
                        className="px-4 py-2 bg-[#4A7C59] hover:bg-[#3d6649] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Invoice Modal */}
        {createInvoiceModal && (
          <CreateInvoiceModal
            supplierBusinessId={businessId}
            onClose={() => setCreateInvoiceModal(false)}
            onSuccess={() => {
              setCreateInvoiceModal(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateInvoiceModal({
  supplierBusinessId,
  onClose,
  onSuccess,
}: {
  supplierBusinessId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [buyerBusinessName, setBuyerBusinessName] = useState('');
  const [buyerBusinessId, setBuyerBusinessId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('NET_30');
  const [materialDescription, setMaterialDescription] = useState('Fe 550D TMT Steel Rebars');
  const [quantity, setQuantity] = useState('25');
  const [unit, setUnit] = useState('MT');
  const [unitRate, setUnitRate] = useState('52000');
  const [gstRate, setGstRate] = useState('18');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setError('Invoice number is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const qty = parseFloat(quantity) || 1;
    const rate = parseFloat(unitRate) || 0;
    const gst = parseFloat(gstRate) || 18;
    const lineTotal = qty * rate;
    const gstAmt = (lineTotal * gst) / 100;
    const grandTotal = lineTotal + gstAmt;

    try {
      const res = await fetch('/api/payment-intelligence/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invoiceNumber.trim(),
          purchaseOrderId: purchaseOrderId.trim() || undefined,
          buyerBusinessId: buyerBusinessId.trim() || 'business-buyer-default',
          buyerBusinessName: buyerBusinessName.trim() || 'Procurement Client',
          supplierBusinessId: supplierBusinessId || 'supplier-active-context',
          paymentTerms,
          paymentTermsDays: paymentTerms === 'NET_15' ? 15 : paymentTerms === 'NET_7' ? 7 : 30,
          items: [
            {
              id: 'item-1',
              description: materialDescription,
              quantity: qty,
              unit,
              unitRate: rate,
              gstRate: gst,
              gstAmount: gstAmt,
              total: grandTotal,
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
      } else {
        setError(json.error || 'Failed to create commercial invoice');
      }
    } catch {
      setError('Network communication failure. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#191B20]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#303746] border border-[#414957] rounded-sm p-6 w-full max-w-lg space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#414957] pb-3">
          <div>
            <h3 className="font-heading font-black text-lg text-[#FFFFFF] uppercase">Issue Commercial Invoice</h3>
            <p className="text-xs text-[#A8ADB7]">Record tax invoice against customer purchase order</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Invoice Number</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
                placeholder="e.g. INV-2026-092"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">PO Reference (Optional)</label>
              <input
                type="text"
                value={purchaseOrderId}
                onChange={(e) => setPurchaseOrderId(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
                placeholder="e.g. PO-74912"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Buyer Company</label>
              <input
                type="text"
                required
                value={buyerBusinessName}
                onChange={(e) => setBuyerBusinessName(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
                placeholder="e.g. Adani Infra EPC"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
              >
                <option value="NET_7">NET 7 Days</option>
                <option value="NET_15">NET 15 Days</option>
                <option value="NET_30">NET 30 Days</option>
                <option value="NET_45">NET 45 Days</option>
                <option value="NET_60">NET 60 Days</option>
                <option value="IMMEDIATE">Immediate on Delivery</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#A8ADB7] uppercase">Material Description</label>
            <input
              type="text"
              required
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Quantity</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">Unit Rate (₹)</label>
              <input
                type="number"
                required
                value={unitRate}
                onChange={(e) => setUnitRate(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#A8ADB7] uppercase">GST (%)</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full bg-[#252B38] border border-[#414957] px-3 py-2 text-xs text-[#F1F2F4] focus:outline-none focus:border-[#536B88] rounded-sm"
              >
                <option value="18">18% (Standard)</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
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
              {submitting ? 'Issuing...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

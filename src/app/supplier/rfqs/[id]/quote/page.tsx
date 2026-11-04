'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  ChevronLeft,
} from 'lucide-react';
import type { ConstructionRfq } from '@/lib/procurement/types';

interface ItemQuoteInput {
  itemId: string;
  unitPrice: number;
  gstRatePercent: number;
  brandSupplied: string;
  technicalNotes: string;
}

export default function SupplierSubmitQuotePage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<ConstructionRfq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active supplier
  const supplierId = 'supp-gujarat-steel-cement';

  // Quotation inputs
  const [itemQuotes, setItemQuotes] = useState<ItemQuoteInput[]>([]);
  const [deliveryCharges, setDeliveryCharges] = useState<number>(15000);
  const [discountAmount, setDiscountAmount] = useState<number>(10000);
  const [promisedDate, setPromisedDate] = useState<string>('');
  const [validityDays, setValidityDays] = useState<number>(7);
  const [paymentTerms, setPaymentTerms] = useState<string>('20% Token Advance on PO, 80% RTGS against Site Delivery & Weighbridge Slip');
  const [supplierNotes, setSupplierNotes] = useState<string>('Dedicated 16-wheeler vehicle with GPS tracking. Test certificates included with dispatch.');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRfq() {
      try {
        const res = await fetch(`/api/procurement/rfqs/${rfqId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const r = json.data.rfq as ConstructionRfq;
          setRfq(r);
          // Set initial item quote rows
          setItemQuotes(
            r.items.map((it) => ({
              itemId: it.id,
              unitPrice: it.categorySlug === 'building-materials' && it.unit === 'Metric tonnes (MT)' ? 53000 : 340,
              gstRatePercent: it.categorySlug === 'building-materials' && it.unit === 'Bags' ? 28 : 18,
              brandSupplied: it.brandPreference || 'UltraTech / Tata Tiscon',
              technicalNotes: 'Direct stockyard supply with factory test certs',
            }))
          );
          setPromisedDate(r.requiredDeliveryDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]);
        } else {
          setError(json.error || 'Failed to load RFQ');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching requirement');
      } finally {
        setLoading(false);
      }
    }
    if (rfqId) fetchRfq();
  }, [rfqId]);

  const updateItemQuote = (idx: number, field: keyof ItemQuoteInput, val: any) => {
    setItemQuotes((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    itemQuotes.forEach((iq, idx) => {
      const qty = rfq?.items[idx]?.quantity || 1;
      const lineSubtotal = qty * (iq.unitPrice || 0);
      const lineGst = Math.round((lineSubtotal * (iq.gstRatePercent || 0)) / 100);
      subtotal += lineSubtotal;
      totalGst += lineGst;
    });

    const grandTotal = subtotal + totalGst + (Number(deliveryCharges) || 0) - (Number(discountAmount) || 0);
    return { subtotal, totalGst, grandTotal };
  };

  const { subtotal, totalGst, grandTotal } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfq) return;
    setSubmitting(true);

    try {
      const payload = {
        rfqId: rfq.id,
        supplierId,
        items: itemQuotes,
        deliveryCharges: Number(deliveryCharges) || 0,
        discountAmount: Number(discountAmount) || 0,
        promisedDeliveryDate: promisedDate,
        validityDays: Number(validityDays) || 7,
        paymentTerms,
        supplierNotes,
      };

      const res = await fetch('/api/procurement/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to submit quotation');
      }

      router.push('/supplier/dashboard?quoteSubmitted=true');
    } catch (err: any) {
      alert(err.message || 'Error submitting quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-3">
        <Scale className="w-8 h-8 text-[#536B88] animate-spin mx-auto" />
        <div className="font-mono text-xs text-[#A8ADB7]">Loading Buyer RFQ Specifications...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#D9534F] mx-auto" />
        <div className="text-lg font-bold text-[#FFFFFF]">Requirement Not Found</div>
        <p className="text-xs text-[#A8ADB7]">{error || 'Invalid RFQ Reference'}</p>
        <Link href="/supplier/dashboard" className="inline-block px-4 py-2 bg-[#303746] border border-[#414957] text-xs font-bold uppercase text-[#F1F2F4] rounded-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A8ADB7]">
          <Link href="/supplier/dashboard" className="hover:text-[#FFFFFF] flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Supplier Dashboard</span>
          </Link>
          <span>/</span>
          <span>Submit Quotation</span>
          <span>/</span>
          <span className="text-[#536B88] font-bold">{rfq.referenceCode}</span>
        </div>

        {/* Header Summary */}
        <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-4 shadow-sm rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-4">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-[#536B88] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                {rfq.referenceCode}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                Quotation Submission: {rfq.title}
              </h1>
              <div className="text-xs text-[#A8ADB7] font-mono">
                Site: {rfq.delivery?.addressLine}, {rfq.delivery?.city} ({rfq.delivery?.vehicleAccessibility})
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#A8ADB7]">Buyer Required Date</div>
              <div className="font-bold text-sm text-[#FFFFFF]">{rfq.requiredDeliveryDate}</div>
              <div className="text-xs text-[#536B88] font-semibold">{rfq.urgency} Urgency</div>
            </div>
          </div>
        </div>

        {/* Main Bidding Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Itemized Rates Table */}
          <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-6 shadow-sm rounded-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
              1. Itemized Rates & GST Calculation
            </h2>

            <div className="space-y-4">
              {rfq.items.map((it, idx) => {
                const iq = itemQuotes[idx] || { unitPrice: 0, gstRatePercent: 18, brandSupplied: '', technicalNotes: '' };
                const lineTotal = (it.quantity || 1) * (iq.unitPrice || 0);
                const lineGst = Math.round((lineTotal * (iq.gstRatePercent || 0)) / 100);

                return (
                  <div key={it.id || idx} className="p-4 bg-[#252B38] border border-[#414957] space-y-3 rounded-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#414957] pb-2 text-xs">
                      <div className="font-bold text-[#FFFFFF]">
                        {it.materialName} ({it.quantity} {it.unit})
                      </div>
                      <div className="font-mono text-[#536B88] font-bold">
                        Line Total: ₹{(lineTotal + lineGst).toLocaleString('en-IN')} (incl. GST)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                          Basic Unit Rate (₹/{it.unit}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={iq.unitPrice}
                          onChange={(e) => updateItemQuote(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 font-mono text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                          GST Rate (%)
                        </label>
                        <select
                          value={iq.gstRatePercent}
                          onChange={(e) => updateItemQuote(idx, 'gstRatePercent', Number(e.target.value))}
                          className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                        >
                          <option value={18}>18% (Steel, Hardware, Wire)</option>
                          <option value={28}>28% (Cement, Paints, Tiles)</option>
                          <option value={12}>12% (Standard Building Blocks)</option>
                          <option value={5}>5% (Sand / Blue Metal Aggregate)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                          Brand Supplied & Mill Specs
                        </label>
                        <input
                          type="text"
                          value={iq.brandSupplied}
                          onChange={(e) => updateItemQuote(idx, 'brandSupplied', e.target.value)}
                          placeholder="e.g. UltraTech 53G / Tata Tiscon Primary"
                          className="w-full bg-[#191B20] border border-[#414957] text-[#FFFFFF] px-2.5 py-2 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Freight & Commercial Terms */}
          <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-6 shadow-sm rounded-sm">
            <h2 className="font-heading font-bold text-base uppercase text-[#FFFFFF] border-b border-[#414957] pb-3">
              2. Freight, Delivery & Commercial Terms
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Delivery Freight (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharges}
                  onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3 py-2 font-mono focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Volume Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3 py-2 font-mono focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Promised Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3 py-2 font-mono focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3 py-2 focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-mono uppercase text-[#A8ADB7] mb-1 font-bold">
                  Supplier Notes & Vehicle Allocation
                </label>
                <textarea
                  rows={2}
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3 py-2 focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>
            </div>

            {/* Total Landed Cost Summary Box */}
            <div className="p-6 bg-[#191B20] border border-[#414957] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono rounded-sm">
              <div className="space-y-1 text-xs text-[#A8ADB7]">
                <div>Subtotal: ₹{subtotal.toLocaleString('en-IN')}</div>
                <div>GST: ₹{totalGst.toLocaleString('en-IN')}</div>
                <div>Freight: ₹{Number(deliveryCharges || 0).toLocaleString('en-IN')}</div>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase text-[#A8ADB7] font-bold">Total Landed Price</div>
                <div className="text-2xl sm:text-3xl font-black text-[#C66A42]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Link
              href="/supplier/dashboard"
              className="px-6 py-3 bg-[#252B38] border border-[#414957] hover:bg-[#191B20] text-[#F1F2F4] font-bold text-xs uppercase tracking-wider transition-colors rounded-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#C66A42] hover:bg-[#B35A33] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm rounded-sm"
            >
              <span>{submitting ? 'Submitting Quotation...' : 'Submit Binding Quotation to Buyer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

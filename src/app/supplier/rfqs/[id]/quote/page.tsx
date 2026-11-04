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
  Truck,
  Plus,
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

  // Calculations
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
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-3">
        <Scale className="w-8 h-8 text-[#F25C05] animate-spin mx-auto" />
        <div className="font-mono text-sm text-[#858D9B]">Loading Requirement Specifications...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <div className="text-lg font-bold text-white">Requirement Not Found</div>
        <p className="text-xs text-[#858D9B]">{error || 'Invalid RFQ Reference'}</p>
        <Link href="/supplier/dashboard" className="inline-block px-4 py-2 bg-[#171C26] border border-[#252C38] text-xs font-bold uppercase rounded-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#858D9B]">
          <Link href="/supplier/dashboard" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Supplier Dashboard</span>
          </Link>
          <span>/</span>
          <span>Submit Quotation</span>
          <span>/</span>
          <span className="text-[#F25C05]">{rfq.referenceCode}</span>
        </div>

        {/* RFQ Header Summary Card */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 lg:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#F25C05] px-2 py-0.5 bg-[#090B10] border border-[#252C38] rounded-xs">
                  {rfq.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#252C38] text-[#C5CAD3] rounded-xs">
                  {rfq.projectType}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
                {rfq.title}
              </h1>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#858D9B]">Site Delivery Target</div>
              <div className="text-sm font-bold text-white">{rfq.requiredDeliveryDate}</div>
              <div className="text-xs text-[#F25C05] font-semibold">{rfq.delivery?.addressLine}, {rfq.delivery?.city}</div>
            </div>
          </div>

          <div className="text-xs text-[#C5CAD3]">
            Site Vehicle Access: <strong className="text-white">{rfq.delivery?.vehicleAccessibility || '10-Wheeler Truck'}</strong>
            {rfq.specialInstructions && (
              <span className="ml-3 text-[#858D9B]">Instructions: {rfq.specialInstructions}</span>
            )}
          </div>
        </div>

        {/* Quotation Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Itemized Pricing Table */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <div className="border-b border-[#252C38] pb-3">
              <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white">
                1. Itemized Unit Rates & GST ({rfq.items.length} Items)
              </h2>
              <p className="text-xs text-[#858D9B]">
                Enter competitive unit prices in INR (excluding GST). GST is calculated automatically.
              </p>
            </div>

            <div className="space-y-4">
              {rfq.items.map((it, idx) => (
                <div
                  key={it.id}
                  className="bg-[#090B10] border border-[#252C38] p-4 rounded-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#252C38]">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-sm">{it.materialName}</div>
                      <div className="font-mono text-xs text-[#F25C05]">
                        Required Quantity: {it.quantity} {it.unit}
                      </div>
                    </div>
                    {it.gradeOrSpec && (
                      <div className="text-xs text-[#858D9B] font-mono">
                        Spec: {it.gradeOrSpec}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Unit Rate (₹ per {it.unit}) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={itemQuotes[idx]?.unitPrice || ''}
                        onChange={(e) => updateItemQuote(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#171C26] border border-[#252C38] text-white px-3 py-2 text-xs font-mono rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        GST Rate *
                      </label>
                      <select
                        value={itemQuotes[idx]?.gstRatePercent || 18}
                        onChange={(e) => updateItemQuote(idx, 'gstRatePercent', parseInt(e.target.value, 10))}
                        className="w-full bg-[#171C26] border border-[#252C38] text-white px-3 py-2 text-xs font-mono rounded-xs focus:outline-none focus:border-[#F25C05]"
                      >
                        <option value="18">18% (Steel, Hardware, Cables, Tiles)</option>
                        <option value="28">28% (Cement, Wall Putty, Chemicals)</option>
                        <option value="12">12% (Pipes, Certain Fittings)</option>
                        <option value="5">5% (Aggregates, Sand, Bricks)</option>
                        <option value="0">0% (Nil / Exempt)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Brand Supplied *
                      </label>
                      <input
                        type="text"
                        required
                        value={itemQuotes[idx]?.brandSupplied || ''}
                        onChange={(e) => updateItemQuote(idx, 'brandSupplied', e.target.value)}
                        placeholder="e.g. UltraTech 53G / Tata Tiscon"
                        className="w-full bg-[#171C26] border border-[#252C38] text-white px-3 py-2 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#858D9B] mb-1">
                        Line Total (incl. GST)
                      </label>
                      <div className="w-full bg-[#171C26] border border-[#252C38] text-emerald-400 px-3 py-2 text-xs font-mono rounded-xs">
                        ₹
                        {(
                          it.quantity *
                          (itemQuotes[idx]?.unitPrice || 0) *
                          (1 + (itemQuotes[idx]?.gstRatePercent || 0) / 100)
                        ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Freight, Delivery Timeline & Commercial Terms */}
          <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-5">
            <h2 className="font-heading font-black text-lg uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
              2. Freight, Delivery Date & Commercial Terms
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Transportation Freight & Handling Charges (₹)
                </label>
                <input
                  type="number"
                  value={deliveryCharges}
                  onChange={(e) => setDeliveryCharges(parseFloat(e.target.value) || 0)}
                  placeholder="15000"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm font-mono rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Special Project Discount (₹)
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm font-mono rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Guaranteed Site Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Quote Validity Period
                </label>
                <select
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value, 10))}
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                >
                  <option value="3">3 Days (Fast-Moving Commodity)</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days (Standard)</option>
                  <option value="14">14 Days</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Payment Milestones & Commercial Terms *
                </label>
                <input
                  type="text"
                  required
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. 20% Token Advance on PO, 80% against Site Weighbridge Slip"
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                  Supplier Notes & Vehicle Fleet Details
                </label>
                <input
                  type="text"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  placeholder="e.g. Dispatched from Odhav stockyard via 16-wheeler trailer. Test certs included."
                  className="w-full bg-[#090B10] border border-[#252C38] text-white px-4 py-2.5 text-sm rounded-xs focus:outline-none focus:border-[#F25C05]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Summary Card */}
          <div className="bg-[#090B10] border border-[#252C38] rounded-xs p-6 space-y-3">
            <div className="flex justify-between text-xs text-[#858D9B]">
              <span>Materials Subtotal:</span>
              <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-[#858D9B]">
              <span>Estimated GST Total:</span>
              <span className="font-mono text-white">₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-[#858D9B]">
              <span>Transportation Freight:</span>
              <span className="font-mono text-white">₹{Number(deliveryCharges).toLocaleString('en-IN')}</span>
            </div>
            {Number(discountAmount) > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono">-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#252C38] flex justify-between items-baseline">
              <span className="font-heading font-black text-sm uppercase text-white">
                Grand Total Landed Cost (INR):
              </span>
              <span className="font-mono text-2xl font-black text-[#F25C05]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#252C38]">
            <div className="text-xs text-[#858D9B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F25C05]" />
              <span>Quotes can be revised before the buyer formally selects and awards the PO.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-xl shadow-[#F25C05]/20"
            >
              <span>{submitting ? 'Submitting Formal Quotation...' : 'Submit Quotation to Buyer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

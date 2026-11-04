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
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Star,
  Layers,
  ChevronLeft,
  Truck,
} from 'lucide-react';
import type { ConstructionRfq, ConstructionQuotation, QuotationComparisonMatrix, ItemizedQuotationBreakdown } from '@/lib/procurement/types';

export default function QuotationComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id as string;

  const [rfq, setRfq] = useState<ConstructionRfq | null>(null);
  const [comparison, setComparison] = useState<QuotationComparisonMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection Modal State
  const [selectedQuote, setSelectedQuote] = useState<ConstructionQuotation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    async function fetchRfqDetails() {
      try {
        const res = await fetch(`/api/procurement/rfqs/${rfqId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setRfq(json.data.rfq);
          setComparison(json.data.comparison);
        } else {
          setError(json.error || 'Failed to load requirement details');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading comparison matrix');
      } finally {
        setLoading(false);
      }
    }
    if (rfqId) fetchRfqDetails();
  }, [rfqId]);

  const handleOpenSelectModal = (quote: ConstructionQuotation) => {
    setSelectedQuote(quote);
    setModalOpen(true);
  };

  const handleConfirmAward = async () => {
    if (!selectedQuote || !rfq) return;
    setAwarding(true);
    try {
      const res = await fetch(`/api/procurement/quotations/${selectedQuote.id}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: rfq.id,
          buyerConfirmed: true,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to award quotation');
      }

      const po = json.data;
      router.push(`/buyer/orders/${po.id}`);
    } catch (err: any) {
      alert(err.message || 'Error awarding quotation');
      setAwarding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-3">
        <Scale className="w-8 h-8 text-[#F25C05] animate-spin mx-auto" />
        <div className="font-mono text-sm text-[#858D9B]">Generating Side-by-Side Quotation Comparison Matrix...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <div className="text-lg font-bold text-white">Requirement Not Found</div>
        <p className="text-xs text-[#858D9B]">{error || 'Invalid RFQ Reference'}</p>
        <Link href="/buyer/dashboard" className="inline-block px-4 py-2 bg-[#171C26] border border-[#252C38] text-xs font-bold uppercase rounded-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const quotes = comparison?.quotations || [];

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#858D9B]">
          <Link href="/buyer/dashboard" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Buyer Dashboard</span>
          </Link>
          <span>/</span>
          <span>RFQs</span>
          <span>/</span>
          <span className="text-[#F25C05]">{rfq.referenceCode}</span>
        </div>

        {/* RFQ Header Summary Card */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 lg:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#F25C05] px-2 py-0.5 bg-[#090B10] border border-[#252C38] rounded-xs">
                  {rfq.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#252C38] text-[#C5CAD3] rounded-xs">
                  {rfq.projectType}
                </span>
                <span className="font-mono text-[11px] text-[#858D9B]">
                  Urgency: <strong className="text-white">{rfq.urgency}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
                {rfq.title}
              </h1>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#858D9B]">Required Delivery</div>
              <div className="text-sm font-bold text-white">{rfq.requiredDeliveryDate}</div>
              <div className="text-xs text-[#F25C05] font-semibold">{rfq.delivery?.city}, Gujarat</div>
            </div>
          </div>

          {/* Requested Items Summary */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#858D9B]">
              Requested Material Items ({rfq.items.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rfq.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-[#090B10] border border-[#252C38] rounded-xs text-xs space-y-1">
                  <div className="font-bold text-white">{it.materialName}</div>
                  <div className="font-mono text-[#F25C05]">Quantity: {it.quantity} {it.unit}</div>
                  {it.brandPreference && <div className="text-[#858D9B]">Brand: {it.brandPreference}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Side-by-Side Comparison Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
                <Scale className="w-3.5 h-3.5" />
                <span>STEP 4 · COMPARE & SELECT</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                Side-by-Side Quotation Matrix ({quotes.length} Submitted)
              </h2>
            </div>
            <div className="text-xs font-mono text-[#858D9B]">
              ✓ No auto-selection • Buyer explicit confirmation required
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-[#171C26] border border-[#252C38] p-12 text-center rounded-xs space-y-3">
              <Clock className="w-8 h-8 text-[#F25C05] mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-white">Awaiting Quotations from Matching Suppliers</div>
              <p className="text-xs text-[#858D9B] max-w-md mx-auto">
                Verified Ahmedabad suppliers have been invited. Most stockists submit formal itemized proposals within 2-4 hours.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((quote: ConstructionQuotation) => {
                const isLowest = quote.grandTotal === comparison?.lowestTotalPrice;
                const isFastest = quote.promisedDeliveryDate === comparison?.fastestDeliveryDate;
                const isAccepted = quote.status === 'ACCEPTED';

                return (
                  <div
                    key={quote.id}
                    className={`bg-[#171C26] border rounded-xs p-6 space-y-5 flex flex-col justify-between transition-all ${
                      isLowest
                        ? 'border-[#F25C05] shadow-lg shadow-[#F25C05]/10'
                        : isAccepted
                        ? 'border-emerald-500 bg-emerald-950/10'
                        : 'border-[#252C38] hover:border-[#858D9B]'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#090B10] border border-[#252C38] rounded-xs">
                          {quote.referenceCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLowest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#F25C05] text-white rounded-xs">
                              Lowest Total
                            </span>
                          )}
                          {isFastest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-sky-600 text-white rounded-xs">
                              Fastest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Supplier Credibility Profile */}
                      <div className="space-y-1.5 pb-4 border-b border-[#252C38]">
                        <h3 className="font-heading font-black text-lg text-white">
                          {quote.supplierName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#C5CAD3]">
                          <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {quote.supplierRating}
                          </span>
                          <span>•</span>
                          <span className="text-[#858D9B] font-mono">{quote.totalCompletedDeliveries} orders delivered</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>GSTIN: {quote.supplierGstin} (Verified)</span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="space-y-2 bg-[#090B10] border border-[#252C38] p-4 rounded-xs">
                        <div className="flex justify-between text-xs text-[#858D9B]">
                          <span>Material Subtotal:</span>
                          <span className="font-mono text-white">₹{quote.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#858D9B]">
                          <span>GST Total:</span>
                          <span className="font-mono text-white">₹{quote.totalGst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#858D9B]">
                          <span>Delivery Freight:</span>
                          <span className="font-mono text-white">₹{quote.deliveryCharges.toLocaleString('en-IN')}</span>
                        </div>
                        {quote.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-emerald-400">
                            <span>Discount Applied:</span>
                            <span className="font-mono">-₹{quote.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#252C38] flex justify-between items-baseline">
                          <span className="text-xs font-bold uppercase text-white font-mono">Grand Total:</span>
                          <span className="font-mono text-xl font-black text-[#F25C05]">
                            ₹{quote.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Unit Rates */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-[#858D9B] uppercase">Item Unit Rates:</div>
                        <div className="space-y-1 text-xs">
                          {quote.items.map((it: ItemizedQuotationBreakdown, idx: number) => (
                            <div key={idx} className="flex justify-between text-[#C5CAD3] bg-[#090B10]/60 px-2 py-1 rounded-xs font-mono text-[11px]">
                              <span>{it.materialName}:</span>
                              <span className="font-bold text-white">₹{it.unitPrice.toLocaleString('en-IN')} / {it.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Commercial Terms */}
                      <div className="text-xs space-y-1 text-[#858D9B] pt-2 border-t border-[#252C38]">
                        <div><strong className="text-white">Promised Delivery:</strong> {quote.promisedDeliveryDate}</div>
                        <div><strong className="text-white">Payment Terms:</strong> {quote.paymentTerms}</div>
                        <div><strong className="text-white">Validity:</strong> {quote.validityDays} Days</div>
                        {quote.supplierNotes && (
                          <div className="pt-1 text-[#C5CAD3] italic">&ldquo;{quote.supplierNotes}&rdquo;</div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-[#252C38]">
                      {isAccepted ? (
                        <div className="w-full py-3 bg-emerald-600/20 border border-emerald-500 text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xs text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Quotation Selected & PO Issued</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSelectModal(quote)}
                          className="w-full py-3 bg-[#F25C05] hover:bg-[#D94E00] text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                          <span>Select This Quotation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Modal (Explicit Buyer Confirmation) */}
        {modalOpen && selectedQuote && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#171C26] border border-[#252C38] max-w-lg w-full p-6 sm:p-8 rounded-xs space-y-6 shadow-2xl">
              <div className="space-y-2 border-b border-[#252C38] pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F25C05] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>MANDATORY EXPLICIT CONFIRMATION</span>
                </div>
                <h3 className="text-xl font-black uppercase text-white font-heading">
                  Award Purchase Order to {selectedQuote.supplierName}?
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#C5CAD3]">
                <p>
                  You are about to accept quotation <strong className="text-white">{selectedQuote.referenceCode}</strong> for a total landed cost of <strong className="text-[#F25C05] font-mono text-sm">₹{selectedQuote.grandTotal.toLocaleString('en-IN')}</strong>.
                </p>

                <div className="bg-[#090B10] p-4 rounded-xs border border-[#252C38] space-y-1.5 font-mono">
                  <div className="text-white font-bold">Commercial Terms Summary:</div>
                  <div>• Supplier: {selectedQuote.supplierName} ({selectedQuote.supplierGstin})</div>
                  <div>• Promised Delivery Date: {selectedQuote.promisedDeliveryDate}</div>
                  <div>• Payment Terms: {selectedQuote.paymentTerms}</div>
                  <div>• Site: {rfq.delivery?.addressLine}, {rfq.delivery?.city}</div>
                </div>

                <p className="text-[#858D9B]">
                  Upon confirmation, an official Purchase Order (<span className="text-white">PO-XXXXX</span>) will be issued. The supplier will be alerted to begin warehouse allocation and dispatch tracking.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252C38]">
                <button
                  type="button"
                  disabled={awarding}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-[#090B10] hover:bg-[#252C38] border border-[#252C38] text-xs font-bold uppercase rounded-xs text-[#C5CAD3]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={awarding}
                  onClick={handleConfirmAward}
                  className="px-6 py-2.5 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs flex items-center gap-2 shadow-lg"
                >
                  <span>{awarding ? 'Generating PO...' : 'Confirm & Issue Purchase Order'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

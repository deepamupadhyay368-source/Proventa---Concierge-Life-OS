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
  FileSpreadsheet,
  Building2,
  Star,
  ChevronLeft,
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
      <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-20 text-center space-y-3">
        <Scale className="w-8 h-8 text-[#53634A] animate-spin mx-auto" />
        <div className="font-mono text-xs text-[#777970]">Generating Side-by-Side Quotation Comparison Matrix...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#A9433B] mx-auto" />
        <div className="text-lg font-bold text-[#171A17]">Requirement Not Found</div>
        <p className="text-xs text-[#777970]">{error || 'Invalid RFQ Reference'}</p>
        <Link href="/buyer/dashboard" className="inline-block px-4 py-2 bg-[#FFFFFF] border border-[#D9D8CF] text-xs font-bold uppercase">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const quotes = comparison?.quotations || [];

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#171A17] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#777970]">
          <Link href="/buyer/dashboard" className="hover:text-[#171A17] flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Buyer Dashboard</span>
          </Link>
          <span>/</span>
          <span>RFQs</span>
          <span>/</span>
          <span className="text-[#53634A] font-bold">{rfq.referenceCode}</span>
        </div>

        {/* RFQ Header Summary Card */}
        <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-6 lg:p-8 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D8CF] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#53634A] px-2 py-0.5 bg-[#E7E5DC] border border-[#D9D8CF]">
                  {rfq.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#E7E5DC] text-[#171A17]">
                  {rfq.projectType}
                </span>
                <span className="font-mono text-[11px] text-[#777970]">
                  Urgency: <strong className="text-[#171A17]">{rfq.urgency}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171A17] font-heading">
                {rfq.title}
              </h1>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#777970]">Required Delivery</div>
              <div className="text-sm font-bold text-[#171A17]">{rfq.requiredDeliveryDate}</div>
              <div className="text-xs text-[#53634A] font-semibold">{rfq.delivery?.city}, Gujarat</div>
            </div>
          </div>

          {/* Requested Items Summary */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#777970]">
              Requested Material Items ({rfq.items.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rfq.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-[#F2F0E9] border border-[#D9D8CF] text-xs space-y-1">
                  <div className="font-bold text-[#171A17]">{it.materialName}</div>
                  <div className="font-mono text-[#53634A]">Quantity: {it.quantity} {it.unit}</div>
                  {it.brandPreference && <div className="text-[#777970]">Brand: {it.brandPreference}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#53634A] font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span>STEP 4 · COMPARE & SELECT</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#171A17] font-heading">
                Side-by-Side Quotation Matrix ({quotes.length} Submitted)
              </h2>
            </div>
            <div className="text-xs font-mono text-[#777970]">
              ✓ No auto-selection • Buyer explicit confirmation required
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#D9D8CF] p-12 text-center space-y-3 shadow-sm">
              <Clock className="w-8 h-8 text-[#53634A] mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-[#171A17]">Awaiting Quotations from Matching Suppliers</div>
              <p className="text-xs text-[#777970] max-w-md mx-auto">
                Verified suppliers have been notified. Most stockists submit formal itemized proposals within 2-4 hours.
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
                    className={`bg-[#FFFFFF] border p-6 space-y-5 flex flex-col justify-between transition-all shadow-sm ${
                      isLowest
                        ? 'border-[#53634A] ring-1 ring-[#53634A]'
                        : isAccepted
                        ? 'border-[#496B4B] bg-[#EEF1EC]'
                        : 'border-[#D9D8CF] hover:border-[#777970]'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#171A17] px-2 py-0.5 bg-[#F2F0E9] border border-[#D9D8CF]">
                          {quote.referenceCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLowest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#B87948] text-[#FFFFFF]">
                              Lowest Total
                            </span>
                          )}
                          {isFastest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#53634A] text-[#FFFFFF]">
                              Fastest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Supplier Credibility Profile */}
                      <div className="space-y-1.5 pb-4 border-b border-[#D9D8CF]">
                        <h3 className="font-heading font-black text-lg text-[#171A17]">
                          {quote.supplierName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#777970]">
                          <span className="flex items-center gap-1 text-[#B87948] font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {quote.supplierRating}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{quote.totalCompletedDeliveries} orders delivered</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#496B4B]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>GSTIN: {quote.supplierGstin} (Verified)</span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="space-y-2 bg-[#F2F0E9] border border-[#D9D8CF] p-4">
                        <div className="flex justify-between text-xs text-[#777970]">
                          <span>Material Subtotal:</span>
                          <span className="font-mono text-[#171A17]">₹{quote.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#777970]">
                          <span>GST Total:</span>
                          <span className="font-mono text-[#171A17]">₹{quote.totalGst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#777970]">
                          <span>Delivery Freight:</span>
                          <span className="font-mono text-[#171A17]">₹{quote.deliveryCharges.toLocaleString('en-IN')}</span>
                        </div>
                        {quote.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-[#496B4B]">
                            <span>Discount Applied:</span>
                            <span className="font-mono">-₹{quote.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#D9D8CF] flex justify-between items-baseline">
                          <span className="text-xs font-bold uppercase text-[#171A17] font-mono">Grand Total:</span>
                          <span className="font-mono text-xl font-black text-[#53634A]">
                            ₹{quote.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Unit Rates */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-[#777970] uppercase">Item Unit Rates:</div>
                        <div className="space-y-1 text-xs">
                          {quote.items.map((it: ItemizedQuotationBreakdown, idx: number) => (
                            <div key={idx} className="flex justify-between text-[#171A17] bg-[#F2F0E9] px-2 py-1 font-mono text-[11px]">
                              <span>{it.materialName}:</span>
                              <span className="font-bold text-[#171A17]">₹{it.unitPrice.toLocaleString('en-IN')} / {it.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Commercial Terms */}
                      <div className="text-xs space-y-1 text-[#777970] pt-2 border-t border-[#D9D8CF]">
                        <div><strong className="text-[#171A17]">Promised Delivery:</strong> {quote.promisedDeliveryDate}</div>
                        <div><strong className="text-[#171A17]">Payment Terms:</strong> {quote.paymentTerms}</div>
                        <div><strong className="text-[#171A17]">Validity:</strong> {quote.validityDays} Days</div>
                        {quote.supplierNotes && (
                          <div className="pt-1 text-[#171A17] italic">&ldquo;{quote.supplierNotes}&rdquo;</div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-[#D9D8CF]">
                      {isAccepted ? (
                        <div className="w-full py-3 bg-[#EEF1EC] border border-[#496B4B] text-[#496B4B] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Quotation Selected & PO Issued</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSelectModal(quote)}
                          className="w-full py-3 bg-[#53634A] hover:bg-[#43503B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
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
          <div className="fixed inset-0 z-50 bg-[#171A17]/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#D9D8CF] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-2 border-b border-[#D9D8CF] pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#53634A] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>MANDATORY EXPLICIT CONFIRMATION</span>
                </div>
                <h3 className="text-xl font-black uppercase text-[#171A17] font-heading">
                  Award Purchase Order to {selectedQuote.supplierName}?
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#171A17]">
                <p>
                  You are about to accept quotation <strong className="text-[#171A17]">{selectedQuote.referenceCode}</strong> for a total landed cost of <strong className="text-[#53634A] font-mono text-sm">₹{selectedQuote.grandTotal.toLocaleString('en-IN')}</strong>.
                </p>

                <div className="bg-[#F2F0E9] p-4 border border-[#D9D8CF] space-y-1.5 font-mono">
                  <div className="text-[#171A17] font-bold">Commercial Terms Summary:</div>
                  <div>• Supplier: {selectedQuote.supplierName} ({selectedQuote.supplierGstin})</div>
                  <div>• Promised Delivery Date: {selectedQuote.promisedDeliveryDate}</div>
                  <div>• Payment Terms: {selectedQuote.paymentTerms}</div>
                  <div>• Site: {rfq.delivery?.addressLine}, {rfq.delivery?.city}</div>
                </div>

                <p className="text-[#777970]">
                  Upon confirmation, an official Purchase Order will be generated. The supplier will receive notice to allocate stock and assign transport dispatch.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9D8CF]">
                <button
                  type="button"
                  disabled={awarding}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#E7E5DC] border border-[#D9D8CF] text-xs font-bold uppercase text-[#171A17]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={awarding}
                  onClick={handleConfirmAward}
                  className="px-6 py-2.5 bg-[#53634A] hover:bg-[#43503B] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
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

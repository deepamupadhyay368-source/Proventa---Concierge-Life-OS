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
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-3">
        <Scale className="w-8 h-8 text-[#536B88] animate-spin mx-auto" />
        <div className="font-mono text-xs text-[#A8ADB7]">Generating Side-by-Side Quotation Comparison Matrix...</div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#D9534F] mx-auto" />
        <div className="text-lg font-bold text-[#FFFFFF]">Requirement Not Found</div>
        <p className="text-xs text-[#A8ADB7]">{error || 'Invalid RFQ Reference'}</p>
        <Link href="/buyer/dashboard" className="inline-block px-4 py-2 bg-[#303746] border border-[#414957] text-xs font-bold uppercase text-[#F1F2F4] rounded-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const quotes = comparison?.quotations || [];

  return (
    <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A8ADB7]">
          <Link href="/buyer/dashboard" className="hover:text-[#FFFFFF] flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Buyer Dashboard</span>
          </Link>
          <span>/</span>
          <span>RFQs</span>
          <span>/</span>
          <span className="text-[#536B88] font-bold">{rfq.referenceCode}</span>
        </div>

        {/* RFQ Header Summary Card */}
        <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                  {rfq.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#252B38] text-[#F1F2F4] rounded-sm">
                  {rfq.projectType}
                </span>
                <span className="font-mono text-[11px] text-[#A8ADB7]">
                  Urgency: <strong className="text-[#FFFFFF]">{rfq.urgency}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                {rfq.title}
              </h1>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#A8ADB7]">Required Delivery</div>
              <div className="text-sm font-bold text-[#FFFFFF]">{rfq.requiredDeliveryDate}</div>
              <div className="text-xs text-[#536B88] font-semibold">{rfq.delivery?.city}, Gujarat</div>
            </div>
          </div>

          {/* Requested Items Summary */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#A8ADB7]">
              Requested Material Items ({rfq.items.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rfq.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-[#252B38] border border-[#414957] text-xs space-y-1 rounded-sm">
                  <div className="font-bold text-[#FFFFFF]">{it.materialName}</div>
                  <div className="font-mono text-[#536B88]">Quantity: {it.quantity} {it.unit}</div>
                  {it.brandPreference && <div className="text-[#A8ADB7]">Brand: {it.brandPreference}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span>STEP 4 · COMPARE & SELECT</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                Side-by-Side Quotation Matrix ({quotes.length} Submitted)
              </h2>
            </div>
            <div className="text-xs font-mono text-[#A8ADB7]">
              ✓ No auto-selection • Buyer explicit confirmation required
            </div>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-[#303746] border border-[#414957] p-12 text-center space-y-3 shadow-sm rounded-sm">
              <Clock className="w-8 h-8 text-[#536B88] mx-auto animate-pulse" />
              <div className="text-sm font-semibold text-[#FFFFFF]">Awaiting Quotations from Matching Suppliers</div>
              <p className="text-xs text-[#A8ADB7] max-w-md mx-auto">
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
                    className={`bg-[#303746] border p-6 space-y-5 flex flex-col justify-between transition-all shadow-sm rounded-sm ${
                      isLowest
                        ? 'border-[#C66A42] ring-1 ring-[#C66A42]'
                        : isAccepted
                        ? 'border-[#536B88] bg-[#252B38]'
                        : 'border-[#414957] hover:border-[#536B88]'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                          {quote.referenceCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isLowest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#C66A42] text-[#FFFFFF] rounded-sm">
                              Lowest Landed Cost
                            </span>
                          )}
                          {isFastest && (
                            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#536B88] text-[#FFFFFF] rounded-sm">
                              Fastest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Supplier Credibility Profile */}
                      <div className="space-y-1.5 pb-4 border-b border-[#414957]">
                        <h3 className="font-heading font-black text-lg text-[#FFFFFF]">
                          {quote.supplierName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#A8ADB7]">
                          <span className="flex items-center gap-1 text-[#C66A42] font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {quote.supplierRating}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{quote.totalCompletedDeliveries} orders delivered</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#536B88]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>GSTIN: {quote.supplierGstin} (Verified)</span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="space-y-2 bg-[#252B38] border border-[#414957] p-4 rounded-sm">
                        <div className="flex justify-between text-xs text-[#A8ADB7]">
                          <span>Material Subtotal:</span>
                          <span className="font-mono text-[#FFFFFF]">₹{quote.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#A8ADB7]">
                          <span>GST Total:</span>
                          <span className="font-mono text-[#FFFFFF]">₹{quote.totalGst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#A8ADB7]">
                          <span>Delivery Freight:</span>
                          <span className="font-mono text-[#FFFFFF]">₹{quote.deliveryCharges.toLocaleString('en-IN')}</span>
                        </div>
                        {quote.discountAmount > 0 && (
                          <div className="flex justify-between text-xs text-[#4A7C59]">
                            <span>Discount Applied:</span>
                            <span className="font-mono">-₹{quote.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[#414957] flex justify-between items-baseline">
                          <span className="text-xs font-bold uppercase text-[#FFFFFF] font-mono">Total Landed Cost:</span>
                          <span className="font-mono text-xl font-black text-[#C66A42]">
                            ₹{quote.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Unit Rates */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-mono text-[#A8ADB7] uppercase">Item Unit Rates:</div>
                        <div className="space-y-1 text-xs">
                          {quote.items.map((it: ItemizedQuotationBreakdown, idx: number) => (
                            <div key={idx} className="flex justify-between text-[#F1F2F4] bg-[#252B38] px-2 py-1 font-mono text-[11px] border border-[#414957] rounded-sm">
                              <span>{it.materialName}:</span>
                              <span className="font-bold text-[#FFFFFF]">₹{it.unitPrice.toLocaleString('en-IN')} / {it.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Commercial Terms */}
                      <div className="text-xs space-y-1 text-[#A8ADB7] pt-2 border-t border-[#414957]">
                        <div><strong className="text-[#FFFFFF]">Promised Delivery:</strong> {quote.promisedDeliveryDate}</div>
                        <div><strong className="text-[#FFFFFF]">Payment Terms:</strong> {quote.paymentTerms}</div>
                        <div><strong className="text-[#FFFFFF]">Quotation Validity:</strong> {quote.validityDays} Days</div>
                        {quote.supplierNotes && (
                          <div className="pt-1 text-[#F1F2F4] italic">&ldquo;{quote.supplierNotes}&rdquo;</div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-[#414957]">
                      {isAccepted ? (
                        <div className="w-full py-3 bg-[#252B38] border border-[#4A7C59] text-[#4A7C59] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 rounded-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Quotation Selected & PO Issued</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSelectModal(quote)}
                          className="w-full py-3 bg-[#536B88] hover:bg-[#435770] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm rounded-sm"
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
          <div className="fixed inset-0 z-50 bg-[#191B20]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#303746] border border-[#414957] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl rounded-sm">
              <div className="space-y-2 border-b border-[#414957] pb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#536B88] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>MANDATORY EXPLICIT CONFIRMATION</span>
                </div>
                <h3 className="text-xl font-black uppercase text-[#FFFFFF] font-heading">
                  Award Purchase Order to {selectedQuote.supplierName}?
                </h3>
              </div>

              <div className="space-y-3 text-xs text-[#F1F2F4]">
                <p>
                  You are about to accept quotation <strong className="text-[#FFFFFF]">{selectedQuote.referenceCode}</strong> for a total landed cost of <strong className="text-[#C66A42] font-mono text-sm">₹{selectedQuote.grandTotal.toLocaleString('en-IN')}</strong>.
                </p>

                <div className="bg-[#252B38] p-4 border border-[#414957] space-y-1.5 font-mono text-[#A8ADB7] rounded-sm">
                  <div className="text-[#FFFFFF] font-bold">Commercial Terms Summary:</div>
                  <div>• Supplier: {selectedQuote.supplierName} ({selectedQuote.supplierGstin})</div>
                  <div>• Promised Delivery Date: {selectedQuote.promisedDeliveryDate}</div>
                  <div>• Payment Terms: {selectedQuote.paymentTerms}</div>
                  <div>• Site: {rfq.delivery?.addressLine}, {rfq.delivery?.city}</div>
                </div>

                <p className="text-[#A8ADB7]">
                  Upon confirmation, an official Purchase Order will be generated. The supplier will receive notice to allocate stock and assign transport dispatch.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#414957]">
                <button
                  type="button"
                  disabled={awarding}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-bold uppercase text-[#F1F2F4] rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={awarding}
                  onClick={handleConfirmAward}
                  className="px-6 py-2.5 bg-[#C66A42] hover:bg-[#B35A33] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm rounded-sm"
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

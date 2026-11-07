'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Star,
  ChevronLeft,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import type { PurchaseOrder } from '@/lib/procurement/types';
import { DELIVERY_STAGES_SEQUENCE } from '@/lib/procurement/types';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delivery Receipt Sign-off Form
  const [receivedBy, setReceivedBy] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [confirmedQuantity, setConfirmedQuantity] = useState('100% Full Order Verified on Site');
  const [hasDamage, setHasDamage] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');
  const [supplierRating, setSupplierRating] = useState(5);
  const [feedback, setFeedback] = useState('Delivered on schedule. Materials verified in good condition.');
  const [confirming, setConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/procurement/orders/${orderId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
          if (json.data.delivery?.siteContactPerson) {
            setReceivedBy(json.data.delivery.siteContactPerson);
          }
          if (json.data.delivery?.siteContactPhone) {
            setReceiverPhone(json.data.delivery.siteContactPhone);
          }
        } else {
          setError(json.error || 'Failed to load purchase order');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading purchase order');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setConfirming(true);

    try {
      const res = await fetch(`/api/procurement/orders/${order.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          receivedBy,
          receiverPhone,
          confirmedReceivedQuantity: confirmedQuantity,
          hasDamageOrShortage: hasDamage,
          shortageDamageNotes: hasDamage ? damageNotes : undefined,
          supplierRating,
          buyerFeedback: feedback,
          proofPhotos: ['/documents/proof/site_delivery_slip.jpg'],
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to confirm receipt');
      }

      setOrder(json.data);
      setConfirmSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error submitting receipt confirmation');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-3">
        <Truck className="w-8 h-8 text-[#536B88] animate-bounce mx-auto" />
        <div className="font-mono text-xs text-[#A8ADB7]">Loading Delivery Tracking & Purchase Order Details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#292F3D] text-[#F1F2F4] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#D9534F] mx-auto" />
        <div className="text-lg font-bold text-[#FFFFFF]">Purchase Order Not Found</div>
        <p className="text-xs text-[#A8ADB7]">{error || 'Invalid Order Reference'}</p>
        <Link href="/buyer/dashboard" className="inline-block px-4 py-2 bg-[#303746] border border-[#414957] text-xs font-bold uppercase text-[#F1F2F4] rounded-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentStageIndex = DELIVERY_STAGES_SEQUENCE.indexOf(order.deliveryStatus);
  const isCompleted = order.deliveryStatus === 'COMPLETED';

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
          <span>Orders</span>
          <span>/</span>
          <span className="text-[#536B88] font-bold">{order.referenceCode}</span>
        </div>

        {/* PO Header Card */}
        <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-5 shadow-sm rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414957] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FFFFFF] px-2 py-0.5 bg-[#191B20] border border-[#414957] rounded-sm">
                  {order.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#252B38] text-[#536B88] border border-[#414957] font-bold rounded-sm">
                  {order.deliveryStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                Purchase Order Coordination
              </h1>
              <div className="text-xs text-[#A8ADB7] font-mono">
                Awarded from RFQ: <span className="text-[#FFFFFF] font-bold">{order.rfqReferenceCode}</span> • Quote: <span className="text-[#FFFFFF] font-bold">{order.quotationReferenceCode}</span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#252B38] hover:bg-[#191B20] border border-[#414957] text-xs font-mono font-bold text-[#F1F2F4] rounded-sm transition-colors cursor-pointer"
                title="Print official Purchase Order Voucher"
              >
                <Printer className="w-3.5 h-3.5 text-[#536B88]" />
                <span>Print PO Voucher</span>
              </button>
              <div>
                <div className="text-xs font-mono text-[#A8ADB7]">Grand Total Landed Cost</div>
                <div className="font-mono text-2xl font-black text-[#C66A42]">
                  ₹{order.grandTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-[#A8ADB7]">Inclusive of all GST & Freight</div>
              </div>
            </div>
          </div>

          {/* Supplier & Delivery Site Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#252B38] p-4 border border-[#414957] space-y-2 text-xs rounded-sm">
              <div className="font-mono text-[#536B88] font-bold uppercase">Awarded Supplier:</div>
              <div className="text-sm font-bold text-[#FFFFFF]">{order.supplierName}</div>
              <div className="font-mono text-[#A8ADB7]">GSTIN: {order.supplierGstin}</div>
              <div className="text-[#F1F2F4]">Authorized Stockist Depot, Gujarat</div>
            </div>

            <div className="bg-[#252B38] p-4 border border-[#414957] space-y-2 text-xs rounded-sm">
              <div className="font-mono text-[#536B88] font-bold uppercase">Delivery Site Address:</div>
              <div className="text-sm font-bold text-[#FFFFFF]">{order.delivery?.siteName}</div>
              <div className="text-[#F1F2F4]">{order.delivery?.addressLine}, {order.delivery?.city} - {order.delivery?.pincode}</div>
              <div className="font-mono text-[#A8ADB7]">Site Contact: {order.delivery?.siteContactPerson} ({order.delivery?.siteContactPhone})</div>
            </div>
          </div>
        </div>

        {/* 7-STAGE DELIVERY TRACKER */}
        <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-6 shadow-sm rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#414957] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>STEP 5 · 7-STAGE MILESTONE DISPATCH</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
                Live Delivery Milestones
              </h2>
            </div>
            <div className="font-mono text-xs text-[#A8ADB7]">
              Stage {currentStageIndex + 1} of 7: <strong className="text-[#FFFFFF]">{order.deliveryStatus}</strong>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DELIVERY_STAGES_SEQUENCE.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage}
                  className={`p-3 border text-xs space-y-1.5 transition-all rounded-sm ${
                    isCurrent
                      ? 'bg-[#252B38] border-[#C66A42] text-[#FFFFFF] shadow-sm'
                      : isPast
                      ? 'bg-[#252B38] border-[#414957] text-[#4A7C59]'
                      : 'bg-[#191B20] border-[#414957] text-[#A8ADB7] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>0{idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-[#4A7C59]" />}
                    {isCurrent && <span className="w-2 h-2 bg-[#C66A42]" />}
                  </div>
                  <div className="font-heading font-bold text-[11px] uppercase tracking-tight leading-tight">
                    {stage.replace(/_/g, ' ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Dispatch Vehicle & Driver Details */}
          {order.dispatchDetails ? (
            <div className="bg-[#252B38] border border-[#414957] p-5 space-y-4 rounded-sm">
              <div className="font-mono text-xs uppercase tracking-wider text-[#536B88] font-bold">
                Vehicle Dispatch & Driver Assignment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-[#A8ADB7] font-mono">Vehicle Number:</div>
                  <div className="font-bold text-[#FFFFFF] text-sm font-mono mt-0.5">{order.dispatchDetails.vehicleNumber}</div>
                  <div className="text-[11px] text-[#A8ADB7]">{order.dispatchDetails.vehicleType}</div>
                </div>

                <div>
                  <div className="text-[#A8ADB7] font-mono">Driver In-Charge:</div>
                  <div className="font-bold text-[#FFFFFF] text-sm mt-0.5">{order.dispatchDetails.driverName}</div>
                  <div className="text-[11px] text-[#536B88] font-mono flex items-center gap-1 mt-0.5 font-bold">
                    <Phone className="w-3 h-3" />
                    <span>{order.dispatchDetails.driverPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[#A8ADB7] font-mono">Transporter:</div>
                  <div className="font-bold text-[#FFFFFF] text-sm mt-0.5">{order.dispatchDetails.transporterName}</div>
                  {order.dispatchDetails.eWayBillNumber && (
                    <div className="text-[11px] text-[#A8ADB7] font-mono">E-Way Bill: {order.dispatchDetails.eWayBillNumber}</div>
                  )}
                </div>

                <div>
                  <div className="text-[#A8ADB7] font-mono">Estimated Arrival:</div>
                  <div className="font-bold text-[#FFFFFF] text-sm font-mono mt-0.5">
                    {new Date(order.dispatchDetails.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[11px] text-[#A8ADB7]">
                    {new Date(order.dispatchDetails.estimatedDeliveryTime).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {order.dispatchDetails.trackingNotes && (
                <div className="pt-2 border-t border-[#414957] text-xs text-[#F1F2F4] font-mono">
                  Transit Note: &ldquo;{order.dispatchDetails.trackingNotes}&rdquo;
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#252B38] border border-[#414957] p-4 text-center text-xs font-mono text-[#A8ADB7] rounded-sm">
              Supplier has been notified to allocate warehouse stock and generate dispatch vehicle details.
            </div>
          )}
        </div>

        {/* PHYSICAL SITE DELIVERY SIGN-OFF */}
        <div className="bg-[#303746] border border-[#414957] p-6 lg:p-8 space-y-6 shadow-sm rounded-sm">
          <div className="border-b border-[#414957] pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#536B88] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STEP 6 · CONFIRM & COMPLETE</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#FFFFFF] font-heading">
              Physical Site Delivery Sign-Off
            </h2>
            <p className="text-xs text-[#A8ADB7]">
              Upon truck arrival at site, verify material quantities, log any shortages, rate the supplier, and finalize the transaction.
            </p>
          </div>

          {isCompleted && order.receiptConfirmation ? (
            <div className="bg-[#252B38] border border-[#4A7C59] p-6 space-y-4 rounded-sm">
              <div className="flex items-center gap-2 text-[#4A7C59] font-bold text-sm font-heading uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5" />
                <span>Delivery Verified & Order Successfully Closed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-[#F1F2F4]">
                <div>
                  <div className="text-[#A8ADB7]">Received By:</div>
                  <div className="font-bold">{order.receiptConfirmation.receivedBy} ({order.receiptConfirmation.receiverPhone})</div>
                </div>
                <div>
                  <div className="text-[#A8ADB7]">Delivered Quantity:</div>
                  <div className="font-bold">{order.receiptConfirmation.confirmedReceivedQuantity}</div>
                </div>
                <div>
                  <div className="text-[#A8ADB7]">Supplier Rating:</div>
                  <div className="font-bold text-[#C66A42] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{order.receiptConfirmation.supplierRating} / 5 Stars</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-[#A8ADB7]">
                Buyer Sign-Off Feedback: &ldquo;{order.receiptConfirmation.buyerFeedback}&rdquo;
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmReceipt} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8ADB7] mb-1.5 font-bold">
                    Site Receiver / Engineer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="e.g. Pravinbhai Patel"
                    className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8ADB7] mb-1.5 font-bold">
                    Receiver Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8ADB7] mb-1.5 font-bold">
                    Delivered Quantity Check
                  </label>
                  <input
                    type="text"
                    value={confirmedQuantity}
                    onChange={(e) => setConfirmedQuantity(e.target.value)}
                    placeholder="e.g. 100% Full Order Verified on Site"
                    className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A8ADB7] mb-1.5 font-bold">
                    Supplier Rating (1 to 5)
                  </label>
                  <select
                    value={supplierRating}
                    onChange={(e) => setSupplierRating(Number(e.target.value))}
                    className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                  >
                    <option value={5}>5 Stars - Excellent on-time delivery</option>
                    <option value={4}>4 Stars - Good delivery</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                    <option value={2}>2 Stars - Minor delays</option>
                    <option value={1}>1 Star - Serious issues reported</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A8ADB7] mb-1.5 font-bold">
                  Site Verification Feedback & Notes
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#252B38] border border-[#414957] text-[#FFFFFF] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#536B88] rounded-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={confirming}
                  className="px-8 py-3 bg-[#C66A42] hover:bg-[#B35A33] disabled:opacity-50 text-[#FFFFFF] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm rounded-sm"
                >
                  {confirming ? 'Submitting Receipt...' : 'Confirm Delivery Receipt & Close PO'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Print-specific stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          header, nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

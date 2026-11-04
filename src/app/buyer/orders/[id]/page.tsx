'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
  Phone,
  User,
  Star,
  MapPin,
  ChevronLeft,
  Upload,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import type { PurchaseOrder, DeliveryTrackingStage } from '@/lib/procurement/types';
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
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-3">
        <Truck className="w-8 h-8 text-[#F25C05] animate-bounce mx-auto" />
        <div className="font-mono text-sm text-[#858D9B]">Loading Delivery Tracking & Purchase Order Details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#090B10] text-[#F4F6FA] font-sans py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <div className="text-lg font-bold text-white">Purchase Order Not Found</div>
        <p className="text-xs text-[#858D9B]">{error || 'Invalid Order Reference'}</p>
        <Link href="/buyer/dashboard" className="inline-block px-4 py-2 bg-[#171C26] border border-[#252C38] text-xs font-bold uppercase rounded-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentStageIndex = DELIVERY_STAGES_SEQUENCE.indexOf(order.deliveryStatus);
  const isCompleted = order.deliveryStatus === 'COMPLETED';

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
          <span>Orders</span>
          <span>/</span>
          <span className="text-[#F25C05]">{order.referenceCode}</span>
        </div>

        {/* PO Header Card */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 lg:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252C38] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#090B10] border border-[#252C38] rounded-xs">
                  {order.referenceCode}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 bg-[#F25C05]/20 text-[#F25C05] border border-[#F25C05]/40 rounded-xs font-bold">
                  {order.deliveryStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
                Purchase Order Coordination
              </h1>
              <div className="text-xs text-[#858D9B] font-mono">
                Awarded from RFQ: <span className="text-white">{order.rfqReferenceCode}</span> • Quote: <span className="text-white">{order.quotationReferenceCode}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-[#858D9B]">Grand Total Landed Cost</div>
              <div className="font-mono text-2xl font-black text-[#F25C05]">
                ₹{order.grandTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#858D9B]">Inclusive of all GST & Freight</div>
            </div>
          </div>

          {/* Supplier & Delivery Site Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#090B10] p-4 rounded-xs border border-[#252C38] space-y-2 text-xs">
              <div className="font-mono text-[#F25C05] font-bold uppercase">Awarded Supplier:</div>
              <div className="text-sm font-bold text-white">{order.supplierName}</div>
              <div className="font-mono text-[#858D9B]">GSTIN: {order.supplierGstin}</div>
              <div className="text-[#C5CAD3]">Authorized Stockist Depot, Gujarat</div>
            </div>

            <div className="bg-[#090B10] p-4 rounded-xs border border-[#252C38] space-y-2 text-xs">
              <div className="font-mono text-[#F25C05] font-bold uppercase">Delivery Site Address:</div>
              <div className="text-sm font-bold text-white">{order.delivery?.siteName}</div>
              <div className="text-[#C5CAD3]">{order.delivery?.addressLine}, {order.delivery?.city} - {order.delivery?.pincode}</div>
              <div className="font-mono text-[#858D9B]">Site In-Charge: {order.delivery?.siteContactPerson} ({order.delivery?.siteContactPhone})</div>
            </div>
          </div>
        </div>

        {/* 7-STAGE DELIVERY TRACKER */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252C38] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
                <Truck className="w-3.5 h-3.5" />
                <span>STEP 5 · 7-STAGE MILESTONE DISPATCH</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white font-heading">
                Live Delivery Milestones
              </h2>
            </div>
            <div className="font-mono text-xs text-[#858D9B]">
              Stage {currentStageIndex + 1} of 7: <strong className="text-white">{order.deliveryStatus}</strong>
            </div>
          </div>

          {/* Progress Bar / Step Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DELIVERY_STAGES_SEQUENCE.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage}
                  className={`p-3 rounded-xs border text-xs space-y-1.5 transition-all ${
                    isCurrent
                      ? 'bg-[#F25C05]/10 border-[#F25C05] text-white shadow-md'
                      : isPast
                      ? 'bg-emerald-950/20 border-emerald-600/50 text-emerald-300'
                      : 'bg-[#090B10] border-[#252C38] text-[#858D9B] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span>0{idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-[#F25C05] animate-pulse" />}
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
            <div className="bg-[#090B10] border border-[#252C38] p-5 rounded-xs space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#F25C05] font-bold">
                Vehicle Dispatch & Driver Assignment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-[#858D9B] font-mono">Vehicle Number:</div>
                  <div className="font-bold text-white text-sm font-mono mt-0.5">{order.dispatchDetails.vehicleNumber}</div>
                  <div className="text-[11px] text-[#C5CAD3]">{order.dispatchDetails.vehicleType}</div>
                </div>

                <div>
                  <div className="text-[#858D9B] font-mono">Driver In-Charge:</div>
                  <div className="font-bold text-white text-sm mt-0.5">{order.dispatchDetails.driverName}</div>
                  <div className="text-[11px] text-[#F25C05] font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{order.dispatchDetails.driverPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[#858D9B] font-mono">Transporter / Fleet:</div>
                  <div className="font-bold text-white text-sm mt-0.5">{order.dispatchDetails.transporterName}</div>
                  {order.dispatchDetails.eWayBillNumber && (
                    <div className="text-[11px] text-[#858D9B] font-mono">E-Way Bill: {order.dispatchDetails.eWayBillNumber}</div>
                  )}
                </div>

                <div>
                  <div className="text-[#858D9B] font-mono">Estimated Arrival:</div>
                  <div className="font-bold text-white text-sm font-mono mt-0.5">
                    {new Date(order.dispatchDetails.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[11px] text-[#C5CAD3]">
                    {new Date(order.dispatchDetails.estimatedDeliveryTime).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {order.dispatchDetails.trackingNotes && (
                <div className="pt-2 border-t border-[#252C38] text-xs text-[#C5CAD3] font-mono">
                  Transit Note: &ldquo;{order.dispatchDetails.trackingNotes}&rdquo;
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#090B10] border border-[#252C38] p-4 text-center text-xs font-mono text-[#858D9B]">
              Supplier has been notified to allocate warehouse stock and generate dispatch vehicle details.
            </div>
          )}
        </div>

        {/* STEP 6: PHYSICAL DELIVERY CONFIRMATION & COMPLETION */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 lg:p-8 space-y-6">
          <div className="border-b border-[#252C38] pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F25C05]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STEP 6 · CONFIRM & COMPLETE</span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white font-heading">
              Physical Site Delivery Sign-Off
            </h2>
            <p className="text-xs text-[#858D9B]">
              Upon truck arrival at site, verify material quantities, log any shortages, rate the supplier, and finalize the transaction.
            </p>
          </div>

          {isCompleted && order.receiptConfirmation ? (
            <div className="bg-emerald-950/20 border border-emerald-500/40 p-6 rounded-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-heading uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5" />
                <span>Delivery Verified & Order Successfully Closed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-[#C5CAD3]">
                <div>
                  <div className="text-[#858D9B]">Received By:</div>
                  <div className="font-bold text-white">{order.receiptConfirmation.receivedBy} ({order.receiptConfirmation.receiverPhone})</div>
                </div>
                <div>
                  <div className="text-[#858D9B]">Delivered Quantity:</div>
                  <div className="font-bold text-white">{order.receiptConfirmation.confirmedReceivedQuantity}</div>
                </div>
                <div>
                  <div className="text-[#858D9B]">Supplier Rating:</div>
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{order.receiptConfirmation.supplierRating} / 5 Stars</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-[#858D9B]">
                Buyer Sign-Off Feedback: &ldquo;{order.receiptConfirmation.buyerFeedback}&rdquo;
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmReceipt} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                    Site Receiver / Engineer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="e.g. Pravinbhai Patel"
                    className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                    Receiver Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                    Delivered Quantity Check
                  </label>
                  <input
                    type="text"
                    value={confirmedQuantity}
                    onChange={(e) => setConfirmedQuantity(e.target.value)}
                    placeholder="e.g. 100% Full Order Verified on Site"
                    className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                    Supplier Performance Rating
                  </label>
                  <select
                    value={supplierRating}
                    onChange={(e) => setSupplierRating(parseInt(e.target.value, 10))}
                    className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Outstanding on-time delivery)</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars (Good delivery & material quality)</option>
                    <option value="3">⭐⭐⭐ 3 Stars (Satisfactory)</option>
                    <option value="2">⭐⭐ 2 Stars (Minor delays or issues)</option>
                    <option value="1">⭐ 1 Star (Significant delay or shortage)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="hasDamage"
                      checked={hasDamage}
                      onChange={(e) => setHasDamage(e.target.checked)}
                      className="w-4 h-4 rounded-xs accent-[#F25C05]"
                    />
                    <label htmlFor="hasDamage" className="text-xs font-semibold text-white cursor-pointer">
                      Report Shortage or Physical In-Transit Damage
                    </label>
                  </div>

                  {hasDamage && (
                    <textarea
                      rows={2}
                      value={damageNotes}
                      onChange={(e) => setDamageNotes(e.target.value)}
                      placeholder="Specify damaged quantity or bag shortage with batch details..."
                      className="w-full bg-[#090B10] border border-red-800 text-white p-3 text-xs rounded-xs focus:outline-none"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#858D9B] mb-1.5">
                    Site Feedback & Review
                  </label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter review comments for supplier profile..."
                    className="w-full bg-[#090B10] border border-[#252C38] text-white px-3.5 py-2.5 text-xs rounded-xs focus:outline-none focus:border-[#F25C05]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={confirming}
                  className="px-6 py-3 bg-[#F25C05] hover:bg-[#D94E00] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{confirming ? 'Signing Off...' : 'Confirm Delivery Receipt & Close Order'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Audit Timeline */}
        <div className="bg-[#171C26] border border-[#252C38] rounded-xs p-6 space-y-4">
          <h2 className="font-heading font-black text-sm uppercase tracking-tight text-white border-b border-[#252C38] pb-3">
            Transaction & Dispatch Audit Trail ({order.timeline?.length || 0} Events)
          </h2>
          <div className="space-y-3">
            {order.timeline?.map((ev, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs bg-[#090B10] p-3 rounded-xs border border-[#252C38]">
                <Clock className="w-3.5 h-3.5 text-[#F25C05] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ev.title}</span>
                    <span className="font-mono text-[10px] text-[#858D9B]">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#171C26] text-[#C5CAD3] rounded-xs border border-[#252C38]">
                      {ev.actorRole}
                    </span>
                  </div>
                  <p className="text-[#C5CAD3]">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  Star,
  Camera,
  FileText
} from 'lucide-react';
import { HomeServiceRequest } from '@/lib/home/types';

export default function CustomerRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HomeServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/home/requests/${requestId}`);
      const data = await res.json();
      if (data.success && data.request) {
        setRequest(data.request);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const handleRespondCharge = async (chargeId: string, approved: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/home/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESPOND_ADDITIONAL_CHARGE',
          chargeId,
          approved
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRequest();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/home/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          status: 'CLOSED',
          metadata: { customerRating: rating, customerFeedback: feedback }
        })
      });
      const data = await res.json();
      if (data.success) {
        setRatingSubmitted(true);
        await fetchRequest();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-sm text-stone-500">Loading service request details...</div>;
  }

  if (!request) {
    return (
      <div className="p-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Request Not Found</h2>
        <Link href="/customer/dashboard" className="text-xs text-[#53634A] underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const pendingCharge = request.additionalCharges.find(c => c.status === 'PENDING_APPROVAL');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-4">
        <div>
          <Link href="/customer/dashboard" className="text-xs text-[#53634A] font-semibold flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-stone-500">{request.requestCode}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
              {request.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171A17] mt-1">{request.serviceName}</h1>
        </div>

        <div className="text-right">
          <div className="text-xs text-stone-500">Scheduled Date:</div>
          <div className="font-bold text-sm text-stone-900">{request.preferredDate} ({request.preferredTimeSlot})</div>
        </div>
      </div>

      {/* PENDING APPROVAL ALERT BANNER */}
      {pendingCharge && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-amber-900">
                Action Required: Additional Spare Parts Approval
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your assigned technician diagnosed that replacement components are required to complete this repair safely. Diagnostic labour is fully covered by your membership. Please approve the spare parts charge below:
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-stone-800">
              <span>Required Component:</span>
              <span className="text-stone-900">{pendingCharge.description}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Material Cost (at MRP):</span>
              <span>₹{pendingCharge.materialCost}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Additional Labour:</span>
              <span>₹{pendingCharge.labourExtraCost} (Covered / Free)</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-amber-900 pt-2 border-t border-stone-100">
              <span>Total Customer Payable:</span>
              <span>₹{pendingCharge.totalAmount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleRespondCharge(pendingCharge.id, true)}
              disabled={actionLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Authorize Part (₹{pendingCharge.totalAmount})</span>
            </button>
            <button
              onClick={() => handleRespondCharge(pendingCharge.id, false)}
              disabled={actionLoading}
              className="px-5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold py-3 rounded-xl border border-stone-300 transition"
            >
              Decline Part
            </button>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Issue & Work Summary */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs space-y-5">
          <h3 className="font-bold text-base text-[#171A17] pb-2 border-b border-stone-100">
            Reported Issue
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
            {request.issueDescription}
          </p>

          {request.technicianWorkNotes && (
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Technician Diagnostic Findings</h4>
              <p className="text-xs text-stone-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 leading-relaxed">
                {request.technicianWorkNotes}
              </p>
            </div>
          )}

          {/* Evidence photos */}
          {(request.beforePhotos.length > 0 || request.afterPhotos.length > 0) && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Job Evidence Photographs</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {request.beforePhotos.length > 0 && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Before Repair</span>
                    <div className="text-[11px] text-stone-600 truncate">{request.beforePhotos[0]}</div>
                  </div>
                )}
                {request.afterPhotos.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">After Repair</span>
                    <div className="text-[11px] text-emerald-800 truncate">{request.afterPhotos[0]}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Assigned Partner & Address */}
        <div className="md:col-span-5 space-y-6">
          {/* Technician Info */}
          <div className="bg-white p-6 rounded-3xl border border-[#E3DFD5] shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Assigned Professional</span>
            {request.assignedTechnicianName ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-base text-[#171A17]">{request.assignedTechnicianName}</h4>
                  <p className="text-xs text-stone-500">Verified Local Technician Partner</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-stone-800 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <Phone className="w-3.5 h-3.5 text-[#53634A]" />
                  <span>{request.assignedTechnicianPhone}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Police Verified • Aadhaar KYC Complete</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-500 py-2">
                Technician being allocated by dispatch engine based on locality proximity.
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-3xl border border-[#E3DFD5] shadow-xs space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-stone-400">Service Location</span>
            <p className="text-stone-700 leading-relaxed font-medium">
              {request.address.fullAddress}
            </p>
          </div>
        </div>

      </div>

      {/* RATING & SIGN-OFF (When completed or closed) */}
      {(request.status === 'WORK_COMPLETED' || request.status === 'CLOSED') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-base text-[#171A17]">30-Day Workmanship Warranty Active</h3>
              <p className="text-xs text-stone-500">This repair is covered against recurring defects until 30 days from sign-off.</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>

          {request.customerRating ? (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block">Your Rating:</span>
                <span className="font-bold text-amber-600 text-sm">{request.customerRating} ★</span>
                {request.customerFeedback && <p className="text-stone-700 italic mt-1">"{request.customerFeedback}"</p>}
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                Sign-off Confirmed
              </span>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-3 text-xs">
              <label className="block font-semibold text-stone-700">Rate your technician's workmanship (1 to 5 Stars):</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl border flex items-center gap-1 font-bold ${
                      rating >= star ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional feedback for Jignesh / Farooq..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition"
              >
                Submit Sign-off & Rating
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}

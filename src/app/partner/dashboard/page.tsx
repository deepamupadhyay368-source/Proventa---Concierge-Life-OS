'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  IndianRupee, 
  PlusCircle, 
  ArrowRight,
  Camera,
  Star
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HomeServiceRequest, HomeTechnicianPayout } from '@/lib/home/types';

export default function PartnerDashboardPage() {
  const techId = 'tech-elec-01'; // Jignesh Solanki
  const technician = homeDataStore.getTechnicianById(techId);
  const requests = homeDataStore.getAllRequests({ technicianId: techId });
  const payouts = homeDataStore.getAllPayouts(techId);

  const [isAvailable, setIsAvailable] = useState(technician?.isAvailableForDispatch ?? true);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string>('req-2026-001');

  const [partData, setPartData] = useState({
    description: '',
    materialCost: ''
  });

  const [completionData, setCompletionData] = useState({
    notes: '',
    afterPhoto: '/photos/evidence/new-mcb-installed.jpg'
  });

  const activeJob = requests.find(r => r.status === 'TECHNICIAN_ASSIGNED' || r.status === 'WORK_STARTED' || r.status === 'AWAITING_CUSTOMER_APPROVAL');

  const handleRequestPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    await fetch(`/api/home/requests/${activeJob.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADD_ADDITIONAL_CHARGE',
        description: partData.description,
        materialCost: Number(partData.materialCost),
        labourExtraCost: 0
      })
    });

    setShowPartModal(false);
    window.location.reload();
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    await fetch(`/api/home/requests/${activeJob.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_STATUS',
        status: 'WORK_COMPLETED',
        metadata: {
          workCompletedAt: new Date().toISOString(),
          notes: completionData.notes,
          afterPhotos: [completionData.afterPhoto]
        }
      })
    });

    setShowCompleteModal(false);
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      
      {/* Top Profile & Availability Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#53634A]">Partner Console</span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">{technician?.operatingLocality} Hub (Ahmedabad)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171A17]">{technician?.fullName}</h1>
          <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
            <span className="flex items-center gap-1 font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-current" /> {technician?.ratingAverage} ★ ({technician?.ratingCount} ratings)
            </span>
            <span>•</span>
            <span>{technician?.completedJobsCount} jobs completed</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Police Verified</span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0">
          <div className="text-right text-xs">
            <div className="font-bold text-stone-900">{isAvailable ? 'Online for Dispatch' : 'Offline / On Break'}</div>
            <div className="text-[11px] text-stone-500">{isAvailable ? 'Receiving local jobs' : 'Not taking assignments'}</div>
          </div>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition duration-300 ${isAvailable ? 'bg-emerald-500' : 'bg-stone-300'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Weekly Payout Status</span>
          <div className="text-3xl font-bold text-[#171A17]">₹4,250</div>
          <div className="text-xs text-stone-500">Processed every Tuesday to Axis Bank • 91801004...</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Service Coverage</span>
          <div className="text-xl font-bold text-stone-800">{technician?.operatingLocality} + 6 km Radius</div>
          <div className="text-xs text-stone-500">Bopal, South Bopal, Ghuma, Shela</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Performance Badge</span>
          <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" /> Top Rated Lead Electrician
          </div>
          <div className="text-xs text-stone-500">Qualifies for ₹4,000 monthly retention bonus</div>
        </div>
      </div>

      {/* ACTIVE ASSIGNED JOB CARD */}
      {activeJob && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#53634A] shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs uppercase font-bold text-[#53634A] tracking-wider">Current Active Job</span>
              <h2 className="text-xl font-bold text-[#171A17] mt-0.5">{activeJob.serviceName}</h2>
              <div className="font-mono text-xs text-stone-500">{activeJob.requestCode}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
              Status: {activeJob.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2.5">
              <span className="font-bold text-stone-400 uppercase tracking-wider">Customer & Site Details</span>
              <div className="space-y-1">
                <div className="font-bold text-sm text-[#171A17]">{activeJob.customerName}</div>
                <div className="text-stone-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-stone-400" /> {activeJob.customerPhone}
                </div>
                <div className="text-stone-600 leading-relaxed pt-1">
                  {activeJob.address.fullAddress}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="font-bold text-stone-400 uppercase tracking-wider">Reported Issue</span>
              <p className="text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                {activeJob.issueDescription}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={() => setShowPartModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Request Spare Part Approval</span>
            </button>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Job Completed</span>
            </button>
          </div>
        </div>
      )}

      {/* Part Request Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-bold text-lg text-[#171A17]">Request Spare Parts Approval</h3>
              <button onClick={() => setShowPartModal(false)} className="text-stone-400 hover:text-stone-700 text-sm">✕</button>
            </div>
            <p className="text-xs text-stone-500">
              The customer will receive an immediate notification on their screen to approve the material cost before you install it.
            </p>

            <form onSubmit={handleRequestPart} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Component Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schneider 32A C-curve MCB + 5m FR wire"
                  value={partData.description}
                  onChange={e => setPartData({ ...partData, description: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Material Price at Market MRP (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 680"
                  value={partData.materialCost}
                  onChange={e => setPartData({ ...partData, materialCost: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-semibold"
                >
                  Send for Customer Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-bold text-lg text-[#171A17]">Complete Service Visit</h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-stone-400 hover:text-stone-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleCompleteJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Diagnostic & Work Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe cause and fix, e.g. 'Found loose neutral wire, replaced burnt terminal, tightened busbar'..."
                  value={completionData.notes}
                  onChange={e => setCompletionData({ ...completionData, notes: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] p-3.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">After-Work Photo URL / Evidence</label>
                <input
                  type="text"
                  value={completionData.afterPhoto}
                  onChange={e => setCompletionData({ ...completionData, afterPhoto: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 font-mono"
                />
              </div>
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#53634A] text-white font-semibold"
                >
                  Confirm Completion & Generate Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout History Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-4">
        <h3 className="font-bold text-lg text-[#171A17]">Partner Payout Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider">
                <th className="py-2.5 font-semibold">Job Code</th>
                <th className="py-2.5 font-semibold">Labour Fee</th>
                <th className="py-2.5 font-semibold">Material Reimbursed</th>
                <th className="py-2.5 font-semibold">Net Payout</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {payouts.map(p => (
                <tr key={p.id}>
                  <td className="py-3 font-mono font-medium">{p.requestCode}</td>
                  <td className="py-3">₹350</td>
                  <td className="py-3">₹{p.materialReimbursement}</td>
                  <td className="py-3 font-bold text-emerald-800">₹{p.netPayoutAmount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-stone-400 text-[11px]">{p.transactionReference || 'Processing'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building, ShieldCheck, CheckCircle2, ArrowRight, Users, Wrench, PhoneCall } from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function SocietiesPage() {
  const societies = homeDataStore.getAllSocieties();
  const [formData, setFormData] = useState({
    societyName: '',
    locality: 'South Bopal',
    totalFlats: '',
    contactPerson: '',
    contactPhone: '',
    contactRole: 'Chairman / Secretary'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Apartment & Community Programs
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">PROVENTA Society Partnerships</h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Comprehensive household care and infrastructure maintenance solutions tailored for Resident Welfare Associations (RWAs) and apartment committees across Ahmedabad.
        </p>
      </div>

      {/* Two Partnership Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-3xl p-8 border border-[#E3DFD5] shadow-xs space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#53634A]/10 text-[#53634A] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171A17]">Bulk Community Contract</h3>
            <p className="text-xs text-stone-500 mt-1">RWA-funded society-wide maintenance package</p>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            The society committee negotiates a bulk rate for all residential flats. We station a dedicated technician pod on-site during peak hours, handling both internal household issues and common-area electrical/pumping infrastructure.
          </p>
          <ul className="text-xs text-stone-700 space-y-2 pt-2 border-t border-stone-100">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#53634A]" />
              <span>Dedicated on-premise technician station</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#53634A]" />
              <span>Up to 20% discount on standard membership fees</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#53634A]" />
              <span>Monthly audit of overhead pumps and generator panels</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#E3DFD5] shadow-xs space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#171A17]">Preferential Society Code</h3>
            <p className="text-xs text-stone-500 mt-1">Individual resident opt-in program</p>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            The RWA endorses PROVENTA Home without incurring common society expenses. Residents receive an exclusive society promo code granting 10-15% discount on annual memberships and priority dispatch.
          </p>
          <ul className="text-xs text-stone-700 space-y-2 pt-2 border-t border-stone-100">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Zero financial commitment from RWA funds</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>10–15% exclusive discount for society residents</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Free quarterly plumbing health camp for residents</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Active Partner Societies */}
      <div className="bg-white rounded-3xl p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-xl text-[#171A17]">Enrolled Ahmedabad Societies</h3>
            <p className="text-xs text-stone-500">Communities benefiting from managed household care</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Active Deployments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {societies.map(soc => (
            <div key={soc.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-[#171A17]">{soc.societyName}</h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                  {soc.totalFlatsOrUnits} Units
                </span>
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div>Locality: <strong>{soc.locality}, Ahmedabad ({soc.pincode})</strong></div>
                <div>Enrolled Residents: <strong className="text-[#53634A]">{soc.enrolledHouseholdsCount} Flats</strong></div>
                <div>Partnership Model: <strong>{soc.partnershipModel.replace('_', ' ')}</strong></div>
                <div>Negotiated Discount: <strong className="text-emerald-700">{soc.negotiatedDiscountPercent}% off</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enquiry Form */}
      <div className="bg-[#F2F0E9] rounded-3xl p-8 sm:p-12 border border-[#E3DFD5]">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-[#171A17]">Register Your Society for a Pilot Program</h3>
            <p className="text-xs text-stone-600">
              Our community partnership manager will visit your society office for a presentation and free infrastructure inspection.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-900 text-sm">Thank you for your enquiry!</h4>
              <p className="text-xs text-emerald-700">
                Our Ahmedabad community manager will reach out within 24 hours to schedule a meeting.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD5] space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Society Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goyal Orchid Whitefield"
                  value={formData.societyName}
                  onChange={e => setFormData({ ...formData, societyName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Locality (Ahmedabad) *</label>
                  <input
                    type="text"
                    required
                    value={formData.locality}
                    onChange={e => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Residential Flats *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 240"
                    value={formData.totalFlats}
                    onChange={e => setFormData({ ...formData, totalFlats: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 XXXXX"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#53634A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Request Society Partnership Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

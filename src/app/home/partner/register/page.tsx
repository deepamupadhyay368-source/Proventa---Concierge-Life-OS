'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { HOME_SERVICE_CATEGORIES, AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    operatingLocality: 'Bopal',
    serviceRadiusKm: '6',
    categoryKey: 'ELECTRICAL',
    experienceYears: '5',
    aadhaarNumber: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    beneficiaryName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/home/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          operatingLocality: formData.operatingLocality,
          serviceRadiusKm: Number(formData.serviceRadiusKm),
          serviceCategories: [formData.categoryKey],
          primarySkills: [`${formData.categoryKey} diagnostics & repair`],
          experienceYears: Number(formData.experienceYears),
          bankDetails: {
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            bankName: formData.bankName,
            beneficiaryName: formData.beneficiaryName || formData.fullName
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-14 space-y-8">
      
      <div className="border-b border-[#E3DFD5] pb-4">
        <Link href="/home/partners" className="text-xs text-[#53634A] font-semibold flex items-center gap-1 mb-2 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Partners Overview
        </Link>
        <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Technician Onboarding</span>
        <h1 className="text-3xl font-bold text-[#171A17] mt-1">Apply to Join the PROVENTA Partner Network</h1>
        <p className="text-xs text-stone-500 mt-1">
          Direct weekly bank payouts • Local jobs in Ahmedabad • Zero commission on leads
        </p>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">Application Submitted Successfully!</h2>
          <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
            Our Ahmedabad partner onboarding team will contact you within 24 hours to schedule your police verification check and technical tool inspection.
          </p>
          <div className="pt-4">
            <Link
              href="/home/partner/dashboard"
              className="inline-flex items-center gap-2 bg-[#53634A] text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-xs"
            >
              <span>Explore Partner Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-xs space-y-6 text-xs">
          
          {/* Section 1: Personal info */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-[#171A17] pb-2 border-b border-stone-100">
              1. Personal & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Legal Name (as per Aadhaar) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jignesh Valjibhai Solanki"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (Calling & WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98790 23114"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jignesh.tech@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.aadhaarNumber}
                  onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trade & Locality */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="font-bold text-base text-[#171A17] pb-2 border-b border-stone-100">
              2. Trade Specialisation & Service Hub
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Primary Trade *</label>
                <select
                  value={formData.categoryKey}
                  onChange={e => setFormData({ ...formData, categoryKey: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                >
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="APPLIANCE">AC & Appliance Repair</option>
                  <option value="CLEANING">Tank & Deep Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Preferred Locality (Ahmedabad) *</label>
                <select
                  value={formData.operatingLocality}
                  onChange={e => setFormData({ ...formData, operatingLocality: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                >
                  {AHMEDABAD_LOCALITIES.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Years of Trade Experience *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="40"
                  value={formData.experienceYears}
                  onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Details */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="font-bold text-base text-[#171A17] pb-2 border-b border-stone-100">
              3. Bank Details for Weekly Direct Payout
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 918010045812903"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bank IFSC Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTIB0001334"
                  value={formData.ifscCode}
                  onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axis Bank Bopal Branch"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Account Beneficiary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Name as printed on bank passbook"
                  value={formData.beneficiaryName}
                  onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 pt-3"
          >
            <span>{isSubmitting ? 'Registering Application...' : 'Submit Technician Partner Application'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Wrench, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Award,
  PhoneCall
} from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
            Technician Partner Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#171A17] leading-tight">
            Work Locally.<br />
            <span className="text-[#53634A]">Earn Dignity & Steady Income.</span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Join Ahmedabad's most respected household maintenance network. Stop traveling across the entire city for uncertain gigs. Work within a 5–7 km radius of your home with guaranteed weekly direct bank payouts.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              href="/partner/register"
              className="inline-flex items-center justify-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white font-semibold text-xs px-7 py-3.5 rounded-xl shadow-md transition"
            >
              <span>Apply as a Technician Partner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/partner/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs px-6 py-3.5 rounded-xl border border-[#E3DFD5] shadow-xs transition"
            >
              <span>Partner Login</span>
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Weekly Direct Bank Transfer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Lead Commission</span>
            </div>
          </div>
        </div>

        {/* Earning Card */}
        <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-[#E3DFD5] shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Earning Potential</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ahmedabad Hub
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#171A17]">₹32,000 – ₹48,000</div>
            <div className="text-xs text-stone-500">Typical monthly income for 4-5 jobs/day</div>
          </div>

          <div className="space-y-3 pt-3 text-xs text-stone-700">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <span>Standard Visit Payout</span>
              <strong className="text-stone-900">₹350 – ₹450 / job</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <span>Material Reimbursement</span>
              <strong className="text-emerald-700">100% Upfront Approval</strong>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <span>Performance Bonus</span>
              <strong className="text-[#53634A]">Up to ₹4,000 / month</strong>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 pt-1">
            Payouts processed every Tuesday directly to verified savings bank accounts or UPI IDs.
          </div>
        </div>
      </div>

      {/* 4 Core Pillars for Partners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#53634A]/10 flex items-center justify-center text-[#53634A]">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">Work in Your Neighbourhood</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Choose your operating hub (e.g. Bopal, Satellite, or Gota). Never waste hours in city traffic; dispatch orders are clustered within 5-7 km.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">Respect & Customer Safety</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            All households are verified PROVENTA members. Our dispatch team coordinates appointments, eliminating hostile bargaining and unpaid work.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <IndianRupee className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">No Lead Fees or Deductions</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Unlike gig marketplace apps that charge ₹150–₹300 just to view a lead, PROVENTA Home charges zero commission on partner earnings.
          </p>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="bg-white rounded-3xl p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h3 className="font-bold text-xl text-[#171A17]">Mandatory Partner Verification Checklist</h3>
        <p className="text-xs text-stone-600">
          To maintain the highest trust with Ahmedabad households, all partners must complete:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-bold text-[#53634A]">1. Identity & KYC</span>
            <p className="text-stone-600">Valid Aadhaar card and PAN card registered in partner name.</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-bold text-[#53634A]">2. Police Verification</span>
            <p className="text-stone-600">Clean local police verification certificate from Ahmedabad Commissionerate.</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-bold text-[#53634A]">3. Technical Experience</span>
            <p className="text-stone-600">ITI trade certification or minimum 3 years verified field experience in trade.</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="font-bold text-[#53634A]">4. Safety Briefing</span>
            <p className="text-stone-600">Completion of PROVENTA 2-hour domestic etiquette and PPE safety protocol.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

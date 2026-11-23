import React from 'react';
import Link from 'next/link';
import { 
  ClipboardCheck, 
  Search, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Select or Report an Issue',
      desc: 'Browse our standardized 20+ service catalogue or describe a unique domestic problem. Upload a photo or short video to help diagnostics.',
      icon: <ClipboardCheck className="w-6 h-6 text-[#53634A]" />
    },
    {
      number: '02',
      title: 'Algorithmic Local Matching',
      desc: 'Our dispatch engine scores nearby verified technicians based on trade certifications, active rating, customer continuity, and arrival distance.',
      icon: <Search className="w-6 h-6 text-blue-600" />
    },
    {
      number: '03',
      title: 'Punctual Arrival & Safety Briefing',
      desc: 'Your technician arrives within the confirmed 2-hour window, wearing official PROVENTA credentials and following mandatory domestic safety protocols.',
      icon: <Clock className="w-6 h-6 text-amber-700" />
    },
    {
      number: '04',
      title: 'Transparent Diagnosis & Material Approval',
      desc: 'Labour is covered by your membership. If spare parts are required, the technician requests digital approval with transparent market prices before installing.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
    },
    {
      number: '05',
      title: 'Sign-off & Maintenance Passport Update',
      desc: 'Once work is verified, complete digital sign-off. Before/after photos, replaced part details, and warranty certificates are recorded forever in your Home Passport.',
      icon: <FileCheck className="w-6 h-6 text-indigo-600" />
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          The Lifecycle
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">How PROVENTA Home Operates</h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          From the moment a faucet drips or an MCB trips to digital closure and warranty backing, our managed process eliminates the uncertainty of home repairs.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E3DFD5] shadow-xs flex flex-col sm:flex-row items-start gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 shrink-0">
              {step.icon}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#53634A]">{step.number}</span>
                <h3 className="font-bold text-lg text-[#171A17]">{step.title}</h3>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison: Local Handyman vs Proventa Home */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <h3 className="font-bold text-xl text-[#171A17] text-center">
          Why Membership Outperforms Ad-Hoc Callouts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-3">
            <h4 className="font-bold text-sm text-rose-900">Traditional Local Handymen</h4>
            <ul className="text-xs text-rose-800 space-y-2">
              <li>✕ Arbitrary pricing and aggressive bargaining after arrival.</li>
              <li>✕ No identity or police background verification.</li>
              <li>✕ Unpredictable delays; no guaranteed arrival slot.</li>
              <li>✕ Zero warranty: no recourse if the same leak recurs tomorrow.</li>
              <li>✕ No record of which parts were installed in your home.</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <h4 className="font-bold text-sm text-emerald-900">PROVENTA Home Membership</h4>
            <ul className="text-xs text-emerald-800 space-y-2">
              <li>✓ All labour covered under your monthly subscription.</li>
              <li>✓ 100% Aadhaar & police background checked technicians.</li>
              <li>✓ Committed 2-hour arrival windows with live tracking.</li>
              <li>✓ Guaranteed 30-day workmanship warranty on every job.</li>
              <li>✓ Lifetime digital records in your Home Maintenance Passport.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-md transition"
        >
          <span>Find Your Household Membership Plan</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

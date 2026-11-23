import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, Award, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Our Mission
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">Rebuilding Trust in Home Care</h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          PROVENTA Home was founded to solve a fundamental urban Indian frustration: the broken, unpredictable, and stressful experience of managing everyday household repairs.
        </p>
      </div>

      {/* Story */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3DFD5] shadow-xs space-y-6 text-stone-700 text-sm leading-relaxed">
        <h2 className="text-2xl font-bold text-[#171A17]">The Household Frustration We Saw</h2>
        <p>
          Whether in Bopal, Satellite, or Gota, every homeowner experiences the same ordeal: an electrical switch starts sparking, a toilet flush valve starts hissing, or an air conditioner fails in peak May heat. 
        </p>
        <p>
          Finding a dependable technician usually involves begging the building security guard for numbers, calling three different handymen who show up four hours late, and facing high arbitrary quotes once work has begun.
        </p>
        <p>
          Meanwhile, skilled technicians struggle with unstable daily income, excessive platform commission deductions (up to 30%), and zero long-term security.
        </p>

        <h2 className="text-2xl font-bold text-[#171A17] pt-4">The PROVENTA Model</h2>
        <p>
          We created a <strong>managed subscription infrastructure</strong>. By turning unpredictable maintenance into an affordable monthly membership, households receive committed 2-hour response windows, police-verified technicians, and a digital Home Maintenance Passport.
        </p>
        <p>
          For technicians, we guarantee steady local jobs within 5-7 km of their neighbourhood and direct weekly payouts with zero lead fees.
        </p>
      </div>

      {/* 3 Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#53634A]/10 text-[#53634A] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">Absolute Integrity</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Standardized diagnostic fees, zero spare part markups, and upfront digital approvals before any wrench is turned.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">Technician Dignity</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We treat our technician partners with respect, providing professional equipment, safety protocols, and fair weekly compensations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171A17]">30-Day Guarantee</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every completed job is backed by a 30-day workmanship guarantee. If the issue recurs, our team fixes it at zero cost.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-8 py-3.5 rounded-xl shadow-md transition"
        >
          <span>Explore Household Memberships</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

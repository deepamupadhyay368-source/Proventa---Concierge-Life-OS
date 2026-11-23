'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Droplet, 
  Hammer, 
  Wind, 
  Sparkles, 
  Search, 
  Clock, 
  Calendar,
  Building,
  UserCheck,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import { HOME_SERVICE_CATEGORIES, HOME_SUBSCRIPTION_PLANS, AHMEDABAD_LOCALITIES } from '@/lib/home/constants';

export default function HomeLandingPage() {
  const [selectedLocality, setSelectedLocality] = useState('');
  const [localityStatus, setLocalityStatus] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');

  const handleCheckLocality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocality.trim()) return;

    const match = AHMEDABAD_LOCALITIES.find(
      loc => loc.name.toLowerCase().includes(selectedLocality.toLowerCase()) ||
             loc.pincodes.some(p => p.includes(selectedLocality.trim()))
    );

    if (match) {
      setLocalityStatus(`✓ Full coverage available in ${match.name} (Avg. Response: ${match.averageResponseTimeMin} mins, ${match.activeTechniciansCount} active technicians).`);
    } else {
      setLocalityStatus(`Coverage expanding soon to ${selectedLocality}. You can join our priority waitlist for early invitation.`);
    }
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'ELECTRICAL': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'PLUMBING': return <Droplet className="w-5 h-5 text-blue-600" />;
      case 'CARPENTRY': return <Hammer className="w-5 h-5 text-amber-800" />;
      case 'APPLIANCE': return <Wind className="w-5 h-5 text-teal-600" />;
      case 'CLEANING': return <Sparkles className="w-5 h-5 text-emerald-600" />;
      default: return <WrenchIcon className="w-5 h-5 text-[#53634A]" />;
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#53634A]/10 text-[#53634A] text-xs font-semibold tracking-wide border border-[#53634A]/20">
              <ShieldCheck className="w-4 h-4 text-[#53634A]" />
              <span>Ahmedabad's Managed Household Membership</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171A17] leading-[1.12]">
              Your Home.<br />
              <span className="text-[#53634A]">Always Taken Care Of.</span>
            </h1>

            <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
              One transparent membership covering scheduled maintenance, emergency repairs, and seasonal servicing. Connected with verified local technicians across Ahmedabad.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/home/membership"
                className="inline-flex items-center justify-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-md transition"
              >
                <span>View Membership Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/home/customer/book"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-sm px-6 py-3.5 rounded-xl border border-[#E3DFD5] shadow-xs transition"
              >
                <span>Book a Single Diagnostic Visit</span>
              </Link>
            </div>

            {/* Key trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E3DFD5] text-xs text-stone-600">
              <div>
                <strong className="block text-base font-bold text-[#171A17]">4.88 ★</strong>
                <span>Verified ratings</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-[#171A17]">30-Day</strong>
                <span>Work warranty</span>
              </div>
              <div>
                <strong className="block text-base font-bold text-[#171A17]">100%</strong>
                <span>Background checked</span>
              </div>
            </div>
          </div>

          {/* Right Card / Pincode Availability & Live Status */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#E3DFD5] space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-lg text-[#171A17]">Check Local Coverage</h3>
                  <p className="text-xs text-stone-500">Live technician hubs across Ahmedabad</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              <form onSubmit={handleCheckLocality} className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">Enter Locality or 6-digit Pincode</label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    placeholder="e.g. Bopal, 380058, Satellite..."
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#53634A] focus:border-transparent bg-stone-50"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#171A17] hover:bg-stone-800 text-white text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Verify Availability</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {localityStatus && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-medium">
                  {localityStatus}
                </div>
              )}

              {/* Sample Operational Hubs */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Immediate Dispatch Zones
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['South Bopal', 'Satellite', 'Prahlad Nagar', 'Gota', 'Science City', 'Thaltej', 'Bodakdev'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => { setSelectedLocality(loc); setLocalityStatus(`✓ Full coverage available in ${loc}.`); }}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#F2F0E9] hover:bg-[#53634A]/10 text-stone-700 hover:text-[#53634A] transition"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. THE FOUR PILLARS OF PROVENTA HOME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-xs font-bold tracking-widest text-[#53634A] uppercase">The Platform Difference</h2>
          <h3 className="text-3xl font-bold text-[#171A17]">Built for Dependable Household Care</h3>
          <p className="text-sm text-stone-600">
            Unlike fragmented local directories or commission-heavy aggregators, PROVENTA Home operates as a managed membership with standardized accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#53634A]/10 flex items-center justify-center text-[#53634A]">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#171A17]">Verified Technicians</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every professional undergoes Aadhaar KYC, police background verification, technical trade trade evaluation, and safety briefing before entering your home.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#171A17]">Guaranteed Response</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Book fixed 2-hour arrival windows. For emergency plumbing leaks and electrical faults, priority dispatch responds within 90 minutes in active zones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#171A17]">30-Day Work Warranty</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              If an issue reoccurs within 30 days of completion, our team returns and fixes it free of charge with zero diagnostic or labour fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#171A17]">Maintenance Passport</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every service, part replacement, and appliance checkup is automatically logged into your digital home passport to preserve long-term property value.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-[#53634A] uppercase">Full Coverage</h2>
            <h3 className="text-3xl font-bold text-[#171A17]">7 Essential Household Disciplines</h3>
          </div>
          <Link href="/home/services" className="text-xs font-semibold text-[#53634A] hover:underline flex items-center gap-1">
            Browse complete 20+ service catalogue →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOME_SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-white rounded-2xl p-6 border border-[#E3DFD5] hover:border-[#53634A]/50 transition group shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-stone-100 group-hover:bg-[#53634A]/10 transition">
                  {getCategoryIcon(cat.key)}
                </div>
                <div>
                  <h4 className="font-bold text-[#171A17]">{cat.name}</h4>
                  <p className="text-[11px] text-stone-500">{cat.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 mb-4 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                {cat.services.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs text-stone-700">
                    <span className="truncate pr-2">• {s.name}</span>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">{s.estimatedDurationMin}m</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SUBSCRIPTION PLANS */}
      <section className="bg-white py-16 border-y border-[#E3DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-xs font-bold tracking-widest text-[#53634A] uppercase">Flexible Subscriptions</h2>
            <h3 className="text-3xl font-bold text-[#171A17]">Simple, Transparent Membership Tiers</h3>
            <p className="text-sm text-stone-600">
              No hidden consultation charges. Choose the plan matching your household size.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold mt-4">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-lg transition ${billingCycle === 'MONTHLY' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('ANNUAL')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${billingCycle === 'ANNUAL' ? 'bg-[#53634A] text-white shadow-xs' : 'text-stone-500'}`}
              >
                <span>Annual (Save ~20%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {HOME_SUBSCRIPTION_PLANS.map((plan) => {
              const price = billingCycle === 'ANNUAL' 
                ? Math.round(plan.annualPrice / 12) 
                : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between border transition relative ${
                    plan.isPopular 
                      ? 'bg-[#F2F0E9] border-[#53634A] shadow-md ring-2 ring-[#53634A]/20' 
                      : 'bg-white border-[#E3DFD5] shadow-xs'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#53634A] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-0.5 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-xl text-[#171A17]">{plan.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{plan.tagline}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#171A17]">₹{price}</span>
                      <span className="text-xs text-stone-500">/ month</span>
                      {billingCycle === 'ANNUAL' && (
                        <span className="text-[10px] text-stone-400 block ml-2">billed ₹{plan.annualPrice}/yr</span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E3DFD5] text-xs space-y-1">
                      <div className="font-semibold text-[#53634A]">
                        {plan.includedVisitsPerBillingMonth} Technician Visits Included
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        Up to {plan.visitDurationCapHours} hours per visit • {plan.visitRolloverAllowed ? 'Rollover allowed' : 'No rollover'}
                      </div>
                    </div>

                    <ul className="space-y-2.5 pt-2 text-xs text-stone-700">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#53634A] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 mt-6 border-t border-[#E3DFD5]/60">
                    <Link
                      href={`/home/join?plan=${plan.tier.toLowerCase()}&frequency=${billingCycle.toLowerCase()}`}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        plan.isPopular
                          ? 'bg-[#53634A] hover:bg-[#43523B] text-white shadow-sm'
                          : 'bg-[#171A17] hover:bg-stone-800 text-white'
                      }`}
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. RESIDENTIAL SOCIETIES PARTNERSHIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#171A17] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Building className="w-3.5 h-3.5" />
                <span>Apartment & Society Management</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Bulk Household Coverage for Resident Welfare Associations (RWA)
              </h3>
              <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
                Partner your housing society with PROVENTA Home. We station dedicated on-premise technician pods, offer bulk maintenance discounts of up to 20%, and maintain common-area electrical and pumping infrastructure.
              </p>
              <div className="pt-2">
                <Link
                  href="/home/societies"
                  className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold text-xs px-6 py-3 rounded-xl hover:bg-stone-100 transition"
                >
                  <span>Explore Society Partnerships</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-stone-900/80 p-6 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Current Society Partners</span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
                  <div className="font-semibold text-white">Orchid Harmony</div>
                  <div className="text-stone-400 text-[11px]">South Bopal • 320 Flats (84 Enrolled)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/50">
                  <div className="font-semibold text-white">Godrej Garden City (Pine)</div>
                  <div className="text-stone-400 text-[11px]">Gota, SG Highway • 850 Flats</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. VERIFIED MEMBER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <h2 className="text-xs font-bold tracking-widest text-[#53634A] uppercase">Customer Trust</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#171A17]">Trusted by Ahmedabad Families</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "Farooq bhai resolved our concealed shower mixer leak without chipping any Italian tiles. Having a single trusted subscription removes the headache of bargaining with local handymen."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-stone-900">Dr. Ananya Sharma</strong>
                <span className="text-stone-500 text-[11px]">Satellite, Ahmedabad</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">Family Member</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "We run both ACs and induction cooker at home. Jignesh Solanki arrived within 45 minutes when the main DB tripped and replaced the faulty breaker safely."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-stone-900">Rajesh Patel</strong>
                <span className="text-stone-500 text-[11px]">South Bopal, Ahmedabad</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">Premium Member</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-xs text-stone-700 italic leading-relaxed">
              "The Digital Maintenance Passport is brilliant. When selling our flat in Gota, being able to show complete HVAC and plumbing servicing logs gave buyers absolute confidence."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <strong className="block text-stone-900">Amitabh Joshi</strong>
                <span className="text-stone-500 text-[11px]">Gota, SG Highway</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">Essential Member</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REAL_ESTATE_MEMBERSHIP_PLANS } from '@/lib/real-estate/constants';
import { Check, HelpCircle, Shield, ArrowRight, Building2, FileText, ChevronRight } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const faqs = [
    {
      q: 'How does PROVENTA derive property valuations?',
      a: 'We use a hedonic valuation framework that benchmarks property-level attributes (usable RERA carpet area, floor height, age, amenities, and furnishing) against observed sub-registrar transaction records, developer filings, and verified asking benchmarks across Ahmedabad micro-markets.',
    },
    {
      q: 'Are PROVENTA valuations statutory or legal certificates?',
      a: 'No. PROVENTA produces independent analytical intelligence and research estimates for buyers, owners, and investors. Our figures do not constitute government-registered valuer certificates, bank solvency guarantees, or statutory Jantri certificates.',
    },
    {
      q: 'What is the Personal Property Vault?',
      a: 'The Vault is a private, encrypted digital locker where property owners securely record acquisition history, upload deeds, tax receipts, and municipal records, while monitoring property valuation trends over time.',
    },
    {
      q: 'Can I upgrade, downgrade, or cancel at any time?',
      a: 'Yes. All subscriptions can be managed from your member dashboard. If you cancel, your paid benefits remain active until the end of the current billing cycle.',
    },
    {
      q: 'Do you offer custom datasets for institutions and enterprise clients?',
      a: 'Yes. For banks, private equity funds, real estate developers, and wealth management offices requiring programmatic API access or custom Gujarat market dossiers, we offer bespoke Enterprise contracts.',
    },
  ];

  const comparisonFeatures = [
    { name: 'Ahmedabad Locality Price Benchmarks', free: 'Basic', personal: 'Full', investor: 'Full', professional: 'Full' },
    { name: 'Interactive Valuation Engine', free: 'Basic Range', personal: 'Detailed Comps', investor: 'Detailed Comps', professional: 'Uncapped Comps' },
    { name: 'Personal Property Vault Limit', free: '3 Properties', personal: '10 Properties', investor: '35 Properties', professional: '150 Properties' },
    { name: 'Downloadable PDF Intelligence Reports', free: '0 / month', personal: '2 / month', investor: '10 / month', professional: '50 / month' },
    { name: 'Investment Cashflow & Yield Engine', free: '—', personal: 'Standard', investor: 'Multi-Scenario', professional: 'Multi-Scenario & Sensitivity' },
    { name: 'Gujarat Stamp Duty & Loan Amortization', free: 'Standard', personal: 'Advanced', investor: 'Advanced', professional: 'Advanced' },
    { name: 'RERA Registry & Developer Track Record', free: 'Basic', personal: 'Verified', investor: 'Verified + Filings', professional: 'Full Regulatory History' },
    { name: 'Client Portfolio Segregation', free: '—', personal: '—', investor: '—', professional: 'Included' },
    { name: 'Excel / CSV Evidence Exports', free: '—', personal: '—', investor: '—', professional: 'Included' },
    { name: 'Quarterly Micro-Market Price Alerts', free: '—', personal: 'Included', investor: 'Included', professional: 'Priority Dispatch' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans">
      {/* Hero Header */}
      <section className="border-b border-[#C8C4BA] pb-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-[#547568]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
              Transparent Membership Tiers
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#202B3C] leading-tight">
            Institutional property intelligence, accessible to everyone.
          </h1>
          <p className="mt-4 text-base md:text-lg text-[#69717B] leading-relaxed">
            Choose the membership tier aligned with your portfolio. From prospective homeowners evaluating an asking price to professional real estate advisory firms managing multi-client holdings.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-white border border-[#C8C4BA] shadow-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-[#202B3C] text-white shadow-xs'
                  : 'text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-[#202B3C] text-white shadow-xs'
                  : 'text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-[#547568] text-white text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                Save ~17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REAL_ESTATE_MEMBERSHIP_PLANS.map((plan) => {
          const isAnnual = billingCycle === 'annual';
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const billingLabel = plan.monthlyPrice === 0 ? 'Free permanently' : isAnnual ? 'per year (excl. GST)' : 'per month (excl. GST)';

          return (
            <div
              key={plan.id}
              className={`relative bg-white border flex flex-col justify-between p-6 transition-shadow ${
                plan.popular
                  ? 'border-[#202B3C] shadow-md ring-1 ring-[#202B3C]'
                  : 'border-[#C8C4BA] hover:shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-6 bg-[#202B3C] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-bold text-[#202B3C]">{plan.name}</h3>
                  <p className="text-xs text-[#69717B] min-h-[32px]">{plan.tagline}</p>
                </div>

                <div className="mt-6 border-t border-[#C8C4BA]/50 pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-[#202B3C] tabular-nums">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#69717B] mt-0.5 font-mono">{billingLabel}</p>
                </div>

                <div className="mt-4 p-2.5 bg-[#F5F3ED] border border-[#C8C4BA]/40 text-[11px] text-[#202B3C]">
                  <span className="font-semibold block text-[#547568] uppercase text-[10px] font-mono">Target Profile</span>
                  {plan.targetAudience}
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-mono font-bold text-[#202B3C] uppercase tracking-wider">Plan Inclusions</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#202B3C] leading-snug">
                        <Check className="h-4 w-4 text-[#547568] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#C8C4BA]/60">
                <Link
                  href={plan.monthlyPrice === 0 ? '/signup' : `/signup?plan=${plan.id}&billing=${billingCycle}`}
                  className={`w-full h-10 px-4 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors ${
                    plan.popular
                      ? 'bg-[#202B3C] text-white hover:bg-[#151D29]'
                      : 'bg-white border border-[#202B3C] text-[#202B3C] hover:bg-[#F5F3ED]'
                  }`}
                >
                  <span>{plan.monthlyPrice === 0 ? 'Start Free Research' : `Subscribe to ${plan.name}`}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* Enterprise Custom Box */}
      <section className="bg-[#202B3C] text-white p-8 md:p-10 border border-[#202B3C] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#547568] font-mono font-semibold uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            <span>Institutional Data & Research</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            PROVENTA Enterprise & Advisory Contracts
          </h2>
          <p className="text-sm text-[#C8C4BA] leading-relaxed">
            Direct database feeds, sub-registrar transaction archives, bespoke Gujarat micro-market dossiers, and high-frequency real estate valuation APIs for lending institutions, NBFCs, private equity, and developer syndicates.
          </p>
        </div>
        <Link
          href="/about#contact"
          className="whitespace-nowrap px-6 py-3 bg-white text-[#202B3C] font-semibold text-xs uppercase tracking-wider hover:bg-[#F5F3ED] transition-colors"
        >
          Contact Advisory Desk
        </Link>
      </section>

      {/* Feature Comparison Table */}
      <section className="space-y-6">
        <div className="border-b border-[#C8C4BA] pb-3">
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Detailed Feature Comparison
          </h2>
          <p className="text-xs text-[#69717B] mt-1">
            Compare analytical capabilities across individual, investor, and institutional tiers.
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-[#C8C4BA]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C]">
                <th className="p-3.5 font-bold uppercase tracking-wider">Capability / Parameter</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Free</th>
                <th className="p-3.5 font-bold uppercase tracking-wider bg-[#202B3C]/5">Personal</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Investor</th>
                <th className="p-3.5 font-bold uppercase tracking-wider">Professional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8C4BA]/50">
              {comparisonFeatures.map((row, i) => (
                <tr key={i} className="hover:bg-[#F5F3ED]/40 transition-colors">
                  <td className="p-3.5 font-medium text-[#202B3C]">{row.name}</td>
                  <td className="p-3.5 font-mono text-[#69717B]">{row.free}</td>
                  <td className="p-3.5 font-mono font-medium text-[#202B3C] bg-[#202B3C]/5">{row.personal}</td>
                  <td className="p-3.5 font-mono text-[#202B3C]">{row.investor}</td>
                  <td className="p-3.5 font-mono font-semibold text-[#547568]">{row.professional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Regulatory & Methodology Guarantee */}
      <section className="bg-white border border-[#C8C4BA] p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#547568] uppercase tracking-wider">
          <Shield className="h-4 w-4" />
          <span>Independent Commercial Independence Pledge</span>
        </div>
        <p className="text-xs md:text-sm text-[#69717B] leading-relaxed">
          PROVENTA accepts zero advertising fees, lead-generation bounties, or transaction commissions from property developers, real estate agents, or property portals. Our revenue is derived purely from reader subscriptions and institutional data licenses. This guarantees that our price models, valuation ranges, and locality comparisons remain completely unbiased and evidence-governed.
        </p>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="border-b border-[#C8C4BA] pb-3">
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#69717B] mt-1">
            Essential operational and regulatory disclosures regarding PROVENTA memberships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-[#C8C4BA] p-5 space-y-2">
              <h3 className="text-xs font-bold text-[#202B3C] flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-[#547568] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-[#69717B] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

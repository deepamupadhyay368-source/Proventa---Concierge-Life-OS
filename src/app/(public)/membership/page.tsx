import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Info,
  Clock,
  UserCheck,
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  CANONICAL_MEMBERSHIP_PLANS,
  MEMBERSHIP_PLANS_LIST,
  MEMBERSHIP_COMPARISON_MATRIX,
  MEMBERSHIP_PAYMENT_DISCLOSURE,
} from '@/lib/membership/plans';

export const metadata: Metadata = {
  title: 'Membership & Pricing — Proventa',
  description:
    'Choose how you want Proventa to handle your life. From everyday requests to highly personal Concierge assistance.',
};

export default function MembershipPricingPage() {
  const faqs = [
    {
      q: 'What does a Proventa membership include?',
      a: "Membership covers Proventa's intelligent AI planning, request coordination, verified recommendations, and human Concierge desk execution. Whether you need dinner tables, complex travel itineraries, rare sourcing, or daily appointment scheduling, our team handles it end-to-end.",
    },
    {
      q: 'How do payments for bookings and purchases work?',
      a: "Membership covers Proventa's Concierge service. Purchases, venue deposits, flight tickets, hotel stays, and third-party services are charged separately with your explicit prior approval or through your pre-authorized mandate.",
    },
    {
      q: 'What is the difference between Select, Private, and Reserve?',
      a: 'Select (₹2,499/mo) is designed for everyday personal and professional requests with standard priority. Private (₹4,999/mo) offers priority concierge dispatch, faster response SLAs, family assistance, and bespoke planning. Reserve (₹9,999/mo) provides dedicated concierge operators, proactive lifestyle management, and highest priority queue handling.',
    },
    {
      q: 'Can I switch or cancel my plan at any time?',
      a: 'Yes. You can upgrade, downgrade, or cancel your Proventa membership at any time directly from your member profile. Changes take effect on the next billing cycle.',
    },
    {
      q: 'Is there a limit on the number of requests I can submit?',
      a: 'Members enjoy fair-use request submission for personal and family needs. For high-volume bespoke lifestyle management or family office assistance, Reserve tier is recommended.',
    },
  ];

  return (
    <div className="bg-[#F7F8FA] text-[#1F2933] min-h-screen">
      {/* Hero Header */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 border-b border-[#E1E5E8] bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-[#F1F3F5] text-[#1F2933] border border-[#E1E5E8] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#1F2933]" />
            <span>Membership Plans &amp; Tiers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#111820] max-w-4xl mx-auto leading-[1.15]">
            Choose how you want Proventa to handle your life.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#66717C] max-w-2xl mx-auto leading-relaxed">
            From everyday requests to highly personal Concierge assistance. For people who value their time.
          </p>

          {/* Payment Disclosure Banner */}
          <div className="mt-8 max-w-2xl mx-auto p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center gap-2.5 text-xs text-[#525F6C]">
            <Info className="w-4 h-4 text-[#1F2933] shrink-0" />
            <span>{MEMBERSHIP_PAYMENT_DISCLOSURE}</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {MEMBERSHIP_PLANS_LIST.map((plan) => {
            const isRecommended = plan.recommended;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl transition-all ${
                  isRecommended
                    ? 'bg-white border-2 border-[#1F2933] shadow-xl ring-1 ring-[#1F2933]/10 scale-[1.02] z-10'
                    : 'bg-white border border-[#E1E5E8] shadow-sm hover:shadow-md'
                } p-8 sm:p-10`}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1F2933] text-white text-[11px] font-semibold tracking-wider uppercase px-4 py-1 rounded-full shadow-sm">
                    Most Popular · Recommended
                  </div>
                )}

                <div>
                  {/* Tier Name & Positioning */}
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-[#111820]">
                      {plan.name}
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F3F5] text-[#525F6C] border border-[#E1E5E8]">
                      {plan.priorityLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#66717C] mt-2 italic">
                    "{plan.positioning}"
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111820]">
                      {plan.formattedPrice}
                    </span>
                    <span className="text-xs font-semibold text-[#66717C] uppercase tracking-wider">
                      {plan.cadence}
                    </span>
                  </div>

                  <p className="text-xs text-[#525F6C] mt-3 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Divider */}
                  <div className="my-6 border-t border-[#E1E5E8]" />

                  {/* Benefit Checklist */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#111820]">
                      What's Included
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#525F6C]">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isRecommended ? 'text-[#1F2933]' : 'text-[#66717C]'
                            }`}
                          />
                          <span className="text-[#1F2933] font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="mt-8 pt-6 border-t border-[#E1E5E8]">
                  <Link
                    href={`/membership/checkout?plan=${plan.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                      isRecommended
                        ? 'bg-[#1F2933] text-white hover:bg-[#111820] shadow-sm'
                        : 'bg-[#F1F3F5] text-[#1F2933] hover:bg-[#E1E5E8] border border-[#E1E5E8]'
                    }`}
                  >
                    <span>Continue with {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Matrix Section */}
      <section className="py-16 bg-white border-y border-[#E1E5E8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111820]">
              Full Tier Comparison
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#66717C]">
              Compare capabilities, priority response levels, and Concierge execution depth across plans.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E1E5E8] bg-white shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F8FA] border-b border-[#E1E5E8] text-[#111820]">
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px] w-1/2">
                    Service Capability
                  </th>
                  <th className="py-4 px-4 font-semibold text-center uppercase tracking-wider text-[11px] w-1/6">
                    SELECT<br />
                    <span className="text-[10px] font-normal text-[#66717C]">₹2,499/mo</span>
                  </th>
                  <th className="py-4 px-4 font-semibold text-center uppercase tracking-wider text-[11px] w-1/6 bg-[#F1F3F5]/60">
                    PRIVATE<br />
                    <span className="text-[10px] font-bold text-[#1F2933]">₹4,999/mo</span>
                  </th>
                  <th className="py-4 px-4 font-semibold text-center uppercase tracking-wider text-[11px] w-1/6">
                    RESERVE<br />
                    <span className="text-[10px] font-normal text-[#66717C]">₹9,999/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E5E8]">
                {MEMBERSHIP_COMPARISON_MATRIX.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-[#F7F8FA]/60 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                    }`}
                  >
                    <td className="py-3.5 px-6 font-medium text-[#1F2933]">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.select ? (
                        <Check className="w-4 h-4 text-[#10B981] mx-auto" />
                      ) : (
                        <span className="text-[#A7B0B8] text-base">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-[#F1F3F5]/40 font-semibold">
                      {row.private ? (
                        <Check className="w-4 h-4 text-[#1F2933] mx-auto stroke-[2.5]" />
                      ) : (
                        <span className="text-[#A7B0B8] text-base">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.reserve ? (
                        <Check className="w-4 h-4 text-[#10B981] mx-auto" />
                      ) : (
                        <span className="text-[#A7B0B8] text-base">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111820]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#66717C]">
            Everything you need to know about Proventa membership and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#E1E5E8] shadow-xs space-y-2"
            >
              <h3 className="text-sm font-bold text-[#111820] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1F2933] shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-[#525F6C] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-16 p-8 sm:p-10 rounded-2xl bg-[#111820] text-white text-center space-y-5 border border-[#1F2933] shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold">
            Ready to experience life, handled?
          </h3>
          <p className="text-xs sm:text-sm text-[#A7B0B8] max-w-xl mx-auto">
            Apply for Cohort 1 Early Access today and delegate your requests to Ahmedabad's premier Concierge Life OS.
          </p>
          <div className="pt-2">
            <Link
              href="/wave1"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#111820] text-xs font-semibold tracking-wider uppercase hover:bg-[#F1F3F5] transition-all shadow-sm"
            >
              <span>Request Cohort 1 Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

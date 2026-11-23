import React from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronRight, ArrowRight } from 'lucide-react';

export default function FaqPage() {
  const faqs = [
    {
      q: 'What is PROVENTA Home and how does the membership work?',
      a: 'PROVENTA Home is a household maintenance subscription. Instead of paying arbitrary callout fees every time an electrical or plumbing issue arises, you subscribe to an affordable monthly or annual plan. Depending on your tier (Essential, Family, or Premium), you receive 1, 2, or 4 included technician visits every month, covering all standard labour, diagnostics, and repairs.'
    },
    {
      q: 'Who pays for spare parts and replacement materials?',
      a: 'Labour is 100% covered under your membership visits. If replacement parts are needed (such as a new MCB, brass valve, or diverter cartridge), our technician submits a transparent digital estimate with exact market prices. Work proceeds only after you review and approve the charge in your portal.'
    },
    {
      q: 'What happens if I do not use my included monthly visits?',
      a: 'On Family and Premium plans, unused visits automatically roll over to the subsequent months (up to 2 visits for Family and 4 visits for Premium) for up to 90 days. Essential plan visits do not roll over.'
    },
    {
      q: 'How fast can a technician arrive for an emergency?',
      a: 'For urgent issues like active water pipe bursts, major electrical short circuits, or total power failure, Premium members receive emergency priority dispatch with guaranteed arrival within 90 minutes in active Ahmedabad zones.'
    },
    {
      q: 'How do you verify your technician partners?',
      a: 'Every technician undergoes four-tier screening: government Aadhaar KYC, criminal history police verification through the local police commissionerate, trade competency evaluation (ITI certification or 3+ years verified work), and a mandatory 2-hour domestic etiquette and electrical/plumbing safety briefing.'
    },
    {
      q: 'What is the 30-Day Workmanship Warranty?',
      a: 'If a repair completed by a PROVENTA technician reoccurs or fails within 30 days of completion, simply open your portal or call our helpdesk. We will dispatch a senior technician to rectify the problem completely free of charge.'
    },
    {
      q: 'Can I cancel or pause my subscription?',
      a: 'Yes. Monthly memberships can be cancelled anytime with a single click from your member portal before the next billing cycle. If you are traveling or renovating, you can pause your active membership for up to 60 days without losing accumulated benefits.'
    },
    {
      q: 'Can I book a single service without buying a membership?',
      a: 'Yes. Non-members can book one-off diagnostic visits at standard individual rates (starting from ₹399). However, becoming a member pays for itself within just one or two domestic visits.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#53634A] bg-[#53634A]/10 px-3 py-1 rounded-full border border-[#53634A]/20">
          Frequently Asked Questions
        </span>
        <h1 className="text-4xl font-bold text-[#171A17]">Common Questions Answered</h1>
        <p className="text-stone-600 text-sm">
          Everything you need to know about PROVENTA Home memberships, service coverage, and technician standards.
        </p>
      </div>

      {/* FAQ list */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E3DFD5] shadow-xs space-y-2.5">
            <h3 className="font-bold text-base text-[#171A17] flex items-start gap-2">
              <span className="text-[#53634A] font-mono text-sm shrink-0">Q.</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 pl-6 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      {/* Contact box */}
      <div className="bg-[#F2F0E9] rounded-2xl p-6 sm:p-8 border border-[#E3DFD5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base text-[#171A17]">Still have questions?</h4>
          <p className="text-xs text-stone-600">Our Ahmedabad support team is available 24/7 to assist you.</p>
        </div>
        <Link
          href="/contact"
          className="bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs shrink-0"
        >
          Contact Our Concierge
        </Link>
      </div>

    </div>
  );
}

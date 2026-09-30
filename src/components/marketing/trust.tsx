import { ShieldCheck, CheckCircle2, Lock, FileCheck, EyeOff, MapPin } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: CheckCircle2,
    title: 'Direct Provider Verification',
    description: 'Every table alcove, flight itinerary, and hotel reservation is verified on the ground with authentic references.',
  },
  {
    icon: Lock,
    title: 'Explicit Member Approval',
    description: 'No reservations finalized or payments executed without your explicit 1-click selection. Zero hidden markups.',
  },
  {
    icon: EyeOff,
    title: 'Discretion & Confidentiality',
    description: 'Your personal schedule, travel details, and notes remain strictly confidential with end-to-end access controls.',
  },
  {
    icon: FileCheck,
    title: 'Zero Fabrication Standards',
    description: 'Strict programmatic rejection of simulated or synthetic codes. Only authentic provider booking vouchers.',
  },
  {
    icon: MapPin,
    title: 'Dedicated Ground Concierge',
    description: 'Direct relationships with premier culinary directors, luxury transport fleets, and boutique hotels.',
  },
  {
    icon: ShieldCheck,
    title: 'DPDP Act 2023 Compliance',
    description: 'Full data privacy sovereignty under India’s DPDP Act, with self-serve export and data deletion controls.',
  },
];

export function TrustSection() {
  return (
    <section className="py-24 bg-white border-t border-[#E1E5E8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F8FA] border border-[#E1E5E8] text-[11px] font-semibold tracking-wider text-[#1F2933] uppercase mb-4 shadow-2xs">
            <span>Security &amp; Integrity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1F2933] mb-4">
            Founded on Discretion &amp; Trust.
          </h2>
          <p className="text-base sm:text-lg text-[#66717C] leading-relaxed">
            Delegating your time demands absolute reliability, verifiable execution, and uncompromising privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRUST_POINTS.map((tp, idx) => {
            const Icon = tp.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-[#FFFFFF] border border-[#E1E5E8] hover:border-[#A7B0B8] flex flex-col justify-between transition-all shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#F7F8FA] border border-[#E1E5E8] flex items-center justify-center text-[#1F2933] mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1F2933] mb-1.5">{tp.title}</h3>
                  <p className="text-xs sm:text-sm text-[#66717C] leading-relaxed">{tp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { ShieldCheck, CheckCircle2, Lock, FileCheck, EyeOff, MapPin } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: CheckCircle2,
    title: 'Direct Human Verification',
    description: 'Every dining alcove, bespoke itinerary, and service quotation is confirmed on the ground before presentation.',
  },
  {
    icon: Lock,
    title: 'Sovereign Member Approval',
    description: 'No funds are ever debited and no reservations finalized without your explicit review on an authorization card. Zero opaque markups.',
  },
  {
    icon: EyeOff,
    title: 'Private Discretion Protocol',
    description: 'Your personal schedule, family itineraries, and residence details remain strictly confidential under encrypted protocol.',
  },
  {
    icon: FileCheck,
    title: 'Authentic Provider Credentials',
    description: 'Every confirmation includes verified venue direct vouchers, senior manager contacts, and real reference codes.',
  },
  {
    icon: MapPin,
    title: 'Premier Ground Mastery',
    description: 'Deep relationships with premier culinary directors, luxury transport fleets, and boutique heritage retreats.',
  },
  {
    icon: ShieldCheck,
    title: 'DPDP Act 2023 Sovereignty',
    description: 'Full data privacy compliance under India’s Digital Personal Data Protection Act, with self-serve export and deletion rights.',
  },
];

export function TrustSection() {
  return (
    <section className="py-28 bg-[#f5f3ef]/40 border-t border-[#e8e2d8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full luxury-pill text-[11px] font-medium text-[#6d5941] mb-4">
            <span>OUR COMMITMENT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141312] mb-4">
            Founded on Discretion &amp; Trust.
          </h2>
          <p className="text-base sm:text-lg text-[#5a4937] leading-relaxed font-sans">
            Delegating your private time demands absolute integrity. We maintain the highest standards of personal accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_POINTS.map((tp, idx) => {
            const Icon = tp.icon;
            return (
              <div
                key={idx}
                className="luxury-card p-8 rounded-2xl flex flex-col justify-between group hover:border-[#b09a78]/50 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f5f3ef] border border-[#e8e2d8] flex items-center justify-center text-[#6d5941] group-hover:bg-[#1f1b16] group-hover:text-[#ddc8a9] transition-colors mb-6">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-serif font-medium text-[#141312] mb-2">{tp.title}</h3>
                  <p className="text-xs text-[#6e6b65] leading-relaxed font-sans">{tp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { ShieldCheck, CheckCircle2, Lock, FileCheck, EyeOff, MapPin } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: CheckCircle2,
    title: '100% Real Verification',
    description: 'Every single table, price, and schedule is directly verified with the venue in Ahmedabad by our human team before you approve.',
  },
  {
    icon: Lock,
    title: 'Your Explicit Approval Always',
    description: 'No funds are authorized and no reservations confirmed without your direct tap on an approval card. Zero hidden markups.',
  },
  {
    icon: EyeOff,
    title: 'Strict Discretion & Privacy',
    description: 'Your requests, personal schedules, and family preferences are treated with the highest confidentiality and never shared.',
  },
  {
    icon: FileCheck,
    title: 'Genuine Confirmation Codes',
    description: 'Every booking comes with real external provider references, manager contacts, and direct vouchers for your peace of mind.',
  },
  {
    icon: MapPin,
    title: 'Ahmedabad Local Knowledge',
    description: 'Direct relationships with top dining venues, luxury transport fleets, and boutique hotels across Ahmedabad and Gujarat.',
  },
  {
    icon: ShieldCheck,
    title: 'DPDP Act Data Rights',
    description: 'Built in compliance with India’s Digital Personal Data Protection Act 2023 with self-service data export and deletion.',
  },
];

export function TrustSection() {
  return (
    <section className="py-24 bg-[#fafaf9] border-t border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Our Promise</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Built on Discretion &amp; Trust.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Delegating your schedule requires absolute reliability. We hold ourselves to the highest standards of accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_POINTS.map((tp, idx) => {
            const Icon = tp.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{tp.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{tp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

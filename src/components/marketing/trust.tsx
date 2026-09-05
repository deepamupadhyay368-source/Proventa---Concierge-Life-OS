import { ShieldCheck, Lock, CheckCircle, FileText, Database, UserCheck, KeyRound } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: UserCheck,
    title: 'Zero-Hallucination Protocol',
    id: 'SEC-01',
    description: 'Every consequential reservation, price, and schedule is directly verified with the provider by our human team before approval.',
  },
  {
    icon: Lock,
    title: 'Cryptographic Consent & Approvals',
    id: 'SEC-02',
    description: 'No funds are authorized or bookings executed without your explicit in-app confirmation card. Zero hidden surcharges.',
  },
  {
    icon: Database,
    title: 'Strict Multi-Tenant Isolation',
    id: 'SEC-03',
    description: 'Your requests, personal preferences, and travel documents are encrypted with AES-256 and never shared or sold.',
  },
  {
    icon: CheckCircle,
    title: 'Real-World Proof of Fulfillment',
    id: 'SEC-04',
    description: 'Every confirmed booking contains verified external reservation codes, direct contact lines, and digital vouchers.',
  },
  {
    icon: FileText,
    title: 'Complete Auditability & Logs',
    id: 'SEC-05',
    description: 'Full immutable audit records of all AI tool executions and concierge actions are logged and exportable upon request.',
  },
  {
    icon: KeyRound,
    title: 'DPDP Act Compliance & Sovereign Data',
    id: 'SEC-06',
    description: "Architected to comply with India's Digital Personal Data Protection Act with complete data deletion rights.",
  },
];

export function TrustSection() {
  return (
    <section className="py-24 relative bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 font-mono text-xs mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SECURITY, INTEGRITY & PROTOCOL FRAMEWORK</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Engineered For <span className="tech-gradient-text">Absolute Trust</span>
          </h2>

          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base">
            Delegating sensitive portions of your schedule requires uncompromising reliability. Proventa operates under strict zero-trust principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="p-6 rounded-xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{point.id}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {point.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

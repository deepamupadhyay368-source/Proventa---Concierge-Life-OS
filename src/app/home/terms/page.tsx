import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-8 text-stone-700 text-sm leading-relaxed">
      <div className="space-y-2 border-b border-[#E3DFD5] pb-6">
        <h1 className="text-3xl font-bold text-[#171A17]">Terms of Service</h1>
        <p className="text-xs text-stone-500">Effective Date: November 2026 • PROVENTA Technologies Pvt Ltd</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">1. Introduction & Acceptance</h2>
        <p>
          Welcome to PROVENTA Home, an operating vertical of PROVENTA Technologies Pvt Ltd ("PROVENTA", "we", "us"). By accessing our website, subscribing to household memberships, or booking service visits, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">2. Nature of Membership & Services</h2>
        <p>
          PROVENTA Home provides a managed household maintenance subscription connecting registered domestic property owners and tenants with verified independent technician partners. Memberships entitle users to designated labour visits across electrical, plumbing, carpentry, and minor appliance diagnostics as detailed in their specific plan tier.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">3. Spare Parts & Material Purchases</h2>
        <p>
          Membership fees cover diagnosis, labour, and workmanship. They do not include consumable materials, replacement fixtures, copper wiring, switches, valves, or hardware parts unless explicitly specified. Technicians are prohibited from fitting any materials without presenting a transparent digital estimate and obtaining prior customer authorization via the platform.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">4. 30-Day Workmanship Warranty</h2>
        <p>
          Work completed by PROVENTA-assigned technicians carries a 30-day workmanship guarantee from the timestamp of job sign-off. If a repaired component fails due to improper installation or faulty workmanship within 30 days, PROVENTA will dispatch a technician to rectify the fault at zero diagnostic or labour charge. The warranty does not cover pre-existing structural defects, customer negligence, or external electrical surges.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">5. Technician Safety & Conduct</h2>
        <p>
          Our technician partners are independent professionals verified through government identity records and local police verification. Members are expected to treat technicians with dignity and provide a safe, accessible working environment. PROVENTA reserves the right to terminate subscriptions immediately in cases of physical abuse, verbal harassment, or unsafe domestic conditions.
        </p>
      </section>
    </div>
  );
}

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-8 text-stone-700 text-sm leading-relaxed">
      <div className="space-y-2 border-b border-[#E3DFD5] pb-6">
        <h1 className="text-3xl font-bold text-[#171A17]">Cancellation & Refund Policy</h1>
        <p className="text-xs text-stone-500">Effective Date: November 2026 • PROVENTA Technologies Pvt Ltd</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">1. Membership Cancellations</h2>
        <p>
          You may cancel your PROVENTA Home membership at any time via your Member Dashboard. Monthly subscriptions will remain active until the end of the current billing cycle and will not renew thereafter. No partial monthly refunds are issued once billing has occurred.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">2. 14-Day Cooling-Off Period (Annual Plans)</h2>
        <p>
          Subscribers to annual membership plans may request a full refund within 14 days of initial activation, provided no service visits have been consumed. If a visit has been utilised during this period, the refund will be calculated by deducting the standard non-member callout fee for the used visit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">3. Service Booking Cancellations & Rescheduling</h2>
        <p>
          Scheduled visits can be rescheduled or cancelled free of charge up to 2 hours before the start of the confirmed arrival window. Cancellations made after a technician has been dispatched or is en route may result in the deduction of one included monthly visit entitlement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">4. Workmanship Dispute & Rework Guarantee</h2>
        <p>
          If you are dissatisfied with a repair or service quality, our primary remedy is our 30-Day Workmanship Guarantee, under which we dispatch a senior lead technician to inspect and redo the work at no extra charge. If the issue cannot be resolved satisfactorily, you may request a refund for any additional material or service charges paid.
        </p>
      </section>
    </div>
  );
}

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-8 text-stone-700 text-sm leading-relaxed">
      <div className="space-y-2 border-b border-[#E3DFD5] pb-6">
        <h1 className="text-3xl font-bold text-[#171A17]">Privacy Policy</h1>
        <p className="text-xs text-stone-500">Effective Date: November 2026 • PROVENTA Technologies Pvt Ltd</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">1. Information We Collect</h2>
        <p>
          To deliver household maintenance services, PROVENTA collects your name, contact phone number, residential address, apartment/society details, email address, payment identifiers, and service history (including uploaded issue photographs and maintenance passport records).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">2. How Your Information is Used</h2>
        <p>
          We use your data strictly to dispatch verified local technicians to your home, process subscription renewals, maintain your digital Home Maintenance Passport, notify you of warranty updates, and resolve service queries.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">3. Data Sharing & Security</h2>
        <p>
          Your residential address and phone number are shared solely with the specific verified technician assigned to your confirmed booking during the active service window. We do not sell, rent, or lease your domestic data to third-party advertisers or lead-generation brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#171A17]">4. Data Retention</h2>
        <p>
          Household maintenance records and appliance warranty logs in your Home Maintenance Passport are retained for the lifetime of your account so that property owners can transfer or view complete repair histories when renovating or selling property.
        </p>
      </section>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[11px] font-mono font-bold text-[#547568] uppercase tracking-wider">
          Regulatory Governance
        </span>
        <h1 className="font-editorial text-3xl md:text-4xl font-normal text-[#202B3C] mt-2">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-xs text-[#69717B] font-mono mt-2">
          Effective Date: 01 October 2026 | In compliance with India Digital Personal Data Protection Act (DPDPA), 2023
        </p>
      </div>

      <div className="space-y-8 text-xs md:text-sm text-[#202B3C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-normal text-[#202B3C]">1. Introduction & Scope</h2>
          <p className="text-[#69717B]">
            PROVENTA Real Estate Intelligence (&quot;PROVENTA&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting the privacy and confidentiality of our users. This policy governs how we collect, store, process, and safeguard personal and property data across our platform (`proventa.in`) and associated mobile/API services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-normal text-[#202B3C]">2. Personal Property Vault Encryption & Privacy</h2>
          <p className="text-[#69717B]">
            Data uploaded to the <strong>Personal Property Vault</strong>—including sale deeds, tax receipts, loan schedules, and private property addresses—is treated as strictly confidential User-Submitted Data.
          </p>
          <ul className="list-disc pl-5 text-[#69717B] space-y-1">
            <li>Vault files are stored in private, server-side encrypted storage with time-limited signed URL access tokens.</li>
            <li>We do not sell, rent, or syndicate individual user vault data to third-party brokers, lenders, or marketing agencies.</li>
            <li>Individual user properties and documents are never displayed publicly or shared with other platform subscribers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-normal text-[#202B3C]">3. Public Real Estate Data Sources</h2>
          <p className="text-[#69717B]">
            All public property intelligence, project profiles, and locality benchmarks published by PROVENTA are derived exclusively from lawful public records, statutory Gujarat RERA regulatory filings, town-planning layouts under AUDA/GUDA, and recorded sub-registrar transaction indices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-normal text-[#202B3C]">4. User Rights Under DPDPA 2023</h2>
          <p className="text-[#69717B]">
            As a data principal under Indian data protection law, you retain the right to:
          </p>
          <ul className="list-disc pl-5 text-[#69717B] space-y-1">
            <li>Request a summary of personal data held by PROVENTA.</li>
            <li>Export your Personal Property Vault records and uploaded documents at any time.</li>
            <li>Request the correction of inaccurate personal profile data.</li>
            <li>Request complete erasure of your account and personal vault records.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-normal text-[#202B3C]">5. Contact Data Protection Officer</h2>
          <p className="text-[#69717B]">
            For data privacy inquiries or to exercise your rights of erasure or rectification, contact our Data Protection Officer at:
          </p>
          <div className="p-4 bg-white border border-[#C8C4BA] font-mono text-xs text-[#202B3C]">
            Data Protection Officer, PROVENTA Real Estate Intelligence<br />
            Email: privacy@proventa.in<br />
            SG Highway Corridor, Ahmedabad, Gujarat 380054, India.
          </div>
        </section>
      </div>
    </div>
  );
}

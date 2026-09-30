import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-[#111820] text-[#A7B0B8] py-16 font-sans border-t border-[#1F2933]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white">PROVENTA</span>
            </div>
            <p className="text-[11px] font-semibold text-[#A7B0B8] tracking-wider uppercase">
              Concierge Life OS · Private Beta
            </p>
            <p className="text-xs text-[#8795A1] leading-relaxed max-w-sm">
              The premier personal concierge service combining fast modern technology with verified resident concierges on the ground in Ahmedabad.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </p>
            <ul className="space-y-2.5 text-xs text-[#8795A1]">
              <li><Link href="/services/dining" className="hover:text-white transition-colors">Fine Dining &amp; Tables</Link></li>
              <li><Link href="/services/travel" className="hover:text-white transition-colors">Curated Stays &amp; Travel</Link></li>
              <li><Link href="/services/shopping" className="hover:text-white transition-colors">Luxury Sourcing &amp; Gifting</Link></li>
              <li><Link href="/services/experiences" className="hover:text-white transition-colors">Events &amp; Cultural Access</Link></li>
              <li><Link href="/services/home" className="hover:text-white transition-colors">Estate &amp; Residence Care</Link></li>
              <li><Link href="/what-we-handle" className="hover:text-white transition-colors">All Capabilities</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Organization
            </p>
            <ul className="space-y-2.5 text-xs text-[#8795A1]">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">The Operating Model</Link></li>
              <li><Link href="/membership" className="hover:text-white transition-colors font-medium text-[#E1E5E8]">Membership &amp; Pricing</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Proventa</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Member FAQ</Link></li>
              <li><Link href="/wave1" className="hover:text-white transition-colors">Wave 1 Early Access</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Concierge Desk</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Legal, Privacy &amp; Trust
            </p>
            <ul className="space-y-2.5 text-xs text-[#8795A1]">
              <li><Link href="/legal" className="hover:text-white transition-colors font-semibold text-[#E5E9ED]">Legal &amp; Trust Hub</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/private-beta" className="hover:text-white transition-colors">Private Beta Terms</Link></li>
              <li><Link href="/legal/concierge-terms" className="hover:text-white transition-colors">Concierge Service Terms</Link></li>
              <li><Link href="/legal/payments" className="hover:text-white transition-colors">Payment Terms &amp; Security</Link></li>
              <li><Link href="/legal/ai" className="hover:text-white transition-colors">AI &amp; Automation Disclosure</Link></li>
              <li><Link href="/legal/refunds" className="hover:text-white transition-colors">Cancellation &amp; Refund Policy</Link></li>
              <li><Link href="/legal/privacy-requests" className="hover:text-white transition-colors">Data Rights &amp; Export</Link></li>
              <li><Link href="/legal/grievance" className="hover:text-white transition-colors">Grievance &amp; Redressal Desk</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1F2933] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#66717C]">
          <p>
            &copy; {new Date().getFullYear()} Proventa. Founder-led venture in Ahmedabad, Gujarat, India. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Privacy Desk: <a href="mailto:privacy@proventa.in" className="text-[#A7B0B8] hover:text-white transition-colors underline">privacy@proventa.in</a></span>
            <span>Concierge: <a href="mailto:concierge@proventa.in" className="text-[#A7B0B8] hover:text-white transition-colors underline">concierge@proventa.in</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

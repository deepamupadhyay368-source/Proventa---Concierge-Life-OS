import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-[#141312] text-[#b8b4ad] py-16 font-sans border-t border-[#29221b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif tracking-tight text-white font-normal">PROVENTA</span>
            </div>
            <p className="text-[11px] font-medium text-[#ddc8a9] tracking-widest uppercase">
              Concierge Life OS · Private Beta
            </p>
            <p className="text-xs text-[#8a8680] leading-relaxed max-w-sm">
              The discreet personal concierge service combining fast modern technology with verified human concierges on the ground in Ahmedabad.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#faf8f5] uppercase tracking-wider mb-4">
              Services
            </p>
            <ul className="space-y-2.5 text-xs text-[#8a8680]">
              <li><Link href="/services/dining" className="hover:text-[#ddc8a9] transition-colors">Fine Dining &amp; Tables</Link></li>
              <li><Link href="/services/travel" className="hover:text-[#ddc8a9] transition-colors">Curated Stays &amp; Travel</Link></li>
              <li><Link href="/services/shopping" className="hover:text-[#ddc8a9] transition-colors">Luxury Sourcing &amp; Gifting</Link></li>
              <li><Link href="/services/experiences" className="hover:text-[#ddc8a9] transition-colors">Events &amp; Cultural Access</Link></li>
              <li><Link href="/services/home" className="hover:text-[#ddc8a9] transition-colors">Estate &amp; Residence Care</Link></li>
              <li><Link href="/what-we-handle" className="hover:text-[#ddc8a9] transition-colors">All Capabilities</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#faf8f5] uppercase tracking-wider mb-4">
              Organization
            </p>
            <ul className="space-y-2.5 text-xs text-[#8a8680]">
              <li><Link href="/how-it-works" className="hover:text-[#ddc8a9] transition-colors">The Operating Model</Link></li>
              <li><Link href="/about" className="hover:text-[#ddc8a9] transition-colors">About Proventa</Link></li>
              <li><Link href="/faq" className="hover:text-[#ddc8a9] transition-colors">Member FAQ</Link></li>
              <li><Link href="/wave1" className="hover:text-[#ddc8a9] transition-colors">Wave 1 Early Access</Link></li>
              <li><Link href="/contact" className="hover:text-[#ddc8a9] transition-colors">Concierge Desk</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#faf8f5] uppercase tracking-wider mb-4">
              Legal, Privacy &amp; Trust
            </p>
            <ul className="space-y-2.5 text-xs text-[#8a8680]">
              <li><Link href="/legal" className="hover:text-[#ddc8a9] transition-colors font-medium text-[#c8b99d]">Legal &amp; Trust Hub</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#ddc8a9] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-[#ddc8a9] transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/private-beta" className="hover:text-[#ddc8a9] transition-colors">Private Beta Terms</Link></li>
              <li><Link href="/legal/concierge-terms" className="hover:text-[#ddc8a9] transition-colors">Concierge Service Terms</Link></li>
              <li><Link href="/legal/payments" className="hover:text-[#ddc8a9] transition-colors">Payment Terms &amp; Security</Link></li>
              <li><Link href="/legal/ai" className="hover:text-[#ddc8a9] transition-colors">AI &amp; Automation Disclosure</Link></li>
              <li><Link href="/legal/refunds" className="hover:text-[#ddc8a9] transition-colors">Cancellation &amp; Refund Policy</Link></li>
              <li><Link href="/legal/privacy-requests" className="hover:text-[#ddc8a9] transition-colors">Data Rights &amp; Export</Link></li>
              <li><Link href="/legal/grievance" className="hover:text-[#ddc8a9] transition-colors">Grievance &amp; Redressal Desk</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#24201a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e6b65]">
          <p>
            &copy; {new Date().getFullYear()} Proventa. Founder-led venture in Ahmedabad, Gujarat, India. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Privacy Desk: <a href="mailto:privacy@proventa.in" className="text-[#b09a78] hover:text-[#ddc8a9] transition-colors underline">privacy@proventa.in</a></span>
            <span>Concierge: <a href="mailto:concierge@proventa.in" className="text-[#b09a78] hover:text-[#ddc8a9] transition-colors underline">concierge@proventa.in</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

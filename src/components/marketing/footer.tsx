import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tight">PROVENTA</span>
            </div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Concierge Life OS · Ahmedabad
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              The private personal concierge service combining fast modern technology with dedicated human concierges on the ground in Ahmedabad.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Services
            </p>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/services/dining" className="hover:text-white transition-colors">Dining &amp; Reservations</Link></li>
              <li><Link href="/services/travel" className="hover:text-white transition-colors">Travel &amp; Escapes</Link></li>
              <li><Link href="/services/shopping" className="hover:text-white transition-colors">Shopping &amp; Gifting</Link></li>
              <li><Link href="/services/experiences" className="hover:text-white transition-colors">Events &amp; Experiences</Link></li>
              <li><Link href="/services/home" className="hover:text-white transition-colors">Home &amp; Living</Link></li>
              <li><Link href="/what-we-handle" className="hover:text-white transition-colors">All Services</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Proventa</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/wave1" className="hover:text-white transition-colors">Apply for Wave 1</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Concierge Desk</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Privacy &amp; Security
            </p>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
              <li><Link href="/trust" className="hover:text-white transition-colors">Trust &amp; Verification</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy (DPDP Act)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          <p>&copy; {new Date().getFullYear()} Proventa Technologies. All rights reserved. Ahmedabad, Gujarat, India.</p>
          <div className="flex items-center gap-6">
            <span>Direct Support: <a href="mailto:proventa.in@gmail.com" className="text-neutral-300 hover:text-white underline">proventa.in@gmail.com</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

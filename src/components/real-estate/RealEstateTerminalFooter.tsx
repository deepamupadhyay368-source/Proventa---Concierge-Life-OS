import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';

export function RealEstateTerminalFooter() {
  return (
    <footer className="bg-[#080E18] text-[#AAB6C5] border-t border-[#29384B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#101A29] border border-[#29384B] flex items-center justify-center rounded-xs">
                <Building2 className="w-4 h-4 text-[#D7AD69]" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.18em] text-[#F5F7FA]">PROVENTA</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#4D9FFF]">
                  Real Estate Intelligence
                </div>
              </div>
            </div>
            <p className="text-xs text-[#AAB6C5] leading-relaxed max-w-sm">
              Institutional real estate intelligence infrastructure for property owners, buyers, investors, developers, and advisors across Ahmedabad, Gandhinagar, GIFT City, and Gujarat.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#D7AD69]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Know Every Property. Understand Every Market.</span>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#748398] font-semibold">
              Intelligence Layers
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/property-intelligence" className="hover:text-[#F5F7FA] transition-colors">Living Property Registry</Link></li>
              <li><Link href="/market-intelligence" className="hover:text-[#F5F7FA] transition-colors">Market &amp; Locality Intelligence</Link></li>
              <li><Link href="/project-intelligence" className="hover:text-[#F5F7FA] transition-colors">Project &amp; RERA Intelligence</Link></li>
              <li><Link href="/investment-intelligence" className="hover:text-[#F5F7FA] transition-colors">Investment &amp; IRR Analysis</Link></li>
              <li><Link href="/price" className="hover:text-[#F5F7FA] transition-colors">12-Factor Valuation Engine</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#748398] font-semibold">
              Property OS &amp; Terminal
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/property-os" className="hover:text-[#F5F7FA] transition-colors">Digital Property Passport</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#F5F7FA] transition-colors">Authenticated Terminal</Link></li>
              <li><Link href="/dashboard/watchlist" className="hover:text-[#F5F7FA] transition-colors">Watchlists &amp; Alerts</Link></li>
              <li><Link href="/reports" className="hover:text-[#F5F7FA] transition-colors">Intelligence Reports</Link></li>
              <li><Link href="/pricing" className="hover:text-[#F5F7FA] transition-colors">Subscriptions &amp; Plans</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#748398] font-semibold">
              Governance
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-[#F5F7FA] transition-colors">About PROVENTA</Link></li>
              <li><Link href="/methodology" className="hover:text-[#F5F7FA] transition-colors">Methodology</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#F5F7FA] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-[#F5F7FA] transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-[#F5F7FA] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#29384B] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#748398]">
          <span>&copy; {new Date().getFullYear()} PROVENTA Real Estate Intelligence. All rights reserved.</span>
          <span className="font-mono">Ahmedabad &bull; Gandhinagar &bull; GIFT City &bull; Sanand &bull; Changodar</span>
        </div>
      </div>
    </footer>
  );
}

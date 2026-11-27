import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';

export function RealEstateTerminalFooter() {
  return (
    <footer className="bg-[#0F172A] text-[#CBD5E1] border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1E293B] border border-[#0D9488]/60 flex items-center justify-center rounded-xs">
                <Building2 className="w-4 h-4 text-[#2DD4BF]" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.16em] text-white">PROVENTA</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#2DD4BF]">
                  Real Estate Intelligence
                </div>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              Institutional real estate intelligence infrastructure for property owners, buyers, investors, developers, and advisors across Ahmedabad, Gandhinagar, and Gujarat.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#2DD4BF]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Know Every Property. Understand Every Market.</span>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#94A3B8] font-semibold">
              Intelligence Layers
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/property-intelligence" className="hover:text-white">Living Property Registry</Link></li>
              <li><Link href="/market-intelligence" className="hover:text-white">Market &amp; Locality Intelligence</Link></li>
              <li><Link href="/project-intelligence" className="hover:text-white">Project &amp; RERA Intelligence</Link></li>
              <li><Link href="/investment-intelligence" className="hover:text-white">Investment &amp; IRR Analysis</Link></li>
              <li><Link href="/price" className="hover:text-white">12-Factor Valuation Engine</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#94A3B8] font-semibold">
              Property OS &amp; Terminal
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/property-os" className="hover:text-white">Digital Property Passport</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Authenticated Terminal</Link></li>
              <li><Link href="/dashboard/watchlist" className="hover:text-white">Watchlists &amp; Alerts</Link></li>
              <li><Link href="/reports" className="hover:text-white">Intelligence Reports</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Subscriptions &amp; Plans</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#94A3B8] font-semibold">
              Governance
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-white">About PROVENTA</Link></li>
              <li><Link href="/methodology" className="hover:text-white">Methodology</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#64748B]">
          <span>&copy; {new Date().getFullYear()} PROVENTA Real Estate Intelligence. All rights reserved.</span>
          <span className="font-mono">Ahmedabad &bull; Gandhinagar &bull; GIFT City &bull; Gujarat</span>
        </div>
      </div>
    </footer>
  );
}

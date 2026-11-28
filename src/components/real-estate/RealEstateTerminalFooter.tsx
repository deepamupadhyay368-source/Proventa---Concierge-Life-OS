import Link from 'next/link';

export function RealEstateTerminalFooter() {
  return (
    <footer className="bg-[#F7F8FA] text-[#697586] border-t border-[#E8EBEF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-4">
            <div className="leading-none">
              <div className="text-base font-bold tracking-[0.18em] text-[#202B38]">PROVENTA</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#A58A61] mt-1">
                Real Estate Intelligence
              </div>
            </div>
            <p className="text-xs text-[#697586] leading-relaxed max-w-sm">
              Independent, evidence-governed real estate intelligence for property owners, institutional buyers, investors, developers, and advisors across Ahmedabad, Gandhinagar, and Gujarat.
            </p>
            <p className="text-[11px] font-medium text-[#29465F]">
              Understand Property. See Beyond Location.
            </p>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#202B38]">
              Intelligence
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/property-intelligence" className="hover:text-[#202B38] transition-colors">Property Intelligence</Link></li>
              <li><Link href="/market-intelligence" className="hover:text-[#202B38] transition-colors">Market Intelligence</Link></li>
              <li><Link href="/location-intelligence" className="hover:text-[#202B38] transition-colors">Location Intelligence</Link></li>
              <li><Link href="/project-intelligence" className="hover:text-[#202B38] transition-colors">Project Intelligence</Link></li>
              <li><Link href="/investment-intelligence" className="hover:text-[#202B38] transition-colors">Investment Intelligence</Link></li>
              <li><Link href="/price" className="hover:text-[#202B38] transition-colors">12-Factor Valuation</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#202B38]">
              Workspace &amp; Reports
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dashboard" className="hover:text-[#202B38] transition-colors">Member Dashboard</Link></li>
              <li><Link href="/property-os" className="hover:text-[#202B38] transition-colors">Property OS</Link></li>
              <li><Link href="/dashboard/watchlist" className="hover:text-[#202B38] transition-colors">Watchlists &amp; Alerts</Link></li>
              <li><Link href="/reports" className="hover:text-[#202B38] transition-colors">Intelligence Reports</Link></li>
              <li><Link href="/pricing" className="hover:text-[#202B38] transition-colors">Pricing &amp; Plans</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#202B38]">
              Company &amp; Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-[#202B38] transition-colors">About PROVENTA</Link></li>
              <li><Link href="/methodology" className="hover:text-[#202B38] transition-colors">Methodology</Link></li>
              <li><Link href="/contact" className="hover:text-[#202B38] transition-colors">Contact</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#202B38] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-[#202B38] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E8EBEF] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#929BA6]">
          <span>&copy; {new Date().getFullYear()} PROVENTA Real Estate Intelligence. All rights reserved.</span>
          <span>Ahmedabad &bull; Gandhinagar &bull; GIFT City &bull; Gujarat, India</span>
        </div>
      </div>
    </footer>
  );
}

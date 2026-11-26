import Link from 'next/link';

export function RealEstateFooter() {
  return (
    <footer className="border-t border-[#C8C4BA] bg-[#202B3C] text-white font-sans mt-24">
      {/* Upper Footer: Editorial Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand & Proposition (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-sans text-xl font-black tracking-[0.16em] uppercase text-white block leading-none">
                PROVENTA
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.28em] text-[#C8C4BA] block mt-1">
                Real Estate Intelligence
              </span>
            </Link>
            <p className="text-xs text-[#C8C4BA] leading-relaxed max-w-sm">
              An independent property data and research institution. Helping buyers, owners, and investors understand property prices, evaluate transactions, and maintain private records.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[#C8C4BA]/80 space-y-1">
              <div>Primary Coverage: Ahmedabad Urban Development Authority (AUDA)</div>
              <div>State Registry: Gujarat Real Estate Regulatory Authority (GujRERA)</div>
            </div>
          </div>

          {/* Links: Intelligence Products (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-white border-b border-[#323E51] pb-2">
              Intelligence Divisions
            </h4>
            <ul className="space-y-2 text-xs text-[#C8C4BA]">
              <li>
                <Link href="/price" className="hover:text-white transition-colors">
                  PROVENTA PRICE (Valuations)
                </Link>
              </li>
              <li>
                <Link href="/location-intelligence" className="hover:text-white transition-colors">
                  Location & Market Research
                </Link>
              </li>
              <li>
                <Link href="/project-intelligence" className="hover:text-white transition-colors">
                  RERA Project Profiles
                </Link>
              </li>
              <li>
                <Link href="/investment-intelligence" className="hover:text-white transition-colors">
                  Investment & Yield Analytics
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-white transition-colors">
                  Quarterly Research Publications
                </Link>
              </li>
              <li>
                <Link href="/dashboard/property-vault" className="hover:text-white transition-colors">
                  Personal Property Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Governance & Methodology (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-white border-b border-[#323E51] pb-2">
              Governance & Framework
            </h4>
            <ul className="space-y-2 text-xs text-[#C8C4BA]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About PROVENTA & Independence
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-white transition-colors">
                  Valuation Methodology (6 Pillars)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Membership Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & DPDPA 2023
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service & Usage
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Advisory (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-white border-b border-[#323E51] pb-2">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-[#C8C4BA]">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Member Portal
                </Link>
              </li>
              <li>
                <Link href="/professional" className="hover:text-white transition-colors">
                  Advisory Firm Console
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Administration Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Classification Legend */}
        <div className="mt-12 pt-8 border-t border-[#323E51] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-mono text-[#C8C4BA]">
          <div>
            <span className="text-white font-bold block uppercase tracking-wider">VERIFIED</span>
            Direct sub-registrar deeds & GujRERA filings.
          </div>
          <div>
            <span className="text-white font-bold block uppercase tracking-wider">SOURCE-REPORTED</span>
            Developer sanction maps & municipal layouts.
          </div>
          <div>
            <span className="text-white font-bold block uppercase tracking-wider">MODEL-ESTIMATED</span>
            Hedonic quality regression estimates.
          </div>
          <div>
            <span className="text-white font-bold block uppercase tracking-wider">USER-SUBMITTED</span>
            Private, AES-256 encrypted vault records.
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="mt-8 pt-6 border-t border-[#323E51] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#C8C4BA]/70">
          <p className="max-w-3xl leading-relaxed">
            &copy; {new Date().getFullYear()} PROVENTA Real Estate Intelligence. All rights reserved. PROVENTA produces independent mathematical market research. Figures do not constitute statutory valuation certificates or legal guarantees.
          </p>
          <div className="font-mono text-[10px] uppercase tracking-wider whitespace-nowrap text-[#C8C4BA]">
            Ahmedabad &bull; Gandhinagar
          </div>
        </div>
      </div>
    </footer>
  );
}

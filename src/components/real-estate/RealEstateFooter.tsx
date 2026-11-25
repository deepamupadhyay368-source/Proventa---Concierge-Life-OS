import Link from 'next/link';

export function RealEstateFooter() {
  return (
    <footer className="border-t border-[#C8C4BA] bg-[#F5F3ED] text-[#202B3C] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-xl font-black tracking-wider uppercase text-[#202B3C]">
                PROVENTA
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568] mt-0.5">
                Real Estate Intelligence
              </p>
            </Link>
            <p className="text-xs text-[#69717B] mt-4 leading-relaxed max-w-sm">
              Independent property intelligence, valuation modeling and locality market research for Indian real estate.
            </p>
            <p className="text-[11px] font-mono text-[#69717B] mt-3">
              Pilot Metropolitan Focus: Ahmedabad & Gandhinagar, Gujarat.
            </p>
          </div>

          {/* Column: Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202B3C] mb-3">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs text-[#69717B]">
              <li>
                <Link href="/property-intelligence" className="hover:text-[#202B3C] transition-colors">
                  Property Prices
                </Link>
              </li>
              <li>
                <Link href="/location-intelligence" className="hover:text-[#202B3C] transition-colors">
                  Locality Research
                </Link>
              </li>
              <li>
                <Link href="/project-intelligence" className="hover:text-[#202B3C] transition-colors">
                  Project Registry
                </Link>
              </li>
              <li>
                <Link href="/investment-intelligence" className="hover:text-[#202B3C] transition-colors">
                  Investment Calculator
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-[#202B3C] transition-colors">
                  Market Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Organization */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202B3C] mb-3">
              Organization
            </h4>
            <ul className="space-y-2 text-xs text-[#69717B]">
              <li>
                <Link href="/about" className="hover:text-[#202B3C] transition-colors">
                  About PROVENTA
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-[#202B3C] transition-colors">
                  Valuation Methodology
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#202B3C] transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard/property-vault" className="hover:text-[#202B3C] transition-colors">
                  Personal Property Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Legal & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202B3C] mb-3">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[#69717B]">
              <li>
                <Link href="/privacy" className="hover:text-[#202B3C] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#202B3C] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Regulatory Disclaimer */}
        <div className="mt-12 pt-8 border-t border-[#C8C4BA]/60 space-y-3">
          <p className="text-[11px] text-[#69717B] leading-relaxed">
            <strong>Institutional Disclaimer:</strong> PROVENTA provides algorithmic valuation estimates, comparable transaction evidence, and independent market intelligence for informational and research purposes only. Estimates do not constitute a statutory valuation certificate under the Wealth Tax Act or Companies Act, nor legal title certification or certified banking panel appraisal. Users must independently verify official registry documents and RERA filings before entering binding transactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#69717B] pt-2">
            <p>&copy; {new Date().getFullYear()} PROVENTA Real Estate Intelligence. All rights reserved.</p>
            <p className="font-mono text-[10px]">Data Classification: Evidentiary & Model-Estimated</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Building2, ShieldCheck } from 'lucide-react';

export function ProcurementFooter() {
  return (
    <footer className="bg-[#172B3A] text-[#E9ECEF] border-t border-[#292F3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#292F3D] border border-[#C9A45B]/40 flex items-center justify-center rounded-xs">
                <Building2 className="w-4 h-4 text-[#C9A45B]" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.14em] text-white">PROVENTA</div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C9A45B]">
                  Construction Procurement
                </div>
              </div>
            </div>
            <p className="text-xs text-[#C5CFD8] leading-relaxed max-w-sm">
              An intelligent procurement infrastructure platform for real estate developers, EPC contractors, and verified building material suppliers across Ahmedabad, Gandhinagar, and Gujarat.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#C9A45B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Source better. Compare smarter. Procure with confidence.</span>
            </div>
          </div>

          {/* Buyer Modules */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A45B] font-semibold">
              Buyer Platform
            </h3>
            <ul className="space-y-2 text-xs text-[#C5CFD8]">
              <li><Link href="/buyer/dashboard" className="hover:text-white transition-colors">Buyer Command Desk</Link></li>
              <li><Link href="/buyer/projects" className="hover:text-white transition-colors">Project Management</Link></li>
              <li><Link href="/buyer/requirements" className="hover:text-white transition-colors">Procurement Requirements</Link></li>
              <li><Link href="/rfq/new" className="hover:text-white transition-colors">Create Construction RFQ</Link></li>
              <li><Link href="/buyer/comparison" className="hover:text-white transition-colors">Intelligent Comparison Centre</Link></li>
              <li><Link href="/buyer/analytics" className="hover:text-white transition-colors">Savings Intelligence</Link></li>
            </ul>
          </div>

          {/* Supplier Modules */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A45B] font-semibold">
              Supplier Network
            </h3>
            <ul className="space-y-2 text-xs text-[#C5CFD8]">
              <li><Link href="/for-suppliers" className="hover:text-white transition-colors">For Suppliers & Distributors</Link></li>
              <li><Link href="/supplier/register" className="hover:text-white transition-colors">Register as Verified Supplier</Link></li>
              <li><Link href="/supplier/dashboard" className="hover:text-white transition-colors">Supplier Workspace</Link></li>
              <li><Link href="/supplier/rfqs" className="hover:text-white transition-colors">Open Construction RFQs</Link></li>
              <li><Link href="/buyer/catalogue" className="hover:text-white transition-colors">Material Taxonomy</Link></li>
              <li><Link href="/pilot/pacifica" className="hover:text-white transition-colors">Institutional Pilot Program</Link></li>
            </ul>
          </div>

          {/* Governance & Legal */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A45B] font-semibold">
              Governance
            </h3>
            <ul className="space-y-2 text-xs text-[#C5CFD8]">
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/security" className="hover:text-white transition-colors">Security & Controls</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Enterprise Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#292F3D] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#9AA7B4]">
          <span>&copy; {new Date().getFullYear()} PROVENTA Construction Procurement &amp; Intelligence. All rights reserved.</span>
          <span className="font-mono">Ahmedabad &bull; Gandhinagar &bull; Gujarat Construction Markets</span>
        </div>
      </div>
    </footer>
  );
}

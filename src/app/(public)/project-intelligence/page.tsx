import Link from 'next/link';
import { CANONICAL_PROJECTS } from '@/lib/real-estate/constants';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function ProjectIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
          Gujarat RERA & Developer Intelligence
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight mt-1">
          Project Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Structured developer profiles, RERA registration verifications, carpet area specifications, and delivery status across premier Ahmedabad and Gandhinagar residential developments.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CANONICAL_PROJECTS.map((proj) => (
          <div
            key={proj.id}
            className="bg-white border border-[#C8C4BA] p-6 space-y-5 hover:border-[#202B3C] transition-colors flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-[#C8C4BA]/50 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#547568]">
                    {proj.localityName}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-[#202B3C] tracking-tight">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-[#69717B] mt-0.5">By {proj.developer}</p>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                  {proj.verifiedDataStatus}
                </span>
              </div>

              {/* RERA Notice */}
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#69717B] font-mono block">
                  Gujarat RERA Registration
                </span>
                <span className="text-[11px] font-mono text-[#202B3C] break-all select-all font-semibold">
                  {proj.reraRegistrationNumber}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Configurations</span>
                  <span className="font-semibold text-[#202B3C]">{proj.configurations.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Carpet Range</span>
                  <span className="font-semibold text-[#202B3C] tabular-nums">{proj.carpetAreaRange.min} – {proj.carpetAreaRange.max} sq ft</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Price Bracket</span>
                  <span className="font-bold text-[#547568] tabular-nums">₹{proj.priceRangeLakhs.min}L – ₹{proj.priceRangeLakhs.max}L</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Open Space</span>
                  <span className="text-[#202B3C] tabular-nums">{proj.openSpaceRatioPercent}% Ratio</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#C8C4BA]/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#69717B] font-mono">
                Verified: {proj.lastVerifiedDate}
              </span>
              <Link
                href={`/property-intelligence?project=${encodeURIComponent(proj.name)}&locality=${proj.localitySlug}`}
                className="font-bold text-[#202B3C] hover:text-[#547568] inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px]"
              >
                <span>Evaluate Units</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* RERA Transparency Statement */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-2 text-xs text-[#69717B]">
        <div className="flex items-center gap-2 font-bold text-[#202B3C] uppercase text-[11px] tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#547568]" />
          <span>Independent RERA Verification Standard</span>
        </div>
        <p className="leading-relaxed">
          PROVENTA aggregates public Gujarat RERA regulatory filings and verified on-site structural observation data. We do not represent project promoters or endorse any specific builder. Possession timelines and structural specifications should be verified directly with the Gujarat Real Estate Regulatory Authority.
        </p>
      </div>

    </div>
  );
}

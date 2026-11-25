'use client';

import React, { useState } from 'react';
import { AHMEDABAD_LOCALITIES, CANONICAL_PROJECTS } from '@/lib/real-estate/constants';
import { calculatePropertyValuation, ValuationQuery, ValuationResult } from '@/lib/real-estate/valuation';
import { 
  Building2, 
  MapPin, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

const INITIAL_QUERY: ValuationQuery = {
  state: 'Gujarat',
  city: 'Ahmedabad',
  localitySlug: 'south-bopal',
  propertyType: 'APARTMENT',
  projectName: 'Aarohi Elegance',
  carpetAreaSqFt: 1050,
  builtUpAreaSqFt: 1350,
  superBuiltUpAreaSqFt: 1550,
  bedrooms: 3,
  bathrooms: 3,
  floor: 6,
  totalFloors: 14,
  propertyAgeYears: 2,
  propertyCondition: 'EXCELLENT',
  parkingSpaces: 1,
  furnishingStatus: 'SEMI_FURNISHED',
  sellerAskingPriceLakhs: 72,
};

export default function PropertyIntelligencePage() {
  const [formData, setFormData] = useState<ValuationQuery>(INITIAL_QUERY);
  const [valuationResult, setValuationResult] = useState<ValuationResult>(() => calculatePropertyValuation(INITIAL_QUERY));
  const [loading, setLoading] = useState(false);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = calculatePropertyValuation(formData);
      setValuationResult(res);
      setLoading(false);
    }, 200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
          Algorithmic Pricing Model &bull; Gujarat Metropolitan Registry
        </span>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight mt-1">
          Property Price Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Algorithmic, evidence-based property valuation calculated on usable carpet area, verified Sub-Registrar comparable transactions, building floor differentials, and micro-market absorption metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#C8C4BA] p-6 space-y-6 shadow-xs">
          <div className="border-b border-[#C8C4BA] pb-3 flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#547568]" />
              <span>Property Parameters</span>
            </h2>
            <span className="text-[10px] font-mono text-[#69717B]">Step 1 of 2</span>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            
            {/* Locality & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Locality *</label>
                <select
                  value={formData.localitySlug}
                  onChange={(e) => setFormData({ ...formData, localitySlug: e.target.value })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                >
                  {AHMEDABAD_LOCALITIES.map((loc) => (
                    <option key={loc.slug} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Property Type *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                >
                  <option value="APARTMENT">Apartment (High-rise)</option>
                  <option value="VILLA">Gated Villa</option>
                  <option value="INDEPENDENT_HOUSE">Independent House</option>
                  <option value="PENTHOUSE">Penthouse</option>
                </select>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block font-semibold text-[#202B3C] mb-1">Project or Society Name</label>
              <input
                type="text"
                value={formData.projectName || ''}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g. Aarohi Elegance, Shilp Revanta, Takshashila Air"
                className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
              />
            </div>

            {/* Carpet Area vs Super Built-up (Strict Distinction) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F5F3ED] border border-[#C8C4BA]/50">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#202B3C]">RERA Carpet Area *</label>
                  <span className="text-[10px] font-mono text-[#547568] font-bold">Basis</span>
                </div>
                <input
                  type="number"
                  value={formData.carpetAreaSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, carpetAreaSqFt: Number(e.target.value) })}
                  placeholder="e.g. 1050"
                  required
                  className="w-full h-9 bg-white border border-[#C8C4BA] px-3 font-mono text-[#202B3C] focus:outline-hidden"
                />
                <span className="text-[10px] text-[#69717B] block mt-0.5">Net usable square feet</span>
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Super Built-up (Ref.)</label>
                <input
                  type="number"
                  value={formData.superBuiltUpAreaSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, superBuiltUpAreaSqFt: Number(e.target.value) })}
                  placeholder="e.g. 1550"
                  className="w-full h-9 bg-white border border-[#C8C4BA] px-3 font-mono text-[#69717B] focus:outline-hidden"
                />
                <span className="text-[10px] text-[#69717B] block mt-0.5">Includes society loading</span>
              </div>
            </div>

            {/* Configuration: Bedrooms & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Bedrooms (BHK)</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C]"
                >
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5+ BHK</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Property Age</label>
                <select
                  value={formData.propertyAgeYears}
                  onChange={(e) => setFormData({ ...formData, propertyAgeYears: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C]"
                >
                  <option value={1}>0 - 2 Years (New)</option>
                  <option value={5}>3 - 7 Years</option>
                  <option value={10}>8 - 15 Years</option>
                  <option value={20}>15+ Years</option>
                </select>
              </div>
            </div>

            {/* Floor Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Property Floor</label>
                <input
                  type="number"
                  value={formData.floor || ''}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Total Floors in Tower</label>
                <input
                  type="number"
                  value={formData.totalFloors || ''}
                  onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                />
              </div>
            </div>

            {/* Condition & Furnishing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Condition</label>
                <select
                  value={formData.propertyCondition}
                  onChange={(e) => setFormData({ ...formData, propertyCondition: e.target.value as any })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C]"
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="AVERAGE">Average</option>
                  <option value="NEEDS_RENOVATION">Needs Renovation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Furnishing</label>
                <select
                  value={formData.furnishingStatus}
                  onChange={(e) => setFormData({ ...formData, furnishingStatus: e.target.value as any })}
                  className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C]"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>
            </div>

            {/* Seller Asking Price */}
            <div>
              <label className="block font-semibold text-[#202B3C] mb-1">
                Seller Asking Price (Optional &bull; ₹ Lakhs)
              </label>
              <input
                type="number"
                value={formData.sellerAskingPriceLakhs || ''}
                onChange={(e) => setFormData({ ...formData, sellerAskingPriceLakhs: Number(e.target.value) })}
                placeholder="e.g. 75"
                className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono focus:outline-hidden"
              />
              <span className="text-[10px] text-[#69717B] block mt-0.5">
                We compare asking prices against recorded deed transactions.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#151D29] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>{loading ? 'Recalculating Valuation Model...' : 'Calculate Property Valuation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Valuation Report Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#C8C4BA] p-6 sm:p-8 space-y-8 shadow-xs">
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#C8C4BA] pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
                  PROVENTA Institutional Valuation Dossier
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#202B3C] tracking-tight mt-1">
                  {formData.projectName || `${formData.bedrooms} BHK Unit`} &bull; {valuationResult.locality.name}
                </h3>
                <p className="text-xs text-[#69717B] mt-1 font-mono">
                  Basis: {valuationResult.carpetAreaSqFt} sq ft usable carpet &bull; {valuationResult.lastUpdated}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#547568]/10 border border-[#547568]/30 text-xs font-mono font-bold text-[#547568]">
                <ShieldCheck className="w-4 h-4" />
                <span>{valuationResult.confidenceScore}% Confidence</span>
              </div>
            </div>

            {/* Core Output Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-mono">
                  Estimated Value Range
                </span>
                <div className="text-xl font-bold text-[#202B3C] font-mono mt-1 tabular-nums">
                  ₹{valuationResult.estimatedValueRange.min}L – ₹{valuationResult.estimatedValueRange.max}L
                </div>
                <span className="text-[10px] text-[#69717B] font-mono">Midpoint: ₹{valuationResult.estimatedMidpointLakhs} Lakhs</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-mono">
                  Normalized Rate
                </span>
                <div className="text-xl font-bold text-[#547568] font-mono mt-1 tabular-nums">
                  ₹{valuationResult.estimatedPricePerSqFt.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#69717B] font-mono">per sq ft carpet</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B] block font-mono">
                  Monthly Rent Estimate
                </span>
                <div className="text-xl font-bold text-[#202B3C] font-mono mt-1 tabular-nums">
                  ₹{valuationResult.indicativeRentalRangeMonthly.min.toLocaleString('en-IN')} – ₹{valuationResult.indicativeRentalRangeMonthly.max.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-[#69717B] font-mono">Yield: {valuationResult.locality.grossRentalYield}%</span>
              </div>
            </div>

            {/* Asking Price Comparison */}
            {valuationResult.askingPriceAssessment && (
              <div className="p-4 border border-[#C8C4BA] bg-white text-xs space-y-1.5 font-mono">
                <div className="font-bold text-[#202B3C] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#547568]" />
                  <span>Asking Price Analysis:</span>
                </div>
                <p className="text-[#69717B] leading-relaxed">
                  Seller asking price of <strong className="text-[#202B3C]">₹{formData.sellerAskingPriceLakhs} Lakhs</strong> is{' '}
                  <strong className={valuationResult.askingPriceAssessment.differencePercent > 5 ? 'text-amber-800' : 'text-[#547568]'}>
                    {valuationResult.askingPriceAssessment.differencePercent > 0 ? '+' : ''}{valuationResult.askingPriceAssessment.differencePercent}%
                  </strong>{' '}
                  relative to our modeled midpoint of ₹{valuationResult.estimatedMidpointLakhs} Lakhs.
                </p>
                <div className="pt-1 text-[#202B3C]">
                  Indicative Negotiation Target: <strong className="tabular-nums">₹{valuationResult.indicativeNegotiationRangeLakhs.min} – ₹{valuationResult.indicativeNegotiationRangeLakhs.max} Lakhs</strong> (Modeled Value: ₹{valuationResult.estimatedValueRange.min}L – ₹{valuationResult.estimatedValueRange.max}L).
                </div>
              </div>
            )}

            {/* Transaction Evidence Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C]">
                  Recorded Sub-Registrar Transaction Evidence
                </span>
                <span className="text-[10px] font-mono text-[#547568] font-bold">100% VERIFIED</span>
              </div>

              <div className="border border-[#C8C4BA] overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono text-[10px]">
                      <th className="p-2.5 font-bold uppercase">Deed ID</th>
                      <th className="p-2.5 font-bold uppercase">Date</th>
                      <th className="p-2.5 font-bold uppercase">Project / Scheme</th>
                      <th className="p-2.5 font-bold uppercase tabular-nums">Carpet</th>
                      <th className="p-2.5 font-bold uppercase tabular-nums">Registered Value</th>
                      <th className="p-2.5 font-bold uppercase tabular-nums">Rate/Sq.Ft</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DFD6] font-mono text-[11px]">
                    {(valuationResult.comparableTransactions || []).map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                        <td className="p-2.5 font-bold text-[#202B3C]">{tx.id}</td>
                        <td className="p-2.5 text-[#69717B]">{tx.date}</td>
                        <td className="p-2.5 font-sans font-medium text-[#202B3C]">{tx.projectName}</td>
                        <td className="p-2.5 text-[#202B3C] tabular-nums">{tx.carpetAreaSqFt} sq ft</td>
                        <td className="p-2.5 text-[#202B3C] tabular-nums">₹{tx.transactedPriceLakhs} L</td>
                        <td className="p-2.5 font-bold text-[#547568] tabular-nums">₹{tx.pricePerSqFtCarpet.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assumptions & Disclaimers */}
            <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] space-y-2 text-[11px] text-[#69717B] leading-relaxed">
              <strong className="text-[#202B3C] font-mono uppercase block text-[10px]">
                Valuation Methodology & Disclosures:
              </strong>
              <p>
                Calculated on hedonic adjustments benchmarked against observed sub-registrar deeds in {valuationResult.locality.name}. PROVENTA valuations represent independent empirical research and do not constitute statutory valuation certificates under IBBI or court solvency guarantees.
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C8C4BA]">
              <span className="text-[11px] font-mono text-[#69717B]">
                Document ID: PR-VAL-{(valuationResult.carpetAreaSqFt * 73).toString(16).toUpperCase()}
              </span>
              <button
                onClick={() => alert(`Generating institutional PDF valuation dossier for ${formData.projectName || 'Property'}`)}
                className="h-9 px-4 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#151D29]"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Dossier (PDF)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

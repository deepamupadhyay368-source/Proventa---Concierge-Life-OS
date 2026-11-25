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

export default function PropertyIntelligencePage() {
  const [formData, setFormData] = useState<ValuationQuery>({
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
  });

  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = calculatePropertyValuation(formData);
      setValuationResult(res);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="border-b border-[#C8C4BA] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#547568]">
          Flagship Valuation Engine
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#202B3C] tracking-tight mt-1">
          Property Price Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-[#69717B] mt-2 max-w-3xl leading-relaxed">
          Algorithmic, evidence-based property valuation calculated on usable carpet area, verified Sub-Registrar comparable transactions, building floor differentials, and micro-market absorption metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-5 bg-white border border-[#C8C4BA] p-6 rounded-xs shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202B3C] border-b border-stone-200 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#547568]" />
            <span>Property Characteristics</span>
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            
            {/* Locality & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Locality *</label>
                <select
                  value={formData.localitySlug}
                  onChange={(e) => setFormData({ ...formData, localitySlug: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
                >
                  <option value="APARTMENT">Apartment / Flat</option>
                  <option value="VILLA">Gated Villa</option>
                  <option value="INDEPENDENT_HOUSE">Independent Bungalow</option>
                  <option value="PLOT">Residential Plot</option>
                  <option value="COMMERCIAL">Commercial Office</option>
                </select>
              </div>
            </div>

            {/* Project / Society Name */}
            <div>
              <label className="block font-semibold text-[#202B3C] mb-1">Project or Society Name</label>
              <input
                type="text"
                placeholder="e.g. Aarohi Elegance, Shilp Revanta"
                value={formData.projectName || ''}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
              />
            </div>

            {/* Area Fields */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">
                  Carpet (Sq.Ft) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.carpetAreaSqFt}
                  onChange={(e) => setFormData({ ...formData, carpetAreaSqFt: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Built-Up</label>
                <input
                  type="number"
                  value={formData.builtUpAreaSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, builtUpAreaSqFt: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#69717B] mb-1">Super Built-Up</label>
                <input
                  type="number"
                  value={formData.superBuiltUpAreaSqFt || ''}
                  onChange={(e) => setFormData({ ...formData, superBuiltUpAreaSqFt: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-2 text-[#202B3C] font-mono focus:outline-none focus:ring-1 focus:ring-[#202B3C]"
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Bedrooms</label>
                <select
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C]"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C]"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202B3C] mb-1">Total Floors in Tower</label>
                <input
                  type="number"
                  value={formData.totalFloors || ''}
                  onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C]"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C]"
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
                placeholder="e.g. 75"
                value={formData.sellerAskingPriceLakhs || ''}
                onChange={(e) => setFormData({ ...formData, sellerAskingPriceLakhs: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-[#202B3C] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#202B3C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#151D29] transition-all rounded-xs cursor-pointer disabled:opacity-60 mt-4"
            >
              {loading ? 'Evaluating Evidence...' : 'Generate Valuation Assessment'}
            </button>
          </form>
        </div>

        {/* Right: Valuation Report Output */}
        <div className="lg:col-span-7 space-y-6">
          {valuationResult ? (
            <div className="bg-white border border-[#C8C4BA] p-6 sm:p-8 rounded-xs shadow-xs space-y-8">
              
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568]">
                    PROVENTA Institutional Valuation Assessment
                  </span>
                  <h3 className="text-2xl font-black text-[#202B3C] tracking-tight mt-0.5">
                    {formData.projectName || `${formData.bedrooms} BHK Property`} &bull; {valuationResult.locality.name}
                  </h3>
                  <p className="text-xs text-[#69717B] mt-0.5">
                    Modeled on {valuationResult.carpetAreaSqFt} sq.ft carpet area &bull; {valuationResult.lastUpdated}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-xs text-[11px] font-mono font-semibold text-[#202B3C]">
                  <ShieldCheck className="w-4 h-4 text-[#547568]" />
                  <span>{valuationResult.confidenceScore}% Confidence</span>
                </div>
              </div>

              {/* Core Output Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#F5F3ED] border border-[#C8C4BA] rounded-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B]">
                    Estimated Value Range
                  </span>
                  <div className="text-xl font-black text-[#202B3C] font-mono mt-1">
                    ₹{valuationResult.estimatedValueRange.min}L – ₹{valuationResult.estimatedValueRange.max}L
                  </div>
                  <span className="text-[10px] text-[#69717B] font-mono">Midpoint: ₹{valuationResult.estimatedMidpointLakhs} Lakhs</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B]">
                    Normalized Rate
                  </span>
                  <div className="text-xl font-black text-[#547568] font-mono mt-1">
                    ₹{valuationResult.estimatedPricePerSqFt.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#69717B] font-mono">per sq.ft carpet</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#69717B]">
                    Indicative Monthly Rent
                  </span>
                  <div className="text-xl font-black text-[#202B3C] font-mono mt-1">
                    ₹{valuationResult.indicativeRentalRangeMonthly.min.toLocaleString('en-IN')} – ₹{valuationResult.indicativeRentalRangeMonthly.max.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-[#69717B] font-mono">Yield: {valuationResult.locality.grossRentalYield}%</span>
                </div>
              </div>

              {/* Asking Price Comparison (if provided) */}
              {valuationResult.askingPriceAssessment && (
                <div className={`p-4 border rounded-xs text-xs space-y-1.5 ${
                  valuationResult.askingPriceAssessment.verdict === 'PREMIUM_ASKING'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : valuationResult.askingPriceAssessment.verdict === 'VALUE_BUY'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-stone-50 border-stone-200 text-[#202B3C]'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>Asking Price Comparison Assessment:</span>
                  </div>
                  <p>
                    Seller is asking <strong>₹{valuationResult.askingPriceAssessment.sellerPriceLakhs} Lakhs</strong>, which is 
                    {' '}<strong>{Math.abs(valuationResult.askingPriceAssessment.differenceLakhs)} Lakhs ({valuationResult.askingPriceAssessment.differencePercent > 0 ? '+' : ''}{valuationResult.askingPriceAssessment.differencePercent}%)</strong> 
                    {' '}{valuationResult.askingPriceAssessment.differencePercent > 0 ? 'above' : 'below'} our algorithmic midpoint benchmark.
                  </p>
                  <p className="text-[11px] font-mono text-stone-600">
                    Recommended negotiation entry bracket: ₹{valuationResult.indicativeNegotiationRangeLakhs.min}L – ₹{valuationResult.indicativeNegotiationRangeLakhs.max}L.
                  </p>
                </div>
              )}

              {/* Comparable Properties Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202B3C]">
                  Recent Comparable Transaction Evidence
                </h4>
                <div className="border border-stone-200 rounded-xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-[#69717B] uppercase font-mono">
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Carpet Size</th>
                        <th className="py-2.5 px-3">Final Value</th>
                        <th className="py-2.5 px-3">Rate / Sq.Ft</th>
                        <th className="py-2.5 px-3">Evidence Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-[#202B3C]">
                      {valuationResult.comparableProperties.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/60">
                          <td className="py-2.5 px-3 font-medium">{comp.title}</td>
                          <td className="py-2.5 px-3 font-mono">{comp.sizeSqFt} sq.ft</td>
                          <td className="py-2.5 px-3 font-mono font-bold">₹{comp.priceLakhs}L</td>
                          <td className="py-2.5 px-3 font-mono">₹{comp.priceSqFt}</td>
                          <td className="py-2.5 px-3 text-[11px] text-[#69717B]">{comp.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assumptions & Disclaimers */}
              <div className="pt-4 border-t border-stone-200 space-y-3 text-xs text-[#69717B]">
                <div>
                  <h5 className="font-bold text-[#202B3C] uppercase text-[10px] tracking-wider mb-1">
                    Valuation Assumptions
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {valuationResult.valuationAssumptions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-[#202B3C] uppercase text-[10px] tracking-wider mb-1">
                    Data Limitations & Statutory Notice
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {valuationResult.dataLimitations.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <Link
                  href="/dashboard/property-vault"
                  className="text-xs font-bold text-[#547568] hover:underline"
                >
                  Save this valuation snapshot to Personal Vault →
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-[#202B3C] rounded-xs cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download / Print Valuation PDF</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-[#C8C4BA] p-12 text-center rounded-xs space-y-3 bg-white/40">
              <Building2 className="w-10 h-10 text-[#C8C4BA] mx-auto" />
              <h3 className="text-base font-bold text-[#202B3C]">
                Ready to Evaluate Property Price
              </h3>
              <p className="text-xs text-[#69717B] max-w-sm mx-auto">
                Fill in the property characteristics on the left and click "Generate Valuation Assessment" to view empirical price ranges, comparables and negotiation brackets.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Lock,
  Compass,
  Scale,
  Sparkles,
} from 'lucide-react';

interface LocalityItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  avgPriceSqFt: number | null;
  coverageLevel: string;
  valuationReady: boolean;
  projects: Array<{
    id: string;
    slug: string;
    name: string;
    developer: string | null;
    buildingType: string | null;
    possessionStatus: string | null;
  }>;
}

export default function ProventaPricePage() {
  const router = useRouter();

  // Wizard state (1 to 5)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [localities, setLocalities] = useState<LocalityItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Location
    state: 'Gujarat',
    city: 'Ahmedabad',
    localityId: '',
    projectId: '',
    customProjectName: '',
    address: '',
    pincode: '',

    // Step 2: Property Type
    propertyType: 'APARTMENT',

    // Step 3: Configuration
    bhk: '3',
    carpetAreaSqFt: '1050',
    builtUpAreaSqFt: '1350',
    superBuiltUpAreaSqFt: '',
    floor: '5',
    totalFloors: '14',
    propertyAgeYears: '3',
    condition: 'EXCELLENT',
    furnishingStatus: 'SEMI_FURNISHED',
    parkingSpaces: '1',

    // Step 4: Transaction Context & Contact
    transactionContext: 'BUYING',
    askingPriceLakhs: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });

  // Fetch verified localities
  useEffect(() => {
    async function fetchLocalities() {
      try {
        const res = await fetch('/api/price/localities');
        const data = await res.json();
        if (data.success && data.localities) {
          setLocalities(data.localities);
          if (data.localities.length > 0 && !formData.localityId) {
            setFormData((prev) => ({
              ...prev,
              localityId: data.localities[0].id,
              pincode: data.localities[0].pincode,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load localities:', err);
      }
    }
    fetchLocalities();
  }, []);

  const selectedLocality = localities.find((l) => l.id === formData.localityId);
  const availableProjects = selectedLocality?.projects || [];

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    const loc = localities.find((l) => l.id === locId);
    setFormData((prev) => ({
      ...prev,
      localityId: locId,
      projectId: '',
      pincode: loc?.pincode || prev.pincode,
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.localityId) {
        setErrorMsg('Please select a supported residential locality.');
        return false;
      }
      if (!formData.address.trim() || formData.address.trim().length < 5) {
        setErrorMsg('Please enter a specific property address, building, or society name.');
        return false;
      }
    }
    if (currentStep === 3) {
      const carpet = parseFloat(formData.carpetAreaSqFt);
      if (isNaN(carpet) || carpet < 150) {
        setErrorMsg('Please enter a valid carpet area (minimum 150 sq.ft.).');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
        setErrorMsg('Please provide a valid email address to receive your valuation dossier.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/price/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit property parameters.');
      }

      router.push(data.redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check inputs and retry.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="border-b border-[#C8C4BA] pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#547568]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568]">
              PROVENTA PRICE &bull; RESIDENTIAL VALUATION DOSSIER
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#202B3C]">
            Independent Property Valuation
          </h1>
          <p className="text-sm sm:text-base text-[#69717B] mt-2 max-w-2xl leading-relaxed">
            Evidence-backed residential market valuation derived from registered Sub-Registrar deeds, GujRERA carpet area filings, and empirical micro-market adjustments.
          </p>

          {/* Stepper Progress */}
          <div className="mt-8 grid grid-cols-5 gap-2 border-t border-[#C8C4BA] pt-4">
            {[
              { num: 1, label: 'Location' },
              { num: 2, label: 'Type' },
              { num: 3, label: 'Specs' },
              { num: 4, label: 'Context' },
              { num: 5, label: 'Review' },
            ].map((s) => (
              <div key={s.num} className="space-y-1">
                <div
                  className={`h-1.5 transition-colors ${
                    step >= s.num ? 'bg-[#202B3C]' : 'bg-[#C8C4BA]'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block ${
                    step === s.num ? 'text-[#202B3C] font-bold' : 'text-[#69717B]'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Card Form */}
        <div className="bg-white border border-[#C8C4BA] shadow-xs p-6 sm:p-10 space-y-8">
          
          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2DFD8] pb-3">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#547568]" />
                  <span>Step 1: Property Location & Micro-Market</span>
                </h2>
                <p className="text-xs text-[#69717B] mt-1">
                  Valuation is currently active for Ahmedabad Western Corridors (South Bopal, Shela, Gota, Science City).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">State</label>
                  <input
                    type="text"
                    disabled
                    value={formData.state}
                    className="w-full h-10 bg-[#F5F3ED] border border-[#C8C4BA] px-3 text-[#202B3C] font-mono text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">City</label>
                  <input
                    type="text"
                    disabled
                    value={formData.city}
                    className="w-full h-10 bg-[#F5F3ED] border border-[#C8C4BA] px-3 text-[#202B3C] font-mono text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Locality *</label>
                  <select
                    value={formData.localityId}
                    onChange={handleLocalityChange}
                    className="w-full h-11 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C] font-medium"
                  >
                    {localities.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.valuationReady ? 'Verified Coverage Ready' : 'Coverage Expanding'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">
                    Project / Society Name (Optional if standalone)
                  </label>
                  {availableProjects.length > 0 ? (
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full h-11 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                    >
                      <option value="">-- Select Verified Project or Choose Other --</option>
                      {availableProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.developer ? `(by ${p.developer})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Aarohi Elegance, Riviera Springs"
                      value={formData.customProjectName}
                      onChange={(e) => setFormData({ ...formData, customProjectName: e.target.value })}
                      className="w-full h-11 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Specific Address / Tower & Unit *</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Flat 602, Tower B, Aarohi Elegance, Near South Bopal Canal Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-[#C8C4BA] p-3 text-[#202B3C] focus:outline-hidden focus:border-[#202B3C]"
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block font-semibold text-[#202B3C] mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 text-[#202B3C] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROPERTY TYPE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2DFD8] pb-3">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#547568]" />
                  <span>Step 2: Property Classification</span>
                </h2>
                <p className="text-xs text-[#69717B] mt-1">
                  Select the structural typology. Valuation models differ across collective multi-family vs individual land formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    type: 'APARTMENT',
                    title: 'Residential High-rise Apartment',
                    desc: 'Unit within a multi-storey gated community or society with shared amenities.',
                  },
                  {
                    type: 'VILLA',
                    title: 'Gated Community Villa',
                    desc: 'Independent bungalow or villa unit located in a planned private community.',
                  },
                  {
                    type: 'INDEPENDENT_HOUSE',
                    title: 'Independent Tenement / House',
                    desc: 'Freehold residential structure on an independent plot.',
                  },
                  {
                    type: 'ROW_HOUSE',
                    title: 'Row House',
                    desc: 'Contiguous multi-level residential dwelling with shared sidewalls.',
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, propertyType: item.type })}
                    className={`p-5 text-left border transition-all ${
                      formData.propertyType === item.type
                        ? 'border-[#202B3C] bg-[#202B3C]/5 ring-1 ring-[#202B3C]'
                        : 'border-[#C8C4BA] bg-white hover:border-[#69717B]'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#202B3C] flex items-center justify-between">
                      <span>{item.title}</span>
                      {formData.propertyType === item.type && (
                        <CheckCircle2 className="w-4 h-4 text-[#547568]" />
                      )}
                    </div>
                    <p className="text-xs text-[#69717B] mt-1.5 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: PROPERTY CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2DFD8] pb-3">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#547568]" />
                  <span>Step 3: Area Dimensions & Technical Specifications</span>
                </h2>
                <p className="text-xs text-[#69717B] mt-1">
                  Valuations are calibrated exclusively on usable <strong>Carpet Area</strong> as mandated by RERA.
                </p>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-[#547568]/10 border border-[#547568]/30 text-xs text-[#202B3C] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#547568] shrink-0" />
                <span>
                  <strong>Strict Non-Conflation Rule:</strong> Never enter Super Built-up area as Carpet area. Carpet area represents the net usable floor area bounded by internal walls.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">BHK Configuration *</label>
                  <select
                    value={formData.bhk}
                    onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="2.5">2.5 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="3.5">3.5 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">
                    Carpet Area (Sq.Ft) * <span className="text-[#547568] font-mono">(Legal Baseline)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.carpetAreaSqFt}
                    onChange={(e) => setFormData({ ...formData, carpetAreaSqFt: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono font-bold text-[#202B3C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">
                    Built-up Area (Sq.Ft) <span className="text-[#69717B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1350"
                    value={formData.builtUpAreaSqFt}
                    onChange={(e) => setFormData({ ...formData, builtUpAreaSqFt: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Floor Number</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Building Age (Years)</label>
                  <input
                    type="number"
                    value={formData.propertyAgeYears}
                    onChange={(e) => setFormData({ ...formData, propertyAgeYears: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Dedicated Parking</label>
                  <select
                    value={formData.parkingSpaces}
                    onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  >
                    <option value="0">0 (Open/Visitor only)</option>
                    <option value="1">1 Covered Slot</option>
                    <option value="2">2 Covered Slots</option>
                    <option value="3">3+ Slots</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Physical Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3"
                  >
                    <option value="NEW_CONSTRUCTION">New Construction (Under 1 year)</option>
                    <option value="EXCELLENT">Excellent (Immaculate maintenance)</option>
                    <option value="GOOD">Good (Normal minor wear)</option>
                    <option value="FAIR">Fair (Habitable, requires minor repairs)</option>
                    <option value="NEEDS_RENOVATION">Needs Full Renovation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Furnishing Status</label>
                  <select
                    value={formData.furnishingStatus}
                    onChange={(e) => setFormData({ ...formData, furnishingStatus: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3"
                  >
                    <option value="UNFURNISHED">Unfurnished (Bare shell / basic fixtures)</option>
                    <option value="SEMI_FURNISHED">Semi-Furnished (Modular kitchen, wardrobes, A/C)</option>
                    <option value="FULLY_FURNISHED">Fully Furnished (Turnkey designer fittings)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TRANSACTION CONTEXT & CLIENT INFO */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2DFD8] pb-3">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#547568]" />
                  <span>Step 4: Transaction Context & Delivery Coordinates</span>
                </h2>
                <p className="text-xs text-[#69717B] mt-1">
                  Specify your assessment objective to receive targeted negotiation and yield analysis.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">Assessment Purpose</label>
                  <select
                    value={formData.transactionContext}
                    onChange={(e) => setFormData({ ...formData, transactionContext: e.target.value })}
                    className="w-full h-11 bg-white border border-[#C8C4BA] px-3"
                  >
                    <option value="BUYING">Prospective Buyer (Negotiation & Offer Validation)</option>
                    <option value="SELLING">Property Owner (Listing Strategy & Reserve Pricing)</option>
                    <option value="EXISTING_OWNERSHIP">Portfolio Owner (Net Worth & Equity Monitoring)</option>
                    <option value="INVESTMENT_RESEARCH">Investor (Rental Yield & Capital Appreciation Study)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202B3C] mb-1">
                    Seller Asking Price or Target Offer (₹ Lakhs) <span className="text-[#69717B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 72.5"
                    value={formData.askingPriceLakhs}
                    onChange={(e) => setFormData({ ...formData, askingPriceLakhs: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                  <p className="text-[11px] text-[#69717B] mt-1">
                    If entered, the report calculates an empirical negotiation variance against verified deed prices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2DFD8]">
                  <div>
                    <label className="block font-semibold text-[#202B3C] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajiv Shah"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full h-10 bg-white border border-[#C8C4BA] px-3"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#202B3C] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajiv@shahinvestments.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block font-semibold text-[#202B3C] mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98250 12345"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full h-10 bg-white border border-[#C8C4BA] px-3 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW PARAMETERS */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2DFD8] pb-3">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#547568]" />
                  <span>Step 5: Review Property Specifications</span>
                </h2>
                <p className="text-xs text-[#69717B] mt-1">
                  Confirm accuracy before generating the pre-payment evidence coverage preview.
                </p>
              </div>

              <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-5 space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#C8C4BA] pb-3">
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Locality</span>
                    <span className="font-bold text-[#202B3C] text-sm">{selectedLocality?.name}</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Property Type</span>
                    <span className="font-bold text-[#202B3C] text-sm">{formData.propertyType}</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">BHK Layout</span>
                    <span className="font-bold text-[#202B3C] text-sm">{formData.bhk} BHK</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Carpet Area</span>
                    <span className="font-bold text-[#547568] text-sm">{formData.carpetAreaSqFt} Sq.Ft</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#C8C4BA] pb-3">
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Floor / Total</span>
                    <span className="text-[#202B3C]">{formData.floor} / {formData.totalFloors}</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Age</span>
                    <span className="text-[#202B3C]">{formData.propertyAgeYears} Years</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Condition</span>
                    <span className="text-[#202B3C]">{formData.condition}</span>
                  </div>
                  <div>
                    <span className="text-[#69717B] block text-[10px] uppercase">Parking</span>
                    <span className="text-[#202B3C]">{formData.parkingSpaces} Covered</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#69717B] block text-[10px] uppercase">Address</span>
                  <span className="text-[#202B3C] font-sans font-medium">{formData.address}</span>
                </div>

                <div>
                  <span className="text-[#69717B] block text-[10px] uppercase">Recipient Email</span>
                  <span className="text-[#202B3C] font-bold">{formData.contactEmail}</span>
                </div>
              </div>

              {/* Paywall Disclosure Notice */}
              <div className="p-4 bg-white border border-[#C8C4BA] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#202B3C]">
                  <Lock className="w-4 h-4 text-[#547568]" />
                  <span>Institutional Paywall & Evidence Disclosure</span>
                </div>
                <p className="text-[#69717B] leading-relaxed">
                  Upon submission, you will see a transparent <strong>Report Coverage Preview</strong> outlining the verified registered deed count, active portal listings, and methodology parameters available for this micro-market.
                </p>
                <p className="text-[#69717B] leading-relaxed">
                  The complete valuation band, transacted comparable prices, and downloadable institutional PDF report are unlocked immediately upon payment verification (₹999 inclusive of GST).
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="border-t border-[#E2DFD8] pt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="h-11 px-5 border border-[#C8C4BA] text-xs font-mono uppercase tracking-wider text-[#202B3C] hover:bg-[#F5F3ED] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-11 px-6 bg-[#202B3C] text-white text-xs font-mono uppercase tracking-wider hover:bg-[#202B3C]/90 transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="h-11 px-8 bg-[#547568] text-white text-xs font-mono uppercase tracking-wider font-bold hover:bg-[#547568]/90 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Preview...</span>
                ) : (
                  <>
                    <span>Generate Evidence Preview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

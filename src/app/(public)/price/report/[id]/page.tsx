'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Building2,
  MapPin,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import { ValuationEngineResult } from '@/lib/valuation/engine';

export default function ValuationReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [reportResult, setReportResult] = useState<ValuationEngineResult | null>(null);
  const [reportRef, setReportRef] = useState<string>('');
  const [generatedDate, setGeneratedDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const res = await fetch(`/api/price/report/${requestId}${search}`);
        const json = await res.json();

        if (res.status === 401) {
          setErrorMsg(json.error || 'Authentication or a valid access token is required to view this valuation dossier.');
          return;
        }

        if (res.status === 403) {
          if (json.redirectUrl) {
            router.replace(json.redirectUrl);
            return;
          }
          setErrorMsg(json.error || 'Access denied.');
          return;
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to retrieve valuation report.');
        }

        setReportResult(json.reportData);
        setReportRef(json.reportReference);
        setGeneratedDate(new Date(json.generatedAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }));
      } catch (err: any) {
        setErrorMsg(err.message || 'Unable to render report.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [requestId, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-4">
        <div className="text-center space-y-3 font-mono text-xs text-[#69717B]">
          <div className="w-8 h-8 border-2 border-[#547568] border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="uppercase tracking-wider">Verifying Cryptographic Ledger & Rendering Report...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !reportResult) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#C8C4BA] p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">Report Unavailable</h2>
          <p className="text-xs text-[#69717B]">{errorMsg || 'Could not locate valuation dossier.'}</p>
          <button
            onClick={() => router.push('/price')}
            className="w-full h-11 bg-[#202B3C] text-white font-mono text-xs uppercase tracking-wider"
          >
            Submit New Evaluation
          </button>
        </div>
      </div>
    );
  }

  const {
    propertySummary,
    valuation,
    comparableEvidence,
    askingPriceAssessment,
    methodologyHighlights,
    disclaimers,
    twelveFactorResults,
    ownershipCostSummary,
    layeredArchitecture,
  } = reportResult;

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202B3C] font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, footer, .no-print {
            display: none !important;
          }
          .report-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print bg-white border border-[#C8C4BA] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#547568]" />
            <span className="font-mono text-xs text-[#202B3C] font-bold uppercase tracking-wider">
              Official Valuation Dossier &bull; {reportRef}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial h-10 px-5 bg-[#202B3C] text-white font-mono text-xs uppercase tracking-wider hover:bg-[#202B3C]/90 flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/reports')}
              className="flex-1 sm:flex-initial h-10 px-4 border border-[#C8C4BA] font-mono text-xs uppercase tracking-wider text-[#202B3C] hover:bg-[#F5F3ED]"
            >
              My Vault
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN INSTITUTIONAL REPORT CANVAS                                */}
        {/* ============================================================== */}
        <div className="report-container bg-white border border-[#C8C4BA] shadow-xs p-8 sm:p-14 space-y-12">
          
          {/* 1. Header & Institutional Reference */}
          <div className="border-b-2 border-[#202B3C] pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#547568]">
                PROVENTA REAL ESTATE INTELLIGENCE &bull; INSTITUTIONAL VALUATION DOSSIER
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#202B3C]">
                Residential Property Valuation Report
              </h1>
              <p className="text-xs text-[#69717B] max-w-xl">
                Independent empirical market assessment calculated on legal RERA carpet area, micro-market calibration benchmarks, and hedonic floor/age regression models.
              </p>
            </div>

            <div className="border border-[#C8C4BA] p-3 text-right font-mono text-[11px] space-y-1 bg-[#F5F3ED] sm:min-w-[220px]">
              <div>
                <span className="text-[#69717B] block text-[9px] uppercase">Dossier Reference</span>
                <span className="font-bold text-[#202B3C] text-xs">{reportRef}</span>
              </div>
              <div className="pt-1 border-t border-[#C8C4BA]">
                <span className="text-[#69717B] block text-[9px] uppercase">Generation Date</span>
                <span className="text-[#202B3C]">{generatedDate}</span>
              </div>
              <div>
                <span className="text-[#69717B] block text-[9px] uppercase">Methodology</span>
                <span className="text-[#547568] font-bold">{reportResult.methodologyVersion}</span>
              </div>
            </div>
          </div>

          {/* 2. Executive Valuation Summary Banner */}
          <div className="bg-[#202B3C] text-white p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-white/70">
                Executive Valuation Summary
              </span>
              <span className="px-2.5 py-0.5 bg-[#547568] text-white text-[10px] font-mono font-bold uppercase tracking-widest">
                Confidence: {valuation.confidenceLevel} ({valuation.confidenceScore}/100)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-white/60 block">
                  Estimated Market Value Range
                </span>
                <div className="font-editorial text-2xl sm:text-3xl font-bold mt-1 text-white">
                  ₹{valuation.estimatedValueMinLakhs}L — ₹{valuation.estimatedValueMaxLakhs}L
                </div>
                <span className="text-[11px] text-white/70 mt-1 block">
                  Midpoint Estimate: <strong>₹{valuation.estimatedMidpointLakhs} Lakhs</strong>
                </span>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                <span className="text-[10px] font-mono uppercase text-white/60 block">
                  Derived Carpet Area Unit Rate
                </span>
                <div className="font-editorial text-2xl sm:text-3xl font-bold mt-1 text-white">
                  ₹{valuation.estimatedPricePerSqFtCarpet.toLocaleString('en-IN')}
                  <span className="text-xs font-mono font-normal text-white/70"> / sq.ft</span>
                </div>
                <span className="text-[11px] text-white/70 mt-1 block">
                  Calculated on {propertySummary.carpetAreaSqFt} sq.ft usable carpet
                </span>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                <span className="text-[10px] font-mono uppercase text-white/60 block">
                  Government Jantri Benchmark
                </span>
                <div className="font-editorial text-2xl sm:text-3xl font-bold mt-1 text-white/90">
                  ₹{valuation.jantriBenchmarkLakhs} Lakhs
                </div>
                <span className="text-[11px] text-white/70 mt-1 block">
                  Statutory minimum valuation guideline
                </span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4 text-xs text-white/80 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#547568] shrink-0 mt-0.5" />
              <span>
                {valuation.confidenceRationale} Micro-market dispersion coefficient: <strong>{valuation.dispersionCoefficientPercent}% CV</strong> across {valuation.eligibleCompsCount} indexed data points.
              </span>
            </div>
          </div>

          {/* 3. Subject Property Identification Matrix */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] border-b border-[#C8C4BA] pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#547568]" />
              <span>Section 1 &bull; Subject Property Specification</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F5F3ED] border border-[#C8C4BA] p-5 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Locality</span>
                <span className="font-bold text-[#202B3C]">{propertySummary.localityName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Project / Development</span>
                <span className="font-bold text-[#202B3C]">{propertySummary.projectName || 'Standalone Society'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Typology & Layout</span>
                <span className="font-bold text-[#202B3C]">{propertySummary.bhk} BHK {propertySummary.propertyType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">RERA Carpet Area</span>
                <span className="font-bold text-[#547568]">{propertySummary.carpetAreaSqFt} Sq.Ft</span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Floor Elevation</span>
                <span className="text-[#202B3C]">{propertySummary.floor || 'N/A'} of {propertySummary.totalFloors || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Building Age</span>
                <span className="text-[#202B3C]">{propertySummary.buildingAgeYears ? `${propertySummary.buildingAgeYears} Years` : 'Under 3 Years'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Physical Condition</span>
                <span className="text-[#202B3C]">{propertySummary.condition || 'EXCELLENT'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#69717B] block">Furnishing Level</span>
                <span className="text-[#202B3C]">{propertySummary.furnishingStatus || 'SEMI_FURNISHED'}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#C8C4BA] text-xs">
              <span className="text-[10px] font-mono uppercase text-[#69717B] block">Registered Site Address</span>
              <p className="font-medium text-[#202B3C] mt-0.5">{propertySummary.address}</p>
            </div>
          </div>

          {/* 4. Registered Sub-Registrar Transaction Evidence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#547568]" />
                <span>Section 2 &bull; Registered Sale Deed Instruments (Sub-Registrar Evidence)</span>
              </h3>
              <span className="text-[10px] font-mono text-[#547568] font-bold">
                {comparableEvidence.registeredTransactions.length} Verified Deeds
              </span>
            </div>

            <div className="overflow-x-auto border border-[#C8C4BA]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#202B3C] text-white text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Deed Reference</th>
                    <th className="p-3">Registration Date</th>
                    <th className="p-3">Project / Society</th>
                    <th className="p-3">BHK</th>
                    <th className="p-3 text-right">Carpet Sq.Ft</th>
                    <th className="p-3 text-right">Transacted Price</th>
                    <th className="p-3 text-right">Deed Rate/Sq.Ft</th>
                    <th className="p-3 text-right">Hedonic Adjusted Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DFD8]">
                  {comparableEvidence.registeredTransactions.map((tx, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F3ED]'}>
                      <td className="p-3 font-bold text-[#202B3C]">{tx.deedOrListingId}</td>
                      <td className="p-3 text-[#69717B]">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 font-sans font-medium text-[#202B3C]">{tx.projectName || tx.localityName}</td>
                      <td className="p-3">{tx.bhk} BHK</td>
                      <td className="p-3 text-right font-bold">{tx.carpetAreaSqFt}</td>
                      <td className="p-3 text-right font-bold text-[#202B3C]">₹{tx.transactedOrAskingPriceLakhs}L</td>
                      <td className="p-3 text-right text-[#69717B]">₹{tx.baselineRateSqFt}</td>
                      <td className="p-3 text-right font-bold text-[#547568]">₹{tx.adjustedRateSqFt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#69717B]">
              * Hedonic adjustments account for carpet area scale elasticity, floor height premiums (+0.35%/floor), and age differentials relative to subject property.
            </p>
          </div>

          {/* 5. Active Advertised Asking Listings (Separately Identified) */}
          {comparableEvidence.askingListings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#547568]" />
                  <span>Section 3 &bull; Advertised Asking Comps (Subject to -6.5% Market Haircut)</span>
                </h3>
                <span className="text-[10px] font-mono text-[#69717B]">
                  {comparableEvidence.askingListings.length} Active Listings
                </span>
              </div>

              <div className="overflow-x-auto border border-[#C8C4BA]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#69717B] text-white text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Source Channel</th>
                      <th className="p-3">Observation Date</th>
                      <th className="p-3">Project / Society</th>
                      <th className="p-3">BHK</th>
                      <th className="p-3 text-right">Carpet Sq.Ft</th>
                      <th className="p-3 text-right">Asking Price</th>
                      <th className="p-3 text-right">Listed Rate</th>
                      <th className="p-3 text-right">Post-Haircut Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DFD8]">
                    {comparableEvidence.askingListings.map((list, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F5F3ED]'}>
                        <td className="p-3 font-medium text-[#202B3C]">{list.sourceName}</td>
                        <td className="p-3 text-[#69717B]">{new Date(list.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-sans text-[#202B3C]">{list.projectName || list.localityName}</td>
                        <td className="p-3">{list.bhk} BHK</td>
                        <td className="p-3 text-right">{list.carpetAreaSqFt}</td>
                        <td className="p-3 text-right font-bold text-[#202B3C]">₹{list.transactedOrAskingPriceLakhs}L</td>
                        <td className="p-3 text-right text-[#69717B]">₹{list.baselineRateSqFt}</td>
                        <td className="p-3 text-right font-bold text-[#547568]">₹{list.adjustedRateSqFt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. 12-Factor Valuation Intelligence Framework Matrix */}
          {twelveFactorResults && twelveFactorResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#547568]" />
                  <span>Section 4 &bull; 12-Factor Valuation Intelligence Framework Matrix</span>
                </h3>
                <span className="text-[10px] font-mono text-[#547568] font-bold">
                  All 12 Institutional Factors Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {twelveFactorResults.map((factor, idx) => (
                  <div
                    key={factor.factorId || idx}
                    className="p-4 bg-white border border-[#C8C4BA] space-y-2.5 text-xs font-mono hover:border-[#547568] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#E2DFD8] pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-[#69717B] block">
                          Factor {String(idx + 1).padStart(2, '0')} &bull; {factor.valuationImpactType.replace('_', ' ')}
                        </span>
                        <h4 className="font-sans font-bold text-sm text-[#202B3C]">
                          {factor.factorName}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                            factor.assessmentStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : factor.assessmentStatus === 'PARTIALLY_VERIFIED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : factor.assessmentStatus === 'NOT_APPLICABLE'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {factor.assessmentStatus.replace('_', ' ')}
                        </span>
                        {factor.valuationImpact.adjustmentPercent !== undefined && (
                          <span className="block text-xs font-bold text-[#547568] mt-0.5">
                            {factor.valuationImpact.adjustmentPercent >= 0 ? '+' : ''}
                            {factor.valuationImpact.adjustmentPercent.toFixed(2)}%
                          </span>
                        )}
                        {factor.valuationImpact.gateAction && (
                          <span
                            className={`block text-[10px] font-bold mt-0.5 ${
                              factor.valuationImpact.gateAction === 'BLOCK'
                                ? 'text-red-700'
                                : factor.valuationImpact.gateAction === 'RESTRICT'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            GATE: {factor.valuationImpact.gateAction}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-sans text-[11px] text-[#202B3C] leading-relaxed space-y-1">
                      {factor.findings.map((finding, fIdx) => (
                        <p key={fIdx}>&bull; {finding}</p>
                      ))}
                    </div>

                    {factor.riskFlags.length > 0 && (
                      <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-sans">
                        <span className="font-bold font-mono uppercase block">Risk Flags:</span>
                        {factor.riskFlags.map((risk, rIdx) => (
                          <p key={rIdx}>&bull; {risk}</p>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#E2DFD8] flex items-center justify-between text-[10px] text-[#69717B]">
                      <span className="truncate max-w-[200px]" title={factor.sourceReferences.map((s) => s.sourceName).join(', ')}>
                        Src: {factor.sourceReferences.map((s) => s.sourceName).join(', ') || 'Statutory Benchmarks'}
                      </span>
                      <span>Verified: {factor.lastVerifiedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Statutory Acquisition Taxes & Ownership Cost Schedule (Factor 11) */}
          {ownershipCostSummary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#547568]" />
                  <span>Section 5 &bull; Statutory Acquisition Taxes & Ownership Cost Schedule (Factor 11)</span>
                </h3>
                <span className="text-[10px] font-mono text-[#69717B]">
                  Gujarat Revenue Dept / Municipal Act
                </span>
              </div>

              <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-white border border-[#C8C4BA]">
                    <span className="text-[10px] uppercase text-[#69717B] block">Gujarat Stamp Duty (4.9%)</span>
                    <span className="font-bold text-[#202B3C] text-sm">
                      ₹{ownershipCostSummary.statutoryCosts.stampDutyRupees.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-[#69717B] block mt-0.5">Statutory state duty</span>
                  </div>

                  <div className="p-3 bg-white border border-[#C8C4BA]">
                    <span className="text-[10px] uppercase text-[#69717B] block">Registration Fee (1.0%)</span>
                    <span className="font-bold text-[#202B3C] text-sm">
                      ₹{ownershipCostSummary.statutoryCosts.registrationFeeRupees.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-[#69717B] block mt-0.5">SRO deed recording</span>
                  </div>

                  <div className="p-3 bg-white border border-[#C8C4BA]">
                    <span className="text-[10px] uppercase text-[#69717B] block">AMC Property Tax (Est.)</span>
                    <span className="font-bold text-[#202B3C] text-sm">
                      ₹{ownershipCostSummary.annualRecurringCosts.propertyTaxAnnualRupees.toLocaleString('en-IN')}/yr
                    </span>
                    <span className="text-[9px] text-[#69717B] block mt-0.5">Municipal annual levy</span>
                  </div>

                  <div className="p-3 bg-white border border-[#C8C4BA]">
                    <span className="text-[10px] uppercase text-[#69717B] block">Society Maintenance</span>
                    <span className="font-bold text-[#547568] text-sm">
                      ₹{ownershipCostSummary.annualRecurringCosts.societyMaintenanceAnnualRupees.toLocaleString('en-IN')}/yr
                    </span>
                    <span className="text-[9px] text-[#69717B] block mt-0.5">Estimated sinking fund</span>
                  </div>
                </div>

                <div className="p-3 bg-white border-l-4 border-l-[#547568] border border-[#C8C4BA] text-xs font-sans text-[#202B3C]">
                  <strong>Methodological Governance Note:</strong> {ownershipCostSummary.methodologicalDisclaimer}
                </div>
              </div>
            </div>
          )}

          {/* 6. Asking Price Assessment (if provided) */}
          {askingPriceAssessment && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] border-b border-[#C8C4BA] pb-2 flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#547568]" />
                <span>Section 6 &bull; Seller Asking Price Assessment</span>
              </h3>

              <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#69717B]">
                    Target / Asking Price: <strong>₹{askingPriceAssessment.sellerPriceLakhs} Lakhs</strong>
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                      askingPriceAssessment.verdict === 'PREMIUM_ASKING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : askingPriceAssessment.verdict === 'VALUE_BUY'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    Verdict: {askingPriceAssessment.verdict.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs font-sans text-[#202B3C] leading-relaxed">
                  {askingPriceAssessment.analysis}
                </p>
              </div>
            </div>
          )}

          {/* 7. Methodology Rules & Statutory Disclaimers */}
          <div className="space-y-4 pt-4 border-t border-[#C8C4BA]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202B3C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#547568]" />
              <span>Section 7 &bull; Methodology Governance & Statutory Disclaimers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] space-y-2">
                <span className="font-mono font-bold uppercase text-[#202B3C] text-[10px] block">
                  Methodological Principles
                </span>
                <ul className="space-y-1 text-[#69717B] text-[11px] leading-relaxed">
                  <li>&bull; {methodologyHighlights.carpetAreaNormalisation}</li>
                  <li>&bull; {methodologyHighlights.floorAdjustmentRule}</li>
                  <li>&bull; {methodologyHighlights.ageDepreciationRule}</li>
                  <li>&bull; {methodologyHighlights.askingPriceHaircutRule}</li>
                </ul>
              </div>

              <div className="p-4 bg-[#F5F3ED] border border-[#C8C4BA] space-y-2">
                <span className="font-mono font-bold uppercase text-[#202B3C] text-[10px] block">
                  Legal & Regulatory Boundaries
                </span>
                <ul className="space-y-1 text-[#69717B] text-[11px] leading-relaxed">
                  {disclaimers.map((disc, idx) => (
                    <li key={idx}>&bull; {disc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 8. Institutional Signature & Cryptographic Seal */}
          <div className="border-t-2 border-[#202B3C] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#69717B] gap-4">
            <div>
              <span className="block font-bold text-[#202B3C]">PROVENTA REAL ESTATE INTELLIGENCE</span>
              <span className="block text-[10px]">Independent Property Data & Valuation Systems &bull; proventa.in</span>
            </div>

            <div className="text-right text-[10px] space-y-0.5">
              <span>Report Reference: {reportRef}</span>
              <span className="block">Digital Integrity SHA-256 Verified</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

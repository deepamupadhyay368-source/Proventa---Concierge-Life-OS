'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Calendar, MapPin, CheckCircle2, Filter, ArrowUpRight, Search } from 'lucide-react';

interface ResearchReport {
  id: string;
  title: string;
  slug: string;
  quarter: string;
  publishDate: string;
  geographicScope: string;
  category: 'MARKET_OVERVIEW' | 'MICRO_MARKET' | 'INFRASTRUCTURE' | 'SPECIAL_REPORT';
  dataPeriod: string;
  verifiedObservations: number;
  dataClassification: 'VERIFIED' | 'SOURCE-REPORTED' | 'MODEL-ESTIMATED';
  summary: string;
  keyFindings: string[];
  fileSize: string;
  pageCount: number;
}

const REPORTS_CATALOG: ResearchReport[] = [
  {
    id: 'rep-q3-2026-ahmedabad',
    title: 'Ahmedabad Residential Market Intelligence: Q3 2026',
    slug: 'ahmedabad-residential-q3-2026',
    quarter: 'Q3 2026',
    publishDate: '15-Oct-2026',
    geographicScope: 'Ahmedabad Urban Development Authority (AUDA)',
    category: 'MARKET_OVERVIEW',
    dataPeriod: '01 July 2026 – 30 September 2026',
    verifiedObservations: 1420,
    dataClassification: 'VERIFIED',
    summary: 'Comprehensive analysis of 11 western and northern residential micro-markets in Ahmedabad, tracking price per square foot across RERA-registered projects, quarterly transaction velocity, and carpet-to-super-built-up loading ratios.',
    keyFindings: [
      'Weighted residential capital values appreciated 8.4% YoY across western peripheral corridors (Shela, South Bopal).',
      'Average RERA carpet loading observed in high-rise 3 BHK configurations stabilized between 36% and 42%.',
      'Ready-to-move inventory transaction velocity exceeded under-construction absorption by 1.8x in Satellite and Bodakdev.'
    ],
    fileSize: '4.8 MB',
    pageCount: 38,
  },
  {
    id: 'rep-gift-city-2026',
    title: 'GIFT City & Environs: Capital Inflow & Dual-Regime Residential Dynamics',
    slug: 'gift-city-environs-2026',
    quarter: 'Q3 2026',
    publishDate: '28-Sep-2026',
    geographicScope: 'Gandhinagar & GIFT City IFSC Zone',
    category: 'SPECIAL_REPORT',
    dataPeriod: '01 January 2026 – 31 August 2026',
    verifiedObservations: 680,
    dataClassification: 'VERIFIED',
    summary: 'Special analytical focus on residential and co-living demand within the GIFT IFSC Special Economic Zone and peripheral domestic tariff areas, evaluating gross rental yields against traditional Ahmedabad prime residential assets.',
    keyFindings: [
      'Gross rental yields reached 4.4% in institutional towers, outperforming Ahmedabad city average (3.3%) by 110 bps.',
      'Institutional leasing agreements from multinational financial firms accounted for 64% of tenancy commencements.',
      'Infrastructure completion for Phase-2 metro link catalyzed a 15.6% capital value expansion over 12 months.'
    ],
    fileSize: '3.2 MB',
    pageCount: 26,
  },
  {
    id: 'rep-sg-highway-corridor-2026',
    title: 'SG Highway Micro-Market Dossier: Thaltej, Bodakdev & Prahlad Nagar',
    slug: 'sg-highway-micro-market-2026',
    quarter: 'Q2 2026',
    publishDate: '12-Jul-2026',
    geographicScope: 'SG Highway Core Corridor, West Ahmedabad',
    category: 'MICRO_MARKET',
    dataPeriod: '01 April 2026 – 30 June 2026',
    verifiedObservations: 890,
    dataClassification: 'VERIFIED',
    summary: 'Granular asset-level breakdown of Ahmedabad’s primary luxury corridor, contrasting secondary market resale execution prices with developer primary asking quotations.',
    keyFindings: [
      'Observed negotiation discount between asking prices and registered deed prices averaged 7.2% across luxury re-sales.',
      'Ultra-luxury configurations (>3,000 sq ft carpet) represented 38% of total value transacted in Bodakdev.',
      'Sub-registrar deed registrations highlighted an average stamp duty execution time of 14 days under Gujarat digital portal.'
    ],
    fileSize: '2.9 MB',
    pageCount: 22,
  },
  {
    id: 'rep-north-west-expansion-2026',
    title: 'North-West Growth Arc: Gota, New CG Road & Science City Extension',
    slug: 'north-west-growth-arc-2026',
    quarter: 'Q2 2026',
    publishDate: '18-Jun-2026',
    geographicScope: 'North-West Ahmedabad (SG Highway North & SP Ring Road)',
    category: 'MICRO_MARKET',
    dataPeriod: '01 January 2026 – 31 May 2026',
    verifiedObservations: 1120,
    dataClassification: 'VERIFIED',
    summary: 'Demographic and pricing evaluation of North-West Ahmedabad, examining the absorption of 2 and 3 BHK housing units driven by healthcare and academic institutional clusters.',
    keyFindings: [
      'Capital values in Science City stabilized at ₹5,800/sq ft average, showing resilient secondary market liquidity.',
      'Gota registered the highest aggregate residential unit transaction volume (512 units transacted in Q2).',
      'Average entry ticket size for 2 BHK units remained under ₹55 Lakhs, driving first-time homebuyer demand.'
    ],
    fileSize: '3.5 MB',
    pageCount: 30,
  },
  {
    id: 'rep-jantri-vs-market-2026',
    title: 'Gujarat Jantri Benchmark Discrepancy & Stamp Duty Assessment 2026',
    slug: 'gujarat-jantri-benchmark-discrepancy-2026',
    quarter: 'Q1 2026',
    publishDate: '24-Mar-2026',
    geographicScope: 'State of Gujarat & Ahmedabad Urban Zone',
    category: 'INFRASTRUCTURE',
    dataPeriod: 'Full Year 2025 – Q1 2026',
    verifiedObservations: 2450,
    dataClassification: 'SOURCE-REPORTED',
    summary: 'Comparative study examining the statistical delta between statutory Gujarat Jantri circle rates and actual transacted market values across residential land, apartments, and commercial units in Ahmedabad.',
    keyFindings: [
      'Observed market values in western micro-markets exceed statutory Jantri baselines by a factor of 1.9x to 2.8x.',
      'Impact analysis on buyer stamp duty cash outflows and institutional mortgage loan-to-value (LTV) limits.',
      'Policy recommendations for transparent municipal rate adjustments and digital sub-registrar indexing.'
    ],
    fileSize: '5.1 MB',
    pageCount: 44,
  },
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadModalReport, setDownloadModalReport] = useState<ResearchReport | null>(null);

  const filteredReports = REPORTS_CATALOG.filter((report) => {
    const matchesCategory = selectedCategory === 'ALL' || report.category === selectedCategory;
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.geographicScope.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      {/* Header */}
      <section className="border-b border-[#C8C4BA] pb-10">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#547568]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#547568] font-bold">
              PROVENTA Research Desk Publications
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#202B3C]">
            Independent Market Reports & Research
          </h1>
          <p className="text-base sm:text-lg text-[#69717B] leading-relaxed">
            Quarterly market digests, micro-market dossiers, and empirical real estate intelligence for Ahmedabad and Gandhinagar. Grounded in RERA regulatory disclosures, town-planning records, and empirical market sampling.
          </p>
        </div>

        {/* Research Calibration Note */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs">
          <p className="font-bold uppercase tracking-wider font-mono text-[11px]">
            RESEARCH BENCHMARK NOTE &bull; AHMEDABAD &amp; GANDHINAGAR
          </p>
          <p className="text-amber-800 leading-relaxed mt-1">
            PROVENTA research publications are synthesized from public Gujarat RERA disclosures, town-planning maps, and empirical micro-market transaction sampling. Sub-registrar deed archives are being indexed progressively; figures reflect calibrated empirical research models.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Publications' },
              { id: 'MARKET_OVERVIEW', label: 'Market Overviews' },
              { id: 'MICRO_MARKET', label: 'Micro-Markets' },
              { id: 'SPECIAL_REPORT', label: 'Special Reports' },
              { id: 'INFRASTRUCTURE', label: 'Regulatory & Jantri' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#202B3C] text-white shadow-xs'
                    : 'bg-white border border-[#C8C4BA] text-[#69717B] hover:text-[#202B3C]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#69717B]" />
            <input
              type="text"
              placeholder="Filter by keyword or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#C8C4BA] pl-9 pr-3 py-1.5 text-xs text-[#202B3C] placeholder-[#69717B] focus:outline-hidden focus:border-[#202B3C]"
            />
          </div>
        </div>
      </section>

      {/* Reports Listing */}
      <section className="space-y-6">
        <div className="flex items-center justify-between text-xs text-[#69717B] font-mono">
          <span>Displaying {filteredReports.length} research dossiers</span>
          <span>Coverage: Ahmedabad Urban Zone & GIFT City</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="bg-white border border-[#C8C4BA] p-6 md:p-8 hover:shadow-xs transition-shadow flex flex-col md:flex-row gap-6 md:gap-8 justify-between"
            >
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-[#547568] bg-[#547568]/10 px-2 py-0.5 border border-[#547568]/20">
                    {report.quarter}
                  </span>
                  <span className="text-[#69717B] flex items-center gap-1 font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    {report.publishDate}
                  </span>
                  <span className="text-[#69717B] flex items-center gap-1 font-mono">
                    <MapPin className="h-3.5 w-3.5" />
                    {report.geographicScope}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#F5F3ED] text-[#202B3C] border border-[#C8C4BA]">
                    {report.dataClassification}
                  </span>
                </div>

                <div>
                  <h2 className="font-editorial text-2xl md:text-3xl font-bold text-[#202B3C] leading-snug">
                    {report.title}
                  </h2>
                  <p className="mt-2 text-xs md:text-sm text-[#69717B] leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="bg-[#F5F3ED] p-4 border border-[#C8C4BA]/50 space-y-2">
                  <p className="text-[11px] font-bold text-[#202B3C] uppercase tracking-wider">
                    Key Empirical Findings
                  </p>
                  <ul className="space-y-1.5">
                    {report.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-xs text-[#202B3C] flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#547568] shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar Action / Metrics */}
              <div className="md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#C8C4BA]/60 pt-4 md:pt-0 md:pl-6 space-y-4">
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#C8C4BA]/40">
                    <span className="text-[#69717B]">Verified Comps:</span>
                    <span className="font-bold text-[#202B3C]">{report.verifiedObservations}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#C8C4BA]/40">
                    <span className="text-[#69717B]">Pages:</span>
                    <span className="text-[#202B3C]">{report.pageCount} Pages</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#C8C4BA]/40">
                    <span className="text-[#69717B]">Format:</span>
                    <span className="text-[#202B3C]">PDF ({report.fileSize})</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setDownloadModalReport(report)}
                    className="w-full py-2.5 px-4 bg-[#202B3C] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#202B3C]/90 transition-colors shadow-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Dossier</span>
                  </button>

                  <Link
                    href={`/pricing?source=report&id=${report.id}`}
                    className="w-full py-2 px-3 bg-white border border-[#C8C4BA] text-[#202B3C] text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#F5F3ED] transition-colors"
                  >
                    <span>Member Access Required</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Download Modal Simulation */}
      {downloadModalReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#202B3C] max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#547568] uppercase tracking-wider">
                  Download Intelligence Report
                </span>
                <h3 className="font-display text-lg font-bold text-[#202B3C] mt-0.5">
                  {downloadModalReport.title}
                </h3>
              </div>
              <button
                onClick={() => setDownloadModalReport(null)}
                className="text-[#69717B] hover:text-[#202B3C] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#69717B] space-y-2">
              <p>
                Full publication access is included with PROVENTA Personal, Investor, and Professional memberships.
              </p>
              <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA] font-mono text-[11px] space-y-1">
                <div>Document: {downloadModalReport.id}.pdf</div>
                <div>Size: {downloadModalReport.fileSize}</div>
                <div>Classification: {downloadModalReport.dataClassification}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/pricing"
                className="flex-1 py-2.5 bg-[#202B3C] text-white text-xs font-semibold text-center hover:bg-[#202B3C]/90"
              >
                View Membership Plans
              </Link>
              <button
                onClick={() => {
                  alert(`Executive summary dossier dispatched for: ${downloadModalReport.title}`);
                  setDownloadModalReport(null);
                }}
                className="flex-1 py-2.5 bg-white border border-[#202B3C] text-[#202B3C] text-xs font-semibold hover:bg-[#F5F3ED]"
              >
                Download Executive Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Integrity Footnote */}
      <section className="bg-white border border-[#C8C4BA] p-6 text-xs text-[#69717B] space-y-2">
        <p className="font-semibold text-[#202B3C]">PROVENTA Research Publication Standards:</p>
        <p className="leading-relaxed">
          Every statistic published in our reports is cross-validated against Gujarat RERA quarterly progress reports (QPRs), local municipal town-planning sanction maps, and recorded sub-registrar transaction indices. PROVENTA does not publish anonymous broker quotes or unverified listing asking prices as transaction evidence.
        </p>
      </section>
    </div>
  );
}

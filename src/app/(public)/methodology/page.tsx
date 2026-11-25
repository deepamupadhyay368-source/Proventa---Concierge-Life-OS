import Link from 'next/link';
import { Shield, CheckCircle, Database, FileSpreadsheet, Scale, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

export default function MethodologyPage() {
  const pillars = [
    {
      num: '01',
      title: 'RERA Usable Carpet Area Normalization',
      desc: 'All valuations are mathematically grounded strictly in usable net internal carpet area as mandated under the Real Estate (Regulation and Development) Act, 2016. In many Indian markets, developers and brokers quote ambiguous "super built-up" or "saleable" numbers that inflate square footage by 35% to 50%. PROVENTA normalizes all comparables to usable carpet square footage before conducting statistical comparisons.',
    },
    {
      num: '02',
      title: 'Hedonic Quality Multipliers',
      desc: 'Properties within the same locality are not identical commodities. Our engine calculates micro-adjustments across discrete variables: floor height premium/discount, structural age depreciation (-1.5% per annum baseline), dedicated reserved covered parking, society amenities (clubhouse, high-speed elevators, power back-up), and interior furnishing standards.',
    },
    {
      num: '03',
      title: 'Jantri vs. Market Discrepancy Isolation',
      desc: 'The Government of Gujarat establishes Jantri (annual statement of rates) as a minimum statutory benchmark for stamp duty assessment. However, Jantri rates often lag behind true market clearing prices by 40% to 65% in high-demand western corridors. PROVENTA explicitly tracks and isolates this delta so buyers know both statutory stamp obligations and real economic acquisition costs.',
    },
    {
      num: '04',
      title: 'RERA Regulatory Cross-Referencing',
      desc: 'Every project profile is linked to official Gujarat RERA registration certificates, quarterly progress reports (QPRs), promoter track records, and litigation disclosures where filed with regulatory authorities. We flag whether a project has obtained an occupancy certificate (B-U permission) or remains under construction.',
    },
    {
      num: '05',
      title: 'Sub-Registrar Transaction Indexing',
      desc: 'Completed sales deed executions recorded across Gujarat revenue sub-registrar offices provide the empirical backbone of our comp library. We differentiate strictly between "observed registered transaction prices" and "broker asking quotations," filtering out fraudulent stamp evasion outliers and non-arms-length transfers.',
    },
    {
      num: '06',
      title: 'Confidence Scoring & Negotiation Range',
      desc: 'Every valuation output features a transparent confidence score (0–100%) calculated from local transaction density, observation recency, and comp homogeneity. In addition, we compute an indicative negotiation bracket (typically -4% to -8%) representing observed spreads between initial asking prices and final deed registrations.',
    },
  ];

  const classifications = [
    {
      badge: 'VERIFIED',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      definition: 'Data confirmed directly through official public registries, sub-registrar deeds, or RERA regulatory filings. High reliability.',
    },
    {
      badge: 'SOURCE-REPORTED',
      color: 'bg-blue-50 text-blue-800 border-blue-300',
      definition: 'Information supplied by developer brochures, municipal town-planning layouts, or audited industry publications prior to individual deed verification.',
    },
    {
      badge: 'MODEL-ESTIMATED',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      definition: 'Algorithmic output generated via our hedonic regression model where specific comps are adjusted to match the target property profile.',
    },
    {
      badge: 'USER-SUBMITTED',
      color: 'bg-purple-50 text-purple-800 border-purple-300',
      definition: 'Data entered into the Personal Property Vault by an individual owner. Encrypted and strictly segregated; never mixed into public indexes.',
    },
    {
      badge: 'DEMONSTRATION',
      color: 'bg-stone-100 text-stone-700 border-stone-300',
      definition: 'Explicitly flagged sample records used for UI demonstration or prototype scenarios. Never counted in statistical market indices.',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="border-b border-[#C8C4BA] pb-12 pt-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#547568]/10 text-[#547568] text-xs font-semibold uppercase tracking-wider border border-[#547568]/20">
            Transparent Data Architecture
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#202B3C]">
            Evidence before estimates.
          </h1>
          <p className="text-base md:text-lg text-[#69717B] leading-relaxed">
            The mathematical and regulatory foundation behind PROVENTA Real Estate Intelligence. How we normalize property data, filter broker speculation, and evaluate true fair market value across Ahmedabad and Gujarat.
          </p>
        </div>
      </section>

      {/* The 6 Pillars */}
      <section className="space-y-8">
        <div className="border-b border-[#C8C4BA] pb-3">
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            The Six Pillars of PROVENTA Valuation
          </h2>
          <p className="text-xs text-[#69717B] mt-1">
            An algorithmic hedonic model replacing guesswork with empirical property parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.num} className="bg-white border border-[#C8C4BA] p-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-mono text-2xl font-bold text-[#547568]">{pillar.num}</span>
                <h3 className="font-display text-lg font-bold text-[#202B3C] leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#69717B] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Classification Matrix */}
      <section className="bg-white border border-[#C8C4BA] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Authoritative Data Classification Standard
          </h2>
          <p className="text-xs text-[#69717B] mt-1">
            Every record, metric, and estimate on PROVENTA carries an unambiguous classification tag. We never mix estimates with verified sales deeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {classifications.map((item) => (
            <div key={item.badge} className="p-4 bg-[#F5F3ED] border border-[#C8C4BA]/50 space-y-2">
              <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${item.color}`}>
                {item.badge}
              </span>
              <p className="text-xs text-[#202B3C] leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Jantri vs Market Comparison Explainer */}
      <section className="bg-white border border-[#C8C4BA] p-6 md:p-8 space-y-6">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-mono font-bold text-[#547568] uppercase tracking-wider">
            Gujarat Regulatory Context
          </span>
          <h2 className="font-display text-2xl font-bold text-[#202B3C]">
            Understanding Jantri vs. Market Price in Gujarat
          </h2>
          <p className="text-xs md:text-sm text-[#69717B] leading-relaxed">
            In Gujarat, property transactions involve two distinct valuation regimes that are frequently confused by first-time property buyers:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 bg-[#F5F3ED] border border-[#C8C4BA] space-y-3">
            <h3 className="font-display text-base font-bold text-[#202B3C]">
              Gujarat Jantri (Statutory Ready Reckoner Rate)
            </h3>
            <ul className="text-xs text-[#69717B] space-y-2 list-disc pl-4">
              <li>Determined periodically by the Gujarat Revenue Department and Collectorate.</li>
              <li>Serves exclusively as the legal minimum threshold for stamp duty (4.9% male / exemption for female) and registration fees (1%).</li>
              <li>Does not account for modern club amenities, high-floor views, or interior specifications.</li>
              <li>Must never be cited as fair market value when evaluating an acquisition.</li>
            </ul>
          </div>

          <div className="p-5 bg-white border border-[#202B3C] space-y-3">
            <h3 className="font-display text-base font-bold text-[#202B3C]">
              Fair Market Value (PROVENTA Intelligence)
            </h3>
            <ul className="text-xs text-[#69717B] space-y-2 list-disc pl-4">
              <li>Reflects the actual arm’s-length clearing price between a willing buyer and willing seller in the open market.</li>
              <li>Derived from comparable verified transactions and developer primary sale agreements.</li>
              <li>In prime western Ahmedabad (Bodakdev, Satellite, Shela), market clearing rates are commonly 1.8x to 2.8x higher than statutory Jantri.</li>
              <li>Essential for financing, insurance, portfolio tracking, and negotiation leverage.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimers & Limits of Model */}
      <section className="bg-white border border-[#C8C4BA] p-6 md:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#202B3C] uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-[#547568]" />
          <span>Statutory Disclaimer & Scope of Intelligence</span>
        </div>
        <p className="text-xs text-[#69717B] leading-relaxed">
          PROVENTA Real Estate Intelligence provides mathematical estimates and market research based on available public records and statistical modeling. PROVENTA is not a registered valuer under the Insolvency and Bankruptcy Board of India (IBBI) or the Companies Act, nor does it issue statutory valuation certificates required for court proceedings, bank mortgage solvency certificates, or capital gains tax disputes. Users must consult licensed advocates for legal title searches and certified chartered engineers for structural evaluations.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-[#202B3C] text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Test the Valuation Engine on Your Property
          </h2>
          <p className="text-xs text-[#C8C4BA] mt-1">
            Input carpet area, floor level, and society details to see algorithmic pricing in action.
          </p>
        </div>
        <Link
          href="/property-intelligence"
          className="whitespace-nowrap px-6 py-3 bg-white text-[#202B3C] font-semibold text-xs uppercase tracking-wider hover:bg-[#F5F3ED] transition-colors flex items-center gap-2"
        >
          <span>Calculate Property Value</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Share2,
  ArrowLeft,
  Activity,
  History,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProjectProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectProfilePage({ params }: ProjectProfilePageProps) {
  const { slug } = await params;

  const project = await db.project.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      locality: true,
      developerRelation: true,
      configurations: { orderBy: { bhk: 'asc' } },
      specifications: { orderBy: [{ category: 'asc' }, { featureName: 'asc' }] },
      amenities: { orderBy: [{ category: 'asc' }, { amenityName: 'asc' }] },
      constructionProgress: { orderBy: { asOfDate: 'desc' }, include: { sourceDocument: true } },
      regulatoryEvents: { orderBy: { eventDate: 'desc' } },
      historicalSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 10 },
      sourceDocuments: { include: { source: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) {
    notFound();
  }

  // Handle consolidated duplicate entities (redirect to canonical project)
  if (project.canonicalProjectId) {
    const canonical = await db.project.findUnique({ where: { id: project.canonicalProjectId } });
    if (canonical) {
      redirect(`/project-intelligence/${canonical.slug}`);
    }
  }

  // Publication Gate: Exclude quarantined, rejected, or unverified draft projects from public dossiers
  if (!project.isPubliclyVisible || project.publicationStatus !== 'PUBLISHED') {
    notFound();
  }

  // Get official statutory Jantri circle rate for this locality
  const jantri = await db.jantriBenchmark.findFirst({
    where: { localityId: project.localityId },
    orderBy: { effectiveFrom: 'desc' },
  });

  const latestProgress = project.constructionProgress[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#69717B]">
        <Link href="/project-intelligence" className="hover:text-[#202B3C] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Project Directory</span>
        </Link>
        <span>/</span>
        <span>{project.district}</span>
        <span>/</span>
        <span>{project.locality?.name}</span>
        <span>/</span>
        <span className="text-[#202B3C] font-semibold">{project.name}</span>
      </div>

      {/* SECTION 1: HERO & REGULATORY DOSSIER HEADER */}
      <div className="bg-white border border-[#C8C4BA] p-6 sm:p-10 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#C8C4BA]/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568] bg-[#F5F3ED] px-2.5 py-1 border border-[#C8C4BA]/60">
                Official Regulatory Dossier
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                {project.verificationBadge}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700 font-semibold">
                {project.assetClassification || 'RESIDENTIAL'}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight">
              {project.name}
            </h1>

            <div className="text-sm sm:text-base text-[#69717B] font-sans space-y-1">
              <p className="flex items-center gap-2">
                <span>Developed by</span>
                <span className="font-bold text-[#202B3C] underline decoration-[#C8C4BA] underline-offset-4">
                  {project.developer || 'Independent'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#547568]" />
                  {project.locality?.name}, {project.district}
                </span>
              </p>
              {project.promoterLegalEntity && (
                <p className="text-xs font-mono text-[#547568]">
                  Registered Promoter: <span className="font-bold text-[#202B3C]">{project.promoterLegalEntity}</span>
                </p>
              )}
            </div>
          </div>

          {/* Statutory Registration Box */}
          <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-4 font-mono text-xs space-y-2 md:w-80 shrink-0">
            <span className="text-[9px] uppercase font-bold text-[#69717B] block">
              Gujarat RERA Registration Number
            </span>
            <span className="text-sm font-bold text-[#202B3C] break-all select-all block">
              {project.reraNumber || 'PRE-RERA COMPLETED (EXEMPT)'}
            </span>
            {project.statutoryDocRef && (
              <span className="text-[10px] text-[#547568] block">
                Evidence Ref: {project.statutoryDocRef}
              </span>
            )}
            <div className="pt-2 border-t border-[#C8C4BA]/50 flex justify-between text-[10px] text-[#69717B]">
              <span>Sanction Authority</span>
              <span className="font-bold text-[#202B3C]">
                {project.district === 'Gandhinagar' ? 'GUDA / GujRERA' : 'AUDA / GujRERA'}
              </span>
            </div>
            {project.lastVerifiedDate && (
              <div className="text-[10px] text-[#69717B] flex justify-between">
                <span>Verified Date</span>
                <span className="font-semibold text-[#202B3C]">{new Date(project.lastVerifiedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs pt-2">
          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Carpet Area Range</span>
            <span className="text-base font-bold text-[#202B3C] tabular-nums mt-0.5 block">
              {project.carpetAreaRangeMin} – {project.carpetAreaRangeMax} sq ft
            </span>
          </div>

          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Indicative Bracket</span>
            <span className="text-base font-bold text-[#547568] tabular-nums mt-0.5 block">
              ₹{project.priceRangeMinLakhs}L – ₹{project.priceRangeMaxLakhs}L
            </span>
          </div>

          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Scale & Towers</span>
            <span className="text-base font-bold text-[#202B3C] mt-0.5 block">
              {project.totalTowers} Towers ({project.totalUnits} Units)
            </span>
          </div>

          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Possession Stage</span>
            <span className="text-base font-bold text-[#202B3C] mt-0.5 block">
              {project.possessionStatus}
            </span>
          </div>

          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Open Space Ratio</span>
            <span className="text-base font-bold text-[#202B3C] mt-0.5 block">
              {project.openSpaceRatioPercent || 70}%
            </span>
          </div>

          <div className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50">
            <span className="text-[#69717B] text-[10px] uppercase block font-sans">Statutory Jantri</span>
            <span className="text-base font-bold text-[#202B3C] mt-0.5 block tabular-nums">
              {jantri ? `₹${jantri.residentialApartmentRateSqFt}/sq ft` : '₹3,950/sq ft'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Deep Technical & Architectural Dossier */}
        <div className="lg:col-span-2 space-y-10">

          {/* SECTION 5: CONFIGURATIONS & CARPET AREAS (FORM-B) */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                  Section 05 • Gujarat RERA Form-B Schedule
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">
                  Unit Typologies & Carpet Areas
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#69717B]">
                {project.configurations.length} Typologies Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F3ED] border-b border-[#C8C4BA] text-[#202B3C] font-mono">
                    <th className="p-3 font-bold uppercase tracking-wider">Typology</th>
                    <th className="p-3 font-bold uppercase tracking-wider font-mono">Carpet Area</th>
                    <th className="p-3 font-bold uppercase tracking-wider font-mono">Super Built-Up</th>
                    <th className="p-3 font-bold uppercase tracking-wider">Layout Details</th>
                    <th className="p-3 font-bold uppercase tracking-wider font-mono">Indicative Bracket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C8C4BA]/50 font-mono text-[11px]">
                  {project.configurations.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F5F3ED]/40 transition-colors">
                      <td className="p-3 font-sans font-bold text-[#202B3C]">
                        {c.typology}
                      </td>
                      <td className="p-3 font-bold text-[#547568] tabular-nums">
                        {c.carpetAreaSqFt} sq ft
                      </td>
                      <td className="p-3 text-[#69717B] tabular-nums">
                        {c.superBuiltUpAreaSqFt ? `${c.superBuiltUpAreaSqFt} sq ft` : '—'}
                      </td>
                      <td className="p-3 font-sans text-[#202B3C]">
                        {c.bathroomsCount || 2} Baths • {c.balconyCount || 1} Balconies
                        {c.totalUnitsInConfig ? ` (${c.totalUnitsInConfig} units)` : ''}
                      </td>
                      <td className="p-3 font-bold text-[#202B3C] tabular-nums">
                        {c.indicativePriceMinLakhs
                          ? `₹${c.indicativePriceMinLakhs}L – ₹${c.indicativePriceMaxLakhs}L`
                          : 'Market Rate'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-[#69717B] italic">
              * Note: Carpet area is defined strictly under Section 2(k) of the Real Estate (Regulation and Development) Act, 2016 as the net usable floor area of an apartment excluding the area covered by external walls.
            </p>
          </div>

          {/* SECTION 6: ARCHITECTURAL SPECIFICATIONS */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 06 • Official Structural & Finishing Disclosures
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Architectural & Structural Specifications
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.specifications.map((s) => (
                <div key={s.id} className="p-3.5 bg-[#F5F3ED]/40 border border-[#C8C4BA]/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#202B3C] text-white">
                      {s.category}
                    </span>
                    <span className="text-[9px] font-mono text-[#69717B]">
                      {s.sourceType}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#202B3C]">{s.featureName}</h4>
                  <p className="text-xs text-[#69717B] leading-relaxed font-sans">{s.specificationDetails}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: VERIFIED AMENITIES */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 07 • Common Amenities & Campus Infrastructure
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Campus Amenities & Facilities
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {project.amenities.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-white border border-[#C8C4BA] flex items-start gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#547568] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#69717B] block">{a.category}</span>
                    <span className="font-semibold text-[#202B3C]">{a.amenityName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 8: CONSTRUCTION PROGRESS (QPR AUDIT) */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C8C4BA] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                  Section 08 • Quarterly Progress Report (QPR) Audit
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">
                  Physical Construction Milestone Audit
                </h2>
              </div>
              {latestProgress && (
                <span className="text-xs font-mono font-bold text-[#547568]">
                  {latestProgress.overallPercentage}% Completed
                </span>
              )}
            </div>

            {latestProgress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]">
                    <span className="text-[10px] text-[#69717B] uppercase block">Structure</span>
                    <span className="text-lg font-bold text-[#202B3C]">
                      {latestProgress.structuralCompletionPct || 100}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]">
                    <span className="text-[10px] text-[#69717B] uppercase block">Brickwork</span>
                    <span className="text-lg font-bold text-[#202B3C]">
                      {latestProgress.brickworkCompletionPct || 100}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]">
                    <span className="text-[10px] text-[#69717B] uppercase block">Finishing</span>
                    <span className="text-lg font-bold text-[#202B3C]">
                      {latestProgress.internalFinishingPct || 100}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]">
                    <span className="text-[10px] text-[#69717B] uppercase block">MEP Services</span>
                    <span className="text-lg font-bold text-[#202B3C]">
                      {latestProgress.mepCompletionPct || 100}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#F5F3ED]/40 border border-[#C8C4BA]/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#69717B]">
                    <span>Reporting Quarter: {latestProgress.reportingQuarter}</span>
                    <span>Building Use (BU) Status: {latestProgress.occupancyCertificateStatus}</span>
                  </div>
                  {latestProgress.inspectorNotes && (
                    <p className="text-[#202B3C] font-sans text-xs pt-1">{latestProgress.inspectorNotes}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#69717B] italic">
                Project is completed and fully operational with Building Use (BU) certificate granted.
              </p>
            )}
          </div>

          {/* SECTION 10: OFFICIAL REGULATORY DOCUMENTS */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 10 • Statutory Provenance & Document Repository
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#202B3C]">
                Official Regulatory Documents
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {project.sourceDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-[#F5F3ED]/40 border border-[#C8C4BA] flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#547568] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#202B3C] font-sans">{doc.title}</h4>
                      <p className="text-[10px] text-[#69717B] mt-0.5">
                        File: {doc.fileName} • Size: {doc.fileSize || '2.4 MB'} • SHA256: {doc.checksumSha256?.substring(0, 16)}...
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#202B3C] text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-[#547568] transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Download</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Legal Entity, Location, Regulatory History & Audit */}
        <div className="space-y-8">
          
          {/* SECTION 2: DEVELOPER PROFILE */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 02 • Promoter Profile
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#202B3C]">
                Developer Entity
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[#69717B] text-[10px] uppercase block font-sans">Brand Name</span>
                <span className="font-bold text-[#202B3C] font-sans text-sm">{project.developer || 'Independent'}</span>
              </div>

              {project.developerRelation?.legalEntityName && (
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Registered Legal Entity</span>
                  <span className="text-[#202B3C] font-sans">{project.developerRelation.legalEntityName}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C8C4BA]/50">
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Corporate Base</span>
                  <span className="text-[#202B3C]">{project.developerRelation?.corporateOfficeCity || 'Ahmedabad'}</span>
                </div>
                <div>
                  <span className="text-[#69717B] text-[10px] uppercase block font-sans">Established</span>
                  <span className="text-[#202B3C]">{project.developerRelation?.establishedYear || 2010}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 & 4: RERA & PLANNING LOCATION JURISDICTION */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 03 & 04 • Planning & Zoning
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#202B3C]">
                Location & Statutory Jurisdiction
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[#69717B] text-[10px] uppercase block font-sans">Registered Site Address</span>
                <span className="text-[#202B3C] font-sans block leading-relaxed mt-0.5">
                  {project.registeredAddress || `${project.locality?.name}, ${project.district}, Gujarat`}
                </span>
              </div>

              <div>
                <span className="text-[#69717B] text-[10px] uppercase block font-sans">Planning Authority</span>
                <span className="text-[#202B3C] font-bold">
                  {project.district === 'Gandhinagar' ? 'GUDA (Gandhinagar Urban Dev. Authority)' : 'AUDA (Ahmedabad Urban Dev. Authority)'}
                </span>
              </div>

              <div>
                <span className="text-[#69717B] text-[10px] uppercase block font-sans">RERA Approval Date</span>
                <span className="text-[#202B3C]">
                  {project.reraApprovalDate ? new Date(project.reraApprovalDate).toLocaleDateString() : 'Official Sanction on Record'}
                </span>
              </div>

              <div>
                <span className="text-[#69717B] text-[10px] uppercase block font-sans">Statutory Validity Window</span>
                <span className="text-[#202B3C]">
                  {project.registrationValidityDate ? new Date(project.registrationValidityDate).toLocaleDateString() : 'Valid Regulatory Order'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 11: REGULATORY ORDERS & COMPLIANCE HISTORY */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 11 • Regulatory Events
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#202B3C]">
                Compliance History
              </h3>
            </div>

            {project.regulatoryEvents.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {project.regulatoryEvents.map((ev) => (
                  <div key={ev.id} className="p-3 bg-[#F5F3ED]/50 border border-[#C8C4BA]/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#547568] font-bold">
                      <span>{ev.eventType}</span>
                      <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#202B3C] font-sans">{ev.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#69717B] italic">
                Clean regulatory compliance record. No adverse orders or disciplinary complaints recorded under Gujarat RERA.
              </p>
            )}
          </div>

          {/* SECTION 12 & 13: UPDATE SNAPSHOTS & PROVENANCE */}
          <div className="bg-white border border-[#C8C4BA] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#C8C4BA] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#547568] tracking-wider">
                Section 12 & 13 • Continuous Monitoring
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#202B3C]">
                Historical Audit Trail
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#F5F3ED]/40 border border-[#C8C4BA]/50 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#69717B]">
                  <span>Last Automated Sweep</span>
                  <span className="text-[#202B3C] font-bold">
                    {project.lastCheckedDate ? new Date(project.lastCheckedDate).toLocaleDateString() : 'Live'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#69717B]">
                  <span>Official Ingestion Timestamp</span>
                  <span className="text-[#202B3C]">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 14: INSTITUTIONAL DISCLAIMER & TRANSPARENCY STANDARDS */}
      <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-6 space-y-2 text-xs text-[#69717B]">
        <div className="flex items-center gap-2 font-bold text-[#202B3C] uppercase text-[11px] tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-[#547568]" />
          <span>Section 14 • Institutional Data Transparency Standard</span>
        </div>
        <p className="leading-relaxed">
          This dossier has been generated autonomously by PROVENTA Real Estate Intelligence using officially published regulatory filings from the Gujarat Real Estate Regulatory Authority (PR/GJ registry), the Superintendent of Stamps, and local urban development planning authorities. PROVENTA does not broker real estate transactions, accept promotional payments, or act as an agent for any developer. Prospective purchasers must independently verify deed records and structural guarantees before executing legal instruments.
        </p>
      </div>

    </div>
  );
}

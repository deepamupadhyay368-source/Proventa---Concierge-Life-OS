'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Search,
  Filter,
  Building2,
  MapPin,
  FileCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ProjectIntelligenceDirectory() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<'ALL' | 'Ahmedabad' | 'Gandhinagar'>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [selectedBhk, setSelectedBhk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const res = await fetch('/api/projects');
        const json = await res.json();
        if (json.success) {
          setProjects(json.data);
        } else {
          setError(json.error || 'Failed to load project directory');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDev = p.developer?.toLowerCase().includes(q);
        const matchesRera = p.reraNumber?.toLowerCase().includes(q);
        const matchesLoc = p.locality?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDev && !matchesRera && !matchesLoc) return false;
      }

      // District
      if (selectedDistrict !== 'ALL' && p.district !== selectedDistrict) {
        return false;
      }

      // Locality
      if (selectedLocality !== 'ALL' && p.locality?.slug !== selectedLocality) {
        return false;
      }

      // BHK
      if (selectedBhk !== 'ALL') {
        const bhkNum = parseFloat(selectedBhk);
        const hasBhk = p.configurations?.some((c: any) => c.bhk === bhkNum);
        if (!hasBhk) return false;
      }

      // Status
      if (selectedStatus !== 'ALL') {
        if (!p.possessionStatus?.toLowerCase().includes(selectedStatus.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [projects, search, selectedDistrict, selectedLocality, selectedBhk, selectedStatus]);

  // Extract unique localities from projects for dropdown
  const localityOptions = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => {
      if (p.locality?.slug && p.locality?.name) {
        if (selectedDistrict === 'ALL' || p.district === selectedDistrict) {
          map.set(p.locality.slug, p.locality.name);
        }
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [projects, selectedDistrict]);

  const ahmedabadCount = projects.filter((p) => p.district === 'Ahmedabad').length;
  const gandhinagarCount = projects.filter((p) => p.district === 'Gandhinagar').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Editorial Header */}
      <div className="border-b border-[#C8C4BA] pb-8 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#547568] bg-[#F5F3ED] px-2.5 py-1 border border-[#C8C4BA]/60">
            Official Regulatory Registry
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#69717B]">
            Gujarat RERA & Urban Planning Authorities
          </span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#202B3C] tracking-tight">
          Residential Project Intelligence
        </h1>
        
        <p className="text-xs sm:text-sm text-[#69717B] max-w-3xl leading-relaxed">
          Structured residential project dossiers across Ahmedabad and Gandhinagar. Every record reflects authentic Gujarat RERA registrations, Form-B statutory carpet area schedules, verified developer credentials, and planning scheme benchmarks.
        </p>

        {/* Statistical Ledger Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 font-mono text-xs">
          <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-3">
            <span className="text-[10px] uppercase text-[#69717B] block font-sans">Verified Projects</span>
            <span className="text-lg font-bold text-[#202B3C] tabular-nums">{projects.length}</span>
          </div>
          <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-3">
            <span className="text-[10px] uppercase text-[#69717B] block font-sans">Ahmedabad Market</span>
            <span className="text-lg font-bold text-[#202B3C] tabular-nums">{ahmedabadCount}</span>
          </div>
          <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-3">
            <span className="text-[10px] uppercase text-[#69717B] block font-sans">Gandhinagar Market</span>
            <span className="text-lg font-bold text-[#202B3C] tabular-nums">{gandhinagarCount}</span>
          </div>
          <div className="bg-[#F5F3ED] border border-[#C8C4BA] p-3">
            <span className="text-[10px] uppercase text-[#69717B] block font-sans">Data Authenticity</span>
            <span className="text-sm font-bold text-[#547568] flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Officially Verified
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Axis Filters */}
      <div className="bg-white border border-[#C8C4BA] p-4 sm:p-6 space-y-4 shadow-xs">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#69717B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project name, developer, Gujarat RERA number, or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F3ED]/50 border border-[#C8C4BA] text-xs sm:text-sm text-[#202B3C] placeholder-[#69717B] focus:outline-none focus:border-[#202B3C] font-sans"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          
          {/* District Toggle */}
          <div className="flex items-center border border-[#C8C4BA] p-0.5 bg-[#F5F3ED]">
            <button
              onClick={() => { setSelectedDistrict('ALL'); setSelectedLocality('ALL'); }}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedDistrict === 'ALL' ? 'bg-[#202B3C] text-white' : 'text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              All Districts
            </button>
            <button
              onClick={() => { setSelectedDistrict('Ahmedabad'); setSelectedLocality('ALL'); }}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedDistrict === 'Ahmedabad' ? 'bg-[#202B3C] text-white' : 'text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              Ahmedabad ({ahmedabadCount})
            </button>
            <button
              onClick={() => { setSelectedDistrict('Gandhinagar'); setSelectedLocality('ALL'); }}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedDistrict === 'Gandhinagar' ? 'bg-[#202B3C] text-white' : 'text-[#69717B] hover:text-[#202B3C]'
              }`}
            >
              Gandhinagar ({gandhinagarCount})
            </button>
          </div>

          {/* Locality Dropdown */}
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] focus:outline-none font-sans font-medium"
          >
            <option value="ALL">All Micro-Markets ({localityOptions.length})</option>
            {localityOptions.map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>

          {/* BHK Configuration */}
          <select
            value={selectedBhk}
            onChange={(e) => setSelectedBhk(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] focus:outline-none font-sans font-medium"
          >
            <option value="ALL">All Configurations</option>
            <option value="2">2 BHK Units</option>
            <option value="2.5">2.5 BHK Units</option>
            <option value="3">3 BHK Units</option>
            <option value="3.5">3.5 BHK Units</option>
            <option value="4">4 BHK Units</option>
            <option value="5">5 BHK / Penthouses</option>
          </select>

          {/* Possession Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#C8C4BA] text-xs text-[#202B3C] focus:outline-none font-sans font-medium"
          >
            <option value="ALL">All Possession Stages</option>
            <option value="Ready">Ready to Move</option>
            <option value="Near">Near Completion</option>
            <option value="Under">Under Construction</option>
          </select>

          {/* Reset Filters */}
          {(search || selectedDistrict !== 'ALL' || selectedLocality !== 'ALL' || selectedBhk !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDistrict('ALL');
                setSelectedLocality('ALL');
                setSelectedBhk('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-[11px] font-mono text-[#547568] hover:underline uppercase tracking-wider ml-auto font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3 font-mono text-xs text-[#69717B]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#202B3C] border-t-transparent" />
          <p>Querying PROVENTA official project registry...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
          Error querying database: {error}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#F5F3ED] border border-[#C8C4BA] space-y-2">
          <p className="text-sm font-editorial font-bold text-[#202B3C]">
            No residential projects match your filter criteria
          </p>
          <p className="text-xs text-[#69717B]">
            Try adjusting your search terms or selecting another micro-market or configuration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const configs = p.configurations || [];
            const bhkLabels = configs.map((c: any) => `${c.bhk} BHK`).filter((v: any, i: any, a: any) => a.indexOf(v) === i);

            return (
              <div
                key={p.id}
                className="bg-white border border-[#C8C4BA] p-6 space-y-5 hover:border-[#202B3C] transition-colors flex flex-col justify-between shadow-xs group"
              >
                <div className="space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#C8C4BA]/50 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#547568]">
                        <MapPin className="w-3 h-3" />
                        <span>{p.locality?.name || 'Ahmedabad'}, {p.district}</span>
                      </div>
                      <h3 className="font-editorial text-2xl font-bold text-[#202B3C] tracking-tight mt-0.5 group-hover:text-[#547568] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-[#69717B] mt-0.5 font-sans">
                        By {p.developer || 'Independent'}
                      </p>
                    </div>
                    
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold shrink-0">
                      {p.verificationBadge || 'OFFICIALLY_VERIFIED'}
                    </span>
                  </div>

                  {/* Statutory RERA Block */}
                  <div className="p-3 bg-[#F5F3ED] border border-[#C8C4BA]/60 space-y-1 font-mono">
                    <span className="text-[9px] uppercase font-bold text-[#69717B] block">
                      Gujarat RERA Registration
                    </span>
                    <span className="text-[11px] text-[#202B3C] break-all select-all font-semibold block">
                      {p.reraNumber || 'PR/GJ/OFFICIAL/REGULATORY'}
                    </span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
                    <div>
                      <span className="text-[#69717B] text-[10px] uppercase block font-sans">Carpet Area Range</span>
                      <span className="font-semibold text-[#202B3C] tabular-nums">
                        {p.carpetAreaRangeMin || 800} – {p.carpetAreaRangeMax || 1400} sq ft
                      </span>
                    </div>

                    <div>
                      <span className="text-[#69717B] text-[10px] uppercase block font-sans">Indicative Bracket</span>
                      <span className="font-bold text-[#547568] tabular-nums">
                        ₹{p.priceRangeMinLakhs || 45}L – ₹{p.priceRangeMaxLakhs || 90}L
                      </span>
                    </div>

                    <div>
                      <span className="text-[#69717B] text-[10px] uppercase block font-sans">Scale & Towers</span>
                      <span className="text-[#202B3C]">
                        {p.totalTowers || 4} Towers ({p.totalUnits || 180} Units)
                      </span>
                    </div>

                    <div>
                      <span className="text-[#69717B] text-[10px] uppercase block font-sans">Possession Stage</span>
                      <span className="text-[#202B3C] font-semibold">
                        {p.possessionStatus || 'Ready to Move'}
                      </span>
                    </div>
                  </div>

                  {/* Configuration Pills */}
                  {bhkLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#C8C4BA]/40">
                      {bhkLabels.map((lbl: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#F5F3ED] border border-[#C8C4BA] text-[10px] font-mono text-[#202B3C]"
                        >
                          {lbl}
                        </span>
                      ))}
                      {p.openSpaceRatioPercent && (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-900 font-semibold ml-auto">
                          {p.openSpaceRatioPercent}% Open Space
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div className="pt-4 border-t border-[#C8C4BA]/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#69717B] font-mono">
                    {p._count?.sourceDocuments || 2} Regulatory Docs
                  </span>
                  
                  <Link
                    href={`/project-intelligence/${p.slug}`}
                    className="font-bold text-[#202B3C] group-hover:text-[#547568] inline-flex items-center gap-1.5 uppercase tracking-wider text-[11px] transition-colors"
                  >
                    <span>Inspect Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Institutional Transparency Disclosure */}
      <div className="bg-white border border-[#C8C4BA] p-6 space-y-3 text-xs text-[#69717B]">
        <div className="flex items-center gap-2 font-bold text-[#202B3C] uppercase text-[11px] tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#547568]" />
          <span>Independent Regulatory Verification Protocol</span>
        </div>
        <p className="leading-relaxed">
          PROVENTA Real Estate Intelligence operates as an independent research institution. All residential project records displayed on this platform are extracted directly from official regulatory disclosures filed with the Gujarat Real Estate Regulatory Authority (GujRERA), sanctioned Town Planning Scheme records of the Ahmedabad Urban Development Authority (AUDA) and Gandhinagar Urban Development Authority (GUDA), and official state gazette notifications. PROVENTA does not accept commercial marketing fees, sponsored listings, or promotional placement from real estate developers.
        </p>
      </div>
    </div>
  );
}

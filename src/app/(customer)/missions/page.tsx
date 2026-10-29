'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Layers,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import type { MissionDTO } from '@/lib/marketplace/mission-types';

export default function MissionsHubPage() {
  const [missions, setMissions] = useState<MissionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      setLoading(true);
      try {
        const res = await fetch('/api/marketplace/missions');
        const data = await res.json();
        if (data.items) {
          setMissions(data.items);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    void loadMissions();
  }, []);

  const totalQuotes = missions.reduce((acc, m) => acc + (m.quotations?.length || 0), 0);
  const activeMissions = missions.filter((m) => !['COMPLETED', 'CANCELLED'].includes(m.missionStage));

  return (
    <div>
      {/* Header */}
      <section className="bg-[#171A14] text-[#F6F0E4] border-b border-[#4C4A40]/70 py-10 lg:py-14">
        <div className="container-wide flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#B94E2D]">
                PROVENTA Mission Engine
              </span>
              <span className="text-[#4C4A40]">·</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#A7A194]">
                Enterprise Discovery &amp; Quotation Cockpit
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.02em] text-[#F6F0E4]">
              Business <span className="text-[#B94E2D]">Missions.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 border border-[#4C4A40] bg-[#20211C] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F6F0E4] hover:border-[#A98253] transition-colors"
            >
              <span>Explore Businesses</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/missions/new" className="btn-terracotta">
              <Plus className="h-4 w-4" />
              <span>Initialize New Mission</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="container-wide py-10 lg:py-14">
        {/* Telemetry Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-[#D5CBB8] bg-[#FAF6EC] divide-y sm:divide-y-0 sm:divide-x divide-[#D5CBB8] mb-8 font-mono">
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Total Missions
            </div>
            <div className="mt-2 font-display text-3xl text-[#181914]">
              {String(missions.length).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Active In Flight
            </div>
            <div className="mt-2 font-display text-3xl text-[#181914]">
              {String(activeMissions.length).padStart(2, '0')}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6B675E]">
              Received Quotations
            </div>
            <div className="mt-2 font-display text-3xl text-[#181914]">
              {String(totalQuotes).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Missions List */}
        {loading ? (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-12 font-mono text-xs uppercase tracking-[0.14em] text-[#6B675E]">
            Loading active missions...
          </div>
        ) : missions.length > 0 ? (
          <div className="space-y-4">
            {missions.map((mission) => {
              const quoteCount = mission.quotations?.length || 0;
              const isAccepted = mission.missionStage === 'OFFER_ACCEPTED';
              const isDone = mission.missionStage === 'COMPLETED';

              return (
                <div
                  key={mission.id}
                  className="border border-[#D5CBB8] bg-[#FAF6EC] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-[#181914] transition-colors"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                      <span className="badge-neutral">{mission.referenceCode}</span>
                      <span className="text-[#A98253]">{mission.categoryName}</span>
                      <span className="text-[#D5CBB8]">·</span>
                      <span className="text-[#6B675E]">{mission.city}</span>
                      <span className="badge-verified">{mission.missionStage}</span>
                    </div>

                    <h2 className="font-display text-2xl font-normal text-[#181914]">
                      <Link href={`/missions/${mission.id}`} className="hover:text-[#B94E2D]">
                        {mission.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-[#5C584F] line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>

                    <div className="flex flex-wrap gap-4 font-mono text-xs text-[#6B675E] pt-1">
                      <span>Timeline: {mission.timeline || 'Flexible'}</span>
                      <span>·</span>
                      <span>
                        Budget: {mission.budgetMax ? `₹${mission.budgetMin || 0} – ₹${mission.budgetMax}` : 'Open'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#D5CBB8] shrink-0">
                    <div className="font-mono text-right">
                      <div className="font-display text-2xl text-[#181914]">
                        {quoteCount} {quoteCount === 1 ? 'Offer' : 'Offers'}
                      </div>
                      <div className="text-[11px] text-[#6B675E]">
                        {mission.candidateSuppliers?.length || 0} Matched Suppliers
                      </div>
                    </div>

                    <Link href={`/missions/${mission.id}`} className="btn-terracotta py-2.5 px-4">
                      <span>Open Cockpit</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-[#D5CBB8] bg-[#FAF6EC] p-8 sm:p-12 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E9DFCC] text-[#B94E2D]">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-normal text-[#181914]">
              No Business Missions Launched Yet
            </h2>
            <p className="text-sm text-[#5C584F] max-w-lg mx-auto">
              Initialize a mission by describing your business requirement. Our engine will structure
              deliverables, match verified businesses, and invite formal quotations.
            </p>
            <div className="pt-2">
              <Link href="/missions/new" className="btn-terracotta">
                <Sparkles className="h-4 w-4" />
                <span>Initialize Your First Mission</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Layers,
  Crosshair,
  ZoomIn,
  ZoomOut,
  MapPin,
  Building2,
  TrendingUp,
  Satellite,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  GUJARAT_SATELLITE_LOCALITIES,
  GUJARAT_CORRIDOR_GEOJSON,
  buildLocalityBoundaryGeoJson,
  getSatelliteProviderConfig,
  type SatelliteLocalityCoordinate,
} from '@/lib/real-estate-intelligence/satellite-config';

interface MarketCorridorRecord {
  slug: string;
  name: string;
  city: string;
  zone: string;
  benchmark: {
    status: 'RELIABLE' | 'INSUFFICIENT_DATA';
    formattedMedianPriceSqFt: string | null;
    averageRentalYieldPct: number | null;
    observationCount: number;
    latestReportingPeriod: string | null;
    sources: string[];
  };
  infrastructureSummary: {
    total: number;
    operational: number;
    underConstruction: number;
    proposed: number;
  };
}

interface ProjectRecord {
  id: string;
  slug: string;
  name: string;
  developer: string | null;
  reraNumber: string | null;
  locality?: { slug: string; name: string } | null;
}

export interface GujaratSatelliteMapProps {
  initialLocalitySlug?: string;
  heightClass?: string;
  compact?: boolean;
  onSelectLocality?: (localityName: string, localitySlug: string) => void;
}

export default function GujaratSatelliteMap({
  initialLocalitySlug = 'sg-highway',
  heightClass = 'h-[480px] lg:h-[560px]',
  compact = false,
  onSelectLocality,
}: GujaratSatelliteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const provider = useMemo(() => getSatelliteProviderConfig(), []);
  const [baseLayer, setBaseLayer] = useState<'satellite' | 'dark-streets'>('satellite');
  const [showCorridors, setShowCorridors] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialLocalitySlug);
  const [mapReady, setMapReady] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const [marketCorridors, setMarketCorridors] = useState<MarketCorridorRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  // Sync external initialLocalitySlug updates
  useEffect(() => {
    if (initialLocalitySlug) {
      setSelectedSlug(initialLocalitySlug);
    }
  }, [initialLocalitySlug]);

  // Load real verified market benchmarks & RERA projects from live APIs
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/real-estate/market?segment=RESIDENTIAL')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch('/api/projects')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([marketJson, projectJson]) => {
      if (!active) return;
      if (marketJson?.corridors && Array.isArray(marketJson.corridors)) {
        setMarketCorridors(marketJson.corridors);
      }
      if (projectJson?.data && Array.isArray(projectJson.data)) {
        setProjects(projectJson.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const selectedLocality: SatelliteLocalityCoordinate = useMemo(() => {
    return (
      GUJARAT_SATELLITE_LOCALITIES.find(
        (l) => l.slug === selectedSlug || l.name.toLowerCase() === selectedSlug.toLowerCase()
      ) || GUJARAT_SATELLITE_LOCALITIES[0]
    );
  }, [selectedSlug]);

  const selectedMarket = useMemo(() => {
    return marketCorridors.find(
      (c) =>
        c.slug.toLowerCase() === selectedLocality.slug.toLowerCase() ||
        c.name.toLowerCase() === selectedLocality.name.toLowerCase()
    );
  }, [marketCorridors, selectedLocality]);

  const selectedProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.locality?.slug?.toLowerCase() === selectedLocality.slug.toLowerCase() ||
        p.locality?.name?.toLowerCase() === selectedLocality.name.toLowerCase()
    );
  }, [projects, selectedLocality]);

  const projectCountBySlug = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const key = p.locality?.slug?.toLowerCase();
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [projects]);

  // Initialize MapLibre GL once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        center: [72.54, 23.06],
        zoom: 10.6,
        minZoom: 8.5,
        maxZoom: provider.maxZoom,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: provider.satelliteTiles,
              tileSize: provider.tileSize,
              attribution: provider.attribution,
            },
            'dark-streets': {
              type: 'raster',
              tiles: provider.darkStreetTiles,
              tileSize: 256,
              attribution: '© OpenStreetMap contributors · © CARTO',
            },
            'dark-labels': {
              type: 'raster',
              tiles: provider.labelOverlayTiles,
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'esri-satellite',
              paint: {
                'raster-brightness-max': 0.88,
                'raster-contrast': 0.14,
                'raster-saturation': -0.18,
              },
            },
            {
              id: 'dark-streets-layer',
              type: 'raster',
              source: 'dark-streets',
              layout: { visibility: 'none' },
            },
            {
              id: 'labels-layer',
              type: 'raster',
              source: 'dark-labels',
              paint: { 'raster-opacity': 0.85 },
            },
          ],
        },
      });

      map.on('load', () => {
        // Locality study boundaries
        map.addSource('locality-boundaries', {
          type: 'geojson',
          data: buildLocalityBoundaryGeoJson(),
        });
        map.addLayer({
          id: 'locality-boundaries-fill',
          type: 'fill',
          source: 'locality-boundaries',
          paint: {
            'fill-color': '#4D9FFF',
            'fill-opacity': 0.08,
          },
        });
        map.addLayer({
          id: 'locality-boundaries-line',
          type: 'line',
          source: 'locality-boundaries',
          paint: {
            'line-color': '#4D9FFF',
            'line-width': 1.2,
            'line-opacity': 0.55,
            'line-dasharray': [3, 2],
          },
        });

        // Verified development corridors
        map.addSource('growth-corridors', {
          type: 'geojson',
          data: GUJARAT_CORRIDOR_GEOJSON,
        });
        map.addLayer({
          id: 'growth-corridors-line',
          type: 'line',
          source: 'growth-corridors',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2.5,
            'line-opacity': 0.82,
          },
        });

        setMapReady(true);
      });

      map.on('error', () => {
        // Individual tile timeouts are non-fatal; keep map responsive
      });

      mapRef.current = map;

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      setWebglError(
        err instanceof Error
          ? err.message
          : 'WebGL context unavailable in this browser environment.'
      );
    }
  }, [provider]);

  // Update layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty(
        'satellite-layer',
        'visibility',
        baseLayer === 'satellite' ? 'visible' : 'none'
      );
    }
    if (map.getLayer('dark-streets-layer')) {
      map.setLayoutProperty(
        'dark-streets-layer',
        'visibility',
        baseLayer === 'dark-streets' ? 'visible' : 'none'
      );
    }
    if (map.getLayer('labels-layer')) {
      map.setLayoutProperty(
        'labels-layer',
        'visibility',
        showLabels && baseLayer === 'satellite' ? 'visible' : 'none'
      );
    }
    if (map.getLayer('growth-corridors-line')) {
      map.setLayoutProperty('growth-corridors-line', 'visibility', showCorridors ? 'visible' : 'none');
    }
    if (map.getLayer('locality-boundaries-fill')) {
      map.setLayoutProperty('locality-boundaries-fill', 'visibility', showBoundaries ? 'visible' : 'none');
    }
    if (map.getLayer('locality-boundaries-line')) {
      map.setLayoutProperty('locality-boundaries-line', 'visibility', showBoundaries ? 'visible' : 'none');
    }
  }, [baseLayer, showLabels, showCorridors, showBoundaries, mapReady]);

  // Render interactive locality markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const loc of GUJARAT_SATELLITE_LOCALITIES) {
      const isSelected = loc.slug === selectedLocality.slug;
      const projCount = projectCountBySlug.get(loc.slug) || 0;

      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', `Inspect ${loc.name}, ${loc.city}`);
      el.className = 'group flex items-center gap-1.5 focus:outline-none cursor-pointer';
      el.innerHTML = `
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:${isSelected ? '14px' : '10px'};height:${isSelected ? '14px' : '10px'};
          background:${isSelected ? '#D7AD69' : '#4D9FFF'};
          border:2px solid #080E18;
          box-shadow:0 0 0 1px ${isSelected ? '#D7AD69' : '#29384B'};
        "></span>
        <span style="
          background:${isSelected ? '#152235' : 'rgba(8,14,24,0.88)'};
          color:${isSelected ? '#F5F7FA' : '#AAB6C5'};
          border:1px solid ${isSelected ? '#D7AD69' : '#29384B'};
          padding:2px 6px;font-size:10px;font-family:monospace;white-space:nowrap;
          letter-spacing:0.04em;
        ">${loc.name}${projCount > 0 ? ` · ${projCount}` : ''}</span>
      `;
      el.addEventListener('click', () => {
        setSelectedSlug(loc.slug);
        onSelectLocality?.(loc.name, loc.slug);
        map.flyTo({
          center: loc.coordinates,
          zoom: loc.zoom,
          duration: 750,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'left' })
        .setLngLat(loc.coordinates)
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [mapReady, selectedLocality.slug, projectCountBySlug, onSelectLocality]);

  const handleSelectCorridor = (loc: SatelliteLocalityCoordinate) => {
    setSelectedSlug(loc.slug);
    onSelectLocality?.(loc.name, loc.slug);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: loc.coordinates,
        zoom: loc.zoom,
        duration: 750,
        essential: true,
      });
    }
  };

  const handleResetView = () => {
    mapRef.current?.flyTo({ center: [72.54, 23.06], zoom: 10.6, duration: 750 });
  };

  return (
    <div className="bg-[#101A29] border border-[#29384B] rounded-xs overflow-hidden">
      {/* Top Control Bar */}
      <div className="px-4 py-3 bg-[#152235] border-b border-[#29384B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Satellite className="w-4 h-4 text-[#D7AD69]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#F5F7FA] font-semibold">
            Gujarat Satellite Intelligence
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 bg-[#080E18] border border-[#29384B] text-[#4D9FFF]">
            {provider.providerName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setBaseLayer(baseLayer === 'satellite' ? 'dark-streets' : 'satellite')}
            className="px-2.5 py-1 bg-[#1B2A3D] hover:bg-[#29384B] border border-[#29384B] text-[#F5F7FA] inline-flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#4D9FFF]" />
            <span>{baseLayer === 'satellite' ? 'Satellite' : 'Dark Vector'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCorridors((v) => !v)}
            className={`px-2.5 py-1 border transition-colors ${
              showCorridors
                ? 'bg-[#1B2A3D] border-[#D7AD69]/70 text-[#D7AD69]'
                : 'bg-[#080E18] border-[#29384B] text-[#748398]'
            }`}
          >
            Corridors
          </button>
          <button
            type="button"
            onClick={() => setShowBoundaries((v) => !v)}
            className={`px-2.5 py-1 border transition-colors ${
              showBoundaries
                ? 'bg-[#1B2A3D] border-[#4D9FFF]/70 text-[#4D9FFF]'
                : 'bg-[#080E18] border-[#29384B] text-[#748398]'
            }`}
          >
            Zones
          </button>
          <button
            type="button"
            onClick={() => setShowLabels((v) => !v)}
            className={`px-2.5 py-1 border transition-colors ${
              showLabels
                ? 'bg-[#1B2A3D] border-[#29384B] text-[#F5F7FA]'
                : 'bg-[#080E18] border-[#29384B] text-[#748398]'
            }`}
          >
            Labels
          </button>
        </div>
      </div>

      {/* Main Split: Interactive Map + Verified Intelligence Telemetry Panel */}
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>
        <div className="lg:col-span-8 relative bg-[#080E18]">
          {webglError ? (
            <div className={`${heightClass} flex flex-col items-center justify-center p-8 text-center space-y-3`}>
              <AlertCircle className="w-7 h-7 text-[#D7AD69]" />
              <div className="text-sm font-semibold text-[#F5F7FA]">
                Interactive WebGL Satellite Canvas Unavailable
              </div>
              <p className="text-xs text-[#AAB6C5] max-w-md">
                {webglError} Select any Gujarat corridor on the right to inspect live database-backed market benchmarks and verified RERA project counts.
              </p>
            </div>
          ) : (
            <div ref={mapContainerRef} className={`${heightClass} w-full`} />
          )}

          {/* Map Zoom / Reset Controls */}
          {!webglError && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => mapRef.current?.zoomIn()}
                aria-label="Zoom in"
                className="w-8 h-8 bg-[#080E18]/90 hover:bg-[#152235] border border-[#29384B] text-[#F5F7FA] flex items-center justify-center"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => mapRef.current?.zoomOut()}
                aria-label="Zoom out"
                className="w-8 h-8 bg-[#080E18]/90 hover:bg-[#152235] border border-[#29384B] text-[#F5F7FA] flex items-center justify-center"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                aria-label="Reset Gujarat corridor view"
                className="w-8 h-8 bg-[#080E18]/90 hover:bg-[#152235] border border-[#29384B] text-[#D7AD69] flex items-center justify-center"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Legend & Provider Attribution */}
          <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="px-2.5 py-1 bg-[#080E18]/90 border border-[#29384B] text-[10px] font-mono text-[#AAB6C5] flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#4D9FFF]" /> Arterial / Ring Road
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#D7AD69]" /> Metro / Industrial Axis
              </span>
            </div>
            <div className="px-2.5 py-1 bg-[#080E18]/90 border border-[#29384B] text-[10px] font-mono text-[#748398]">
              {provider.attribution}
            </div>
          </div>
        </div>

        {/* Right Telemetry Panel — Live Verified Corridor Data */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#29384B] bg-[#101A29] p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-[#29384B] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#D7AD69]">
                  {selectedLocality.city} &bull; {selectedLocality.zone}
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FA] mt-0.5">
                  {selectedLocality.name}
                </h3>
                <div className="text-[11px] font-mono text-[#748398] mt-0.5 tabular-nums">
                  {selectedLocality.coordinates[1].toFixed(4)}° N, {selectedLocality.coordinates[0].toFixed(4)}° E
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 bg-[#152235] border border-[#29384B] text-[#4D9FFF]">
                {selectedLocality.corridorTag}
              </span>
            </div>

            {/* Verified Live Market Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#152235] border border-[#29384B] p-3">
                <div className="text-[10px] font-mono uppercase text-[#748398] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#4D9FFF]" />
                  <span>Median Benchmark</span>
                </div>
                <div className="text-sm font-mono font-bold text-[#F5F7FA] mt-1 tabular-nums">
                  {selectedMarket?.benchmark?.status === 'RELIABLE' &&
                  selectedMarket.benchmark.formattedMedianPriceSqFt
                    ? selectedMarket.benchmark.formattedMedianPriceSqFt
                    : 'INSUFFICIENT_DATA'}
                </div>
                <div className="text-[10px] text-[#748398] mt-0.5 font-mono">
                  {selectedMarket?.benchmark?.observationCount ?? 0} verified obs.
                </div>
              </div>

              <div className="bg-[#152235] border border-[#29384B] p-3">
                <div className="text-[10px] font-mono uppercase text-[#748398] flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#D7AD69]" />
                  <span>RERA Projects</span>
                </div>
                <div className="text-sm font-mono font-bold text-[#F5F7FA] mt-1 tabular-nums">
                  {selectedProjects.length} Published
                </div>
                <div className="text-[10px] text-[#748398] mt-0.5 font-mono">
                  {selectedMarket?.infrastructureSummary?.operational ?? 0} operational infra
                </div>
              </div>
            </div>

            {/* Freshness / Provenance Disclosure */}
            <div className="bg-[#080E18] border border-[#29384B] p-3 text-[11px] text-[#AAB6C5] space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#748398]">
                Source &amp; Observation Freshness
              </div>
              {selectedMarket?.benchmark?.latestReportingPeriod ? (
                <div className="font-mono text-[#F5F7FA]">
                  Period: {selectedMarket.benchmark.latestReportingPeriod} &bull;{' '}
                  {selectedMarket.benchmark.sources.slice(0, 2).join(', ') || 'PROVENTA Verified Ledger'}
                </div>
              ) : (
                <div className="text-[#748398]">
                  Awaiting ≥3 verified market observations for this corridor. Zero fabricated rates displayed.
                </div>
              )}
            </div>

            {/* Quick Corridor Selector Pills */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#748398] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#4D9FFF]" />
                <span>Jump to Gujarat Corridor</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GUJARAT_SATELLITE_LOCALITIES.map((loc) => {
                  const active = loc.slug === selectedLocality.slug;
                  return (
                    <button
                      key={loc.slug}
                      type="button"
                      onClick={() => handleSelectCorridor(loc)}
                      className={`px-2 py-1 text-[11px] font-mono border transition-colors ${
                        active
                          ? 'bg-[#1B2A3D] border-[#D7AD69] text-[#F5F7FA]'
                          : 'bg-[#080E18] border-[#29384B] text-[#AAB6C5] hover:border-[#4D9FFF] hover:text-[#F5F7FA]'
                      }`}
                    >
                      {loc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drill-Down Links */}
          <div className="pt-3 border-t border-[#29384B] flex flex-wrap gap-2">
            <Link
              href={`/market-intelligence?locality=${encodeURIComponent(selectedLocality.name)}`}
              className="flex-1 px-3 py-2 bg-[#4D9FFF] hover:bg-[#3B8EEE] text-[#080E18] text-xs font-semibold text-center inline-flex items-center justify-center gap-1 transition-colors"
            >
              <span>Inspect Market</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/project-intelligence?locality=${encodeURIComponent(selectedLocality.slug)}`}
              className="flex-1 px-3 py-2 bg-[#152235] hover:bg-[#1B2A3D] border border-[#29384B] text-[#F5F7FA] text-xs font-semibold text-center transition-colors"
            >
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

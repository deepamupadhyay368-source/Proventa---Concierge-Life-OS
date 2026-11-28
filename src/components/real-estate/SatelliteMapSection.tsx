'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Satellite } from 'lucide-react';
import type { GujaratSatelliteMapProps } from './GujaratSatelliteMap';

const DynamicGujaratSatelliteMap = dynamic(() => import('./GujaratSatelliteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] lg:h-[560px] bg-[#101A29] border border-[#29384B] flex flex-col items-center justify-center gap-3 text-[#AAB6C5]">
      <Satellite className="w-6 h-6 text-[#4D9FFF] animate-pulse" />
      <span className="text-xs font-mono uppercase tracking-[0.14em]">
        Initializing Satellite Intelligence Engine…
      </span>
    </div>
  ),
});

/**
 * Lazy-mounted wrapper ensuring MapLibre GL WebGL tiles are not loaded
 * until the user scrolls near the satellite intelligence section (Core Web Vitals).
 */
export function SatelliteMapSection(props: GujaratSatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <DynamicGujaratSatelliteMap {...props} />
      ) : (
        <div className="h-[480px] lg:h-[560px] bg-[#101A29] border border-[#29384B] flex flex-col items-center justify-center gap-3 text-[#AAB6C5]">
          <Satellite className="w-6 h-6 text-[#D7AD69]" />
          <span className="text-xs font-mono uppercase tracking-[0.14em]">
            Gujarat Satellite Intelligence — Scroll to Activate Live Map
          </span>
        </div>
      )}
    </div>
  );
}

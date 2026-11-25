'use client';

import { Bell, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MarketAlertsPage() {
  const alerts = [
    {
      id: 'alt-01',
      date: '20-Oct-2026',
      title: 'AUDA Town-Planning Arterial Road Sanctioned',
      locality: 'Shela & South Bopal',
      type: 'INFRASTRUCTURE',
      summary: 'AUDA formally approved a 36-meter town-planning road link connecting Shela directly to SP Ring Road. Estimated to impact connectivity and capital valuation for adjacent residential schemes.',
      read: false,
    },
    {
      id: 'alt-02',
      date: '15-Oct-2026',
      title: 'Q3 Sub-Registrar Benchmark Update Published',
      locality: 'West Ahmedabad Zone',
      type: 'PRICE_UPDATE',
      summary: 'Quarterly transaction median updated to ₹4,950/sq ft for Shela based on 410 recorded deeds. Your Property Vault valuation was automatically re-benchmarked.',
      read: true,
    },
    {
      id: 'alt-03',
      date: '02-Oct-2026',
      title: 'RERA Compliance Filing: Shilp Revanta',
      locality: 'Shela',
      type: 'REGULATORY',
      summary: 'Promoter filed Q3 QPR compliance showing 100% occupancy certificate and utility operational clearances.',
      read: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#C8C4BA] pb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#547568] font-bold">
          Notifications Desk
        </span>
        <h1 className="font-editorial text-2xl font-normal text-[#202B3C]">
          Property & Market Alerts
        </h1>
        <p className="text-xs text-[#69717B] mt-1">
          Automated regulatory, pricing, and infrastructure notices for your tracked assets.
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 bg-white border transition-colors ${
              !alt.read ? 'border-[#202B3C]' : 'border-[#C8C4BA]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#547568]/10 text-[#547568] font-bold">
                    {alt.type}
                  </span>
                  <span className="text-xs font-mono text-[#69717B] tabular-nums">{alt.date}</span>
                  <span className="text-xs font-mono text-[#202B3C]">• {alt.locality}</span>
                </div>
                <h3 className="font-editorial text-lg font-normal text-[#202B3C]">{alt.title}</h3>
                <p className="text-xs text-[#69717B] leading-relaxed max-w-2xl">{alt.summary}</p>
              </div>

              {!alt.read && (
                <span className="h-2 w-2 rounded-full bg-[#547568] shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  CheckCircle2, 
  Users, 
  Clock, 
  Building, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { AHMEDABAD_LOCALITIES } from '@/lib/home/constants';
import { homeDataStore } from '@/lib/home/repository';

export default function AdminServiceAreasPage() {
  const technicians = homeDataStore.getAllTechnicians();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Operations • Urban Clusters</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Operational Service Areas</h1>
          <p className="text-xs text-stone-500 mt-1">Live coverage map, technician density & response SLA across Ahmedabad</p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" /> 10 Urban Sectors Live
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Sectors</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">{AHMEDABAD_LOCALITIES.length}</div>
          <span className="text-[11px] text-emerald-700">Western Ahmedabad Hub</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Primary Dispatch Hub</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">South Bopal</div>
          <span className="text-[11px] text-stone-500">Fastest response cluster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Arrival SLA</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">84 mins</div>
          <span className="text-[11px] text-stone-500">Inside confirmed 2-hr window</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Household Coverage</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">100%</div>
          <span className="text-[11px] text-emerald-700">All registered societies</span>
        </div>
      </div>

      {/* Localities Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#171A17]">Ahmedabad Operational Hubs Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Sector / Locality</th>
                <th className="py-3 px-4">PIN Code(s)</th>
                <th className="py-3 px-4">Active Technicians</th>
                <th className="py-3 px-4">Standard Arrival Window</th>
                <th className="py-3 px-4">Emergency Standby</th>
                <th className="py-3 px-4 text-right">Cluster Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {AHMEDABAD_LOCALITIES.map((loc) => {
                const techCount = technicians.filter(t => t.operatingLocality === loc.name).length;
                return (
                  <tr key={loc.name} className="hover:bg-stone-50/70 transition">
                    <td className="py-4 px-4 font-bold text-stone-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#53634A]" />
                      <span>{loc.name}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-stone-600">
                      {loc.pincodes.join(', ')}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-800">
                      {techCount > 0 ? `${techCount} dedicated leads` : 'Covered via central hub'}
                    </td>
                    <td className="py-4 px-4 text-stone-600">
                      2-Hour Scheduled Window
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-emerald-700 font-medium">✓ Active</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        OPERATIONAL
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

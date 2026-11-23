'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building, 
  Users, 
  MapPin, 
  CheckCircle2, 
  CalendarCheck, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function AdminSocietiesPage() {
  const societies = homeDataStore.getAllSocieties();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Operations • Residential Communities</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Society Partnerships & Accounts</h1>
          <p className="text-xs text-stone-500 mt-1">Bulk residential society tie-ups, RWA maintenance drives & common infrastructure audits</p>
        </div>

        <Link
          href="/societies"
          className="inline-flex items-center gap-1.5 text-xs text-[#53634A] hover:underline font-semibold self-start sm:self-auto"
        >
          <span>View Public Societies Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Partner Societies</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">{societies.length}</div>
          <span className="text-[11px] text-emerald-700">RWA MoUs Signed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Residential Units</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">
            {societies.reduce((acc, s) => acc + s.totalFlatsOrUnits, 0)} Flats
          </div>
          <span className="text-[11px] text-stone-500">Addressable households</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subscribed Households</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {societies.reduce((acc, s) => acc + s.enrolledHouseholdsCount, 0)} Homes
          </div>
          <span className="text-[11px] text-stone-500">Active member penetration</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Maintenance Drives</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1">3 Active</div>
          <span className="text-[11px] text-stone-500">Pre-monsoon & electrical audits</span>
        </div>
      </div>

      {/* Societies Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#171A17]">Partner Society Accounts Roster</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Society Name / ID</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Total Flats</th>
                <th className="py-3 px-4">Subscribed Homes</th>
                <th className="py-3 px-4">Penetration</th>
                <th className="py-3 px-4 text-right">MOU Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {societies.map(soc => {
                const percentage = Math.round((soc.enrolledHouseholdsCount / soc.totalFlatsOrUnits) * 100);
                return (
                  <tr key={soc.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#53634A]" />
                        <span>{soc.societyName}</span>
                      </div>
                      <div className="font-mono text-[11px] text-stone-400">{soc.id}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-stone-700">
                      {soc.locality}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-800">
                      {soc.totalFlatsOrUnits} units
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-700">
                      {soc.enrolledHouseholdsCount} members
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#53634A] h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="font-semibold text-stone-600">{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {soc.contractStatus}
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

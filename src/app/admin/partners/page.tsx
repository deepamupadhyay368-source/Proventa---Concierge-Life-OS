'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Search,
  Filter
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HomeServiceCategoryKey } from '@/lib/home/types';

export default function AdminPartnersPage() {
  const technicians = homeDataStore.getAllTechnicians();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('ALL');

  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = tech.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tech.operatingLocality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tech.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade = selectedTrade === 'ALL' || tech.serviceCategories.includes(selectedTrade as HomeServiceCategoryKey);
    return matchesSearch && matchesTrade;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Operations • Network Governance</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Technician Partners & KYC</h1>
          <p className="text-xs text-stone-500 mt-1">Vetted service professionals across Ahmedabad clusters with police verification & trade audits</p>
        </div>

        <Link
          href="/partner/register"
          className="inline-flex items-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Onboard New Technician</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Active Partners</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">{technicians.length}</div>
          <span className="text-[11px] text-emerald-700">100% Background Cleared</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Available for Dispatch</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {technicians.filter(t => t.isAvailableForDispatch).length}
          </div>
          <span className="text-[11px] text-stone-500">Live in Ahmedabad now</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Rating</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-center gap-1">
            4.86 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <span className="text-[11px] text-stone-500">Across 320+ member reviews</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Bundled Visit Settlement</span>
          <div className="text-2xl font-bold text-[#171A17] mt-1">₹280</div>
          <span className="text-[11px] text-stone-500">Fixed labour compensation</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID or locality..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto scrollbar-none">
          {['ALL', 'ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'APPLIANCE'].map(trade => (
            <button
              key={trade}
              onClick={() => setSelectedTrade(trade)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTrade === trade
                  ? 'bg-[#53634A] text-white'
                  : 'bg-white text-stone-600 border border-[#E3DFD5] hover:bg-stone-50'
              }`}
            >
              {trade}
            </button>
          ))}
        </div>
      </div>

      {/* Partner Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DFD5] shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Technician / ID</th>
                <th className="py-3 px-4">Trade Categories</th>
                <th className="py-3 px-4">Locality & Radius</th>
                <th className="py-3 px-4">Rating / Jobs</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredTechs.map(tech => (
                <tr key={tech.id} className="hover:bg-stone-50/70 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-stone-900">{tech.fullName}</div>
                    <div className="font-mono text-[11px] text-stone-400">{tech.id}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block bg-[#53634A]/10 text-[#53634A] font-semibold px-2 py-0.5 rounded text-[11px]">
                      {tech.serviceCategories.join(', ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-stone-800 font-medium">{tech.operatingLocality}</div>
                    <div className="text-stone-400 text-[11px]">{tech.serviceRadiusKm} km radius</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-amber-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{tech.ratingAverage} ★</span>
                    </div>
                    <div className="text-stone-400 text-[11px]">{tech.completedJobsCount} completed jobs</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {tech.kycStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      tech.isAvailableForDispatch
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tech.isAvailableForDispatch ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                      <span>{tech.isAvailableForDispatch ? 'Available' : 'Busy'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

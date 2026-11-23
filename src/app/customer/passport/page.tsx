'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Wrench, 
  ArrowLeft,
  Download,
  AlertTriangle
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';
import { HouseholdAsset, MaintenancePassportEntry } from '@/lib/home/types';

export default function PassportPage() {
  const customerId = 'cust-bopal-01';
  const customer = homeDataStore.getCustomerById(customerId);
  const assets = homeDataStore.getAssetsByCustomerId(customerId);
  const passportEntries = homeDataStore.getPassportEntries(customerId);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState({
    customName: '',
    assetType: 'AIR_CONDITIONER' as any,
    brand: '',
    modelNumber: '',
    installedLocation: 'Living Room'
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    homeDataStore.createAsset({
      customerId,
      customName: newAsset.customName,
      assetType: newAsset.assetType,
      brand: newAsset.brand,
      modelNumber: newAsset.modelNumber,
      installedLocation: newAsset.installedLocation
    });
    setShowAddAsset(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DFD5] pb-6">
        <div>
          <Link href="/customer/dashboard" className="text-xs text-[#53634A] font-semibold flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Member Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[#171A17]">Digital Home Maintenance Passport</h1>
            <span className="text-xs uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Verified Log
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registered Property: {customer?.apartmentOrSociety}, Flat {customer?.flatOrHouseNumber}, {customer?.locality}, Ahmedabad
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddAsset(true)}
            className="inline-flex items-center gap-1.5 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Appliance / Asset</span>
          </button>
        </div>
      </div>

      {/* Asset Register */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#171A17]">Tracked Household Assets ({assets.length})</h2>
          <span className="text-xs text-stone-500">Scheduled for seasonal preventive checks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map(asset => (
            <div key={asset.id} className="bg-white p-5 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                  {asset.assetType.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-stone-400">{asset.installedLocation}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#171A17]">{asset.customName}</h3>
                <p className="text-xs text-stone-500">{asset.brand} {asset.modelNumber ? `• ${asset.modelNumber}` : ''}</p>
              </div>

              <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-100">
                {asset.lastServicedDate && (
                  <div>Last Serviced: <strong>{asset.lastServicedDate}</strong></div>
                )}
                {asset.nextRecommendedServiceDate && (
                  <div className="text-amber-700 font-medium">
                    Next Due: <strong>{asset.nextRecommendedServiceDate}</strong>
                  </div>
                )}
              </div>

              {asset.notes && (
                <div className="p-2.5 rounded-xl bg-stone-50 text-[11px] text-stone-600 italic">
                  "{asset.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-bold text-lg text-[#171A17]">Register Household Appliance</h3>
              <button onClick={() => setShowAddAsset(false)} className="text-stone-400 hover:text-stone-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Asset Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom 1.5T Inverter AC"
                  value={newAsset.customName}
                  onChange={e => setNewAsset({ ...newAsset, customName: e.target.value })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Appliance Category *</label>
                <select
                  value={newAsset.assetType}
                  onChange={e => setNewAsset({ ...newAsset, assetType: e.target.value as any })}
                  className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                >
                  <option value="AIR_CONDITIONER">Air Conditioner</option>
                  <option value="WATER_PURIFIER_RO">Water Purifier (RO)</option>
                  <option value="GEYSER">Water Geyser</option>
                  <option value="REFRIGERATOR">Refrigerator</option>
                  <option value="WASHING_MACHINE">Washing Machine</option>
                  <option value="MAIN_ELECTRICAL_PANEL">Main Electrical Panel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daikin, Kent, Bosch"
                    value={newAsset.brand}
                    onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Bed"
                    value={newAsset.installedLocation}
                    onChange={e => setNewAsset({ ...newAsset, installedLocation: e.target.value })}
                    className="w-full text-sm rounded-xl border border-[#E3DFD5] px-3.5 py-2.5 bg-stone-50"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddAsset(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#53634A] text-white font-semibold"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Historical Maintenance Passport Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#171A17]">Verified Service History Timeline</h2>
          <p className="text-xs text-stone-500">Immutable ledger of repairs, replacements, and warranties</p>
        </div>

        <div className="space-y-6">
          {passportEntries.map((entry, idx) => (
            <div key={entry.id} className="relative pl-6 pb-6 border-l-2 border-[#53634A]/30 last:border-l-transparent last:pb-0">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#53634A] border-4 border-white shadow-xs"></span>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="font-bold text-sm text-[#171A17]">{entry.serviceType}</div>
                  <span className="text-stone-500 font-mono">{entry.date}</span>
                </div>

                <div className="text-xs text-stone-600">
                  Technician: <strong className="text-stone-800">{entry.performedBy}</strong>
                </div>

                <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/60 leading-relaxed">
                  {entry.findingsAndWork}
                </p>

                {entry.partsReplaced && entry.partsReplaced.length > 0 && (
                  <div className="text-xs text-stone-600 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-stone-700">Parts Replaced:</span>
                    {entry.partsReplaced.map((part, pidx) => (
                      <span key={pidx} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                        {part}
                      </span>
                    ))}
                  </div>
                )}

                {entry.warrantyGrantedMonths && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/70 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{entry.warrantyGrantedMonths}-Month Workmanship Guarantee Granted</span>
                  </div>
                )}

                {entry.nextActionRecommendation && (
                  <div className="text-[11px] text-stone-500 pt-1">
                    Recommendation: {entry.nextActionRecommendation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  CheckCircle2, 
  Save, 
  ShieldCheck,
  Bell
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function CustomerProfilePage() {
  const customerId = 'cust-bopal-01';
  const customer = homeDataStore.getCustomerById(customerId);

  const [formData, setFormData] = useState({
    fullName: customer?.fullName || 'Rajesh & Meera Patel',
    phoneNumber: customer?.mobile || '+91 98250 12345',
    email: customer?.email || 'patel.family@example.in',
    flatOrHouseNumber: customer?.flatOrHouseNumber || '402',
    apartmentOrSociety: customer?.apartmentOrSociety || 'Shivalik Parkview',
    locality: customer?.locality || 'South Bopal',
    city: 'Ahmedabad',
    pincode: '380058',
    gateInstructions: 'Inform MyGate app under Flat 402; visitor parking available in basement 1 near pillar B-14',
    whatsappUpdates: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E3DFD5] pb-6">
        <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Member Settings</span>
        <h1 className="text-3xl font-bold text-[#171A17] mt-1">Household Profile & Address</h1>
        <p className="text-xs text-stone-500 mt-1">Manage your service address, gate entry instructions & contact details for technicians</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile and address instructions updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-6">
        
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171A17] flex items-center gap-2">
            <User className="w-4 h-4 text-[#53634A]" /> Primary Account Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Household / Member Names</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number (WhatsApp Enabled)</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address (Invoicing & Reports)</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
            </div>
          </div>
        </div>

        {/* Service Address */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <h2 className="text-lg font-bold text-[#171A17] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#53634A]" /> Household Service Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Flat / Villa / House Number</label>
              <input
                type="text"
                value={formData.flatOrHouseNumber}
                onChange={e => setFormData({ ...formData, flatOrHouseNumber: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Society / Apartment Complex</label>
              <input
                type="text"
                value={formData.apartmentOrSociety}
                onChange={e => setFormData({ ...formData, apartmentOrSociety: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Locality (Ahmedabad Cluster)</label>
              <input
                type="text"
                value={formData.locality}
                readOnly
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={formData.pincode}
                readOnly
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Gate Entry & Technician Arrival Instructions
              </label>
              <textarea
                rows={3}
                value={formData.gateInstructions}
                onChange={e => setFormData({ ...formData, gateInstructions: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#53634A]"
              />
              <span className="text-[11px] text-stone-400">
                These notes appear on your dispatched technician's job sheet upon arrival.
              </span>
            </div>
          </div>
        </div>

        {/* Notifications & Submit */}
        <div className="space-y-4 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
            <input
              type="checkbox"
              checked={formData.whatsappUpdates}
              onChange={e => setFormData({ ...formData, whatsappUpdates: e.target.checked })}
              className="rounded text-[#53634A] focus:ring-[#53634A]"
            />
            <span>Receive technician live dispatch alerts & arrival ETA on WhatsApp</span>
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-[#53634A] hover:bg-[#43523B] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>

      </form>
    </div>
  );
}

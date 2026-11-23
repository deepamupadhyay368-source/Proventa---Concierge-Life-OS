'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Award, 
  FileCheck, 
  Wrench,
  AlertCircle
} from 'lucide-react';
import { homeDataStore } from '@/lib/home/repository';

export default function PartnerProfilePage() {
  const techId = 'tech-elec-01';
  const technician = homeDataStore.getTechnicianById(techId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E3DFD5] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#53634A]">Partner Trust & Safety</span>
          <h1 className="text-3xl font-bold text-[#171A17] mt-1">Technician KYC & Verification</h1>
          <p className="text-xs text-stone-500 mt-1">Verified identity, trade certifications & safety compliance records</p>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fully Verified PROVENTA Partner
        </span>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#53634A] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            JS
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#171A17]">{technician?.fullName || 'Jignesh Solanki'}</h2>
            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-800">Senior Electrical Specialist</span>
              <span>•</span>
              <span>8 Years Domestic Experience</span>
              <span>•</span>
              <span>Ahmedabad Western Cluster</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold pt-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>4.88 Rating (142 member reviews)</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-1 sm:text-right">
          <div className="text-stone-500">Partner Code</div>
          <div className="font-mono font-bold text-stone-900">{technician?.id || 'TECH-ELEC-01'}</div>
          <div className="text-emerald-700 font-medium">98.6% On-Time Arrival</div>
        </div>
      </div>

      {/* 4-Pillar Verification Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-[#171A17]">Govt Aadhaar Verification</span>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              VERIFIED
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Biometric UIDAI e-KYC authenticated with matching address and banking beneficiary records.
          </p>
          <div className="font-mono text-[11px] text-stone-400">UIDAI Ref: ••••••••4912</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-[#171A17]">Police Background Check</span>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              CLEAR
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Criminal history and character certificate cleared via local police jurisdiction (Ahmedabad City).
          </p>
          <div className="font-mono text-[11px] text-stone-400">PVR Cert: GJ-AHM-2026-880</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-[#171A17]">Trade Skill Assessment</span>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              GRADE A
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Passed practical diagnostic bench test for 3-phase DB wiring, leakage detection & inverter loads.
          </p>
          <div className="font-mono text-[11px] text-stone-400">Assessment Score: 94 / 100</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3DFD5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-[#171A17]">Safety Equipment & Toolkit</span>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              INSPECTED
            </span>
          </div>
          <p className="text-xs text-stone-600">
            Equipped with 1000V insulated VDE hand tools, digital clamp meter, safety shoes and PPE kit.
          </p>
          <div className="font-mono text-[11px] text-stone-400">Kit Audit Date: 01 Nov 2026</div>
        </div>

      </div>

      {/* Member Feedback Highlights */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DFD5] shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#171A17]">Recent Member Reviews</h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-stone-800">Rajesh Patel (South Bopal)</strong>
              <span className="text-amber-600 font-bold">5.0 ★</span>
            </div>
            <p className="text-xs text-stone-600">
              "Jignesh arrived right on time within the 2-hour window. Replaced our tripped MCB immediately with zero labour fee. Excellent professional."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <strong className="text-stone-800">Sunita Shah (Satellite)</strong>
              <span className="text-amber-600 font-bold">5.0 ★</span>
            </div>
            <p className="text-xs text-stone-600">
              "Identified a loose neutral line in our switchboard that two previous electricians couldn't solve. Clean work and very courteous."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

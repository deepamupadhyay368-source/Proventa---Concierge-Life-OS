'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, QrCode, ExternalLink, Calendar, MapPin } from 'lucide-react';

export function VerifiedPassCard({
  task,
}: {
  task: {
    publicId: string;
    externalReferenceId?: string;
    vendorName?: string;
    completedAt?: string | Date;
    category?: string;
    originalRequest?: string;
  };
}) {
  if (!task.externalReferenceId) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1f1b16] to-[#2a241e] text-[#faf8f5] p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#4a4034]">
      {/* Background Luxury Guilloché Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#9c8260]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#ddc8a9] font-sans">
            Authoritative Verified Pass
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#b09a78] border border-[#4a4034] px-2.5 py-0.5 rounded-full">
          {task.publicId}
        </span>
      </div>

      <div className="mb-6">
        <span className="text-xs text-[#b8b4ad] uppercase tracking-wider block mb-1 font-sans">Confirmed Provider / Venue</span>
        <h3 className="text-2xl font-serif font-normal text-white">
          {task.vendorName || 'Verified Proventa Partner'}
        </h3>
        <p className="text-xs text-[#ddc8a9] mt-1 font-sans">
          {task.originalRequest}
        </p>
      </div>

      {/* Pass Details Pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#14120e]/60 border border-[#4a4034] mb-6 font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#8a7053] uppercase tracking-wider block mb-0.5">Authoritative Reference</span>
          <span className="text-sm font-bold text-emerald-400 tracking-wider">
            {task.externalReferenceId}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#8a7053] uppercase tracking-wider block mb-0.5">Verification Timestamp</span>
          <span className="text-xs text-[#ddc8a9]">
            {task.completedAt ? new Date(task.completedAt).toLocaleString('en-IN') : 'Live Confirmed'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#3a3228] text-xs text-[#b09a78] font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Authoritative confirmation registered on provider ledger</span>
        </div>
      </div>
    </div>
  );
}

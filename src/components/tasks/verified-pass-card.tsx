'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <div className="rounded-2xl bg-gradient-to-br from-[#111820] via-[#1F2933] to-[#111820] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#E1E5E8]/20">
      {/* Background Silver Tech Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#A7B0B8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs" />
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#A7B0B8] font-sans">
            Authoritative Verified Pass
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#E5E9ED] border border-[#A7B0B8]/30 px-2.5 py-0.5 rounded-full bg-[#111820]/60">
          {task.publicId}
        </span>
      </div>

      <div className="mb-6">
        <span className="text-xs text-[#A7B0B8] uppercase tracking-wider block mb-1 font-sans">Confirmed Provider / Venue</span>
        <h3 className="text-2xl font-serif font-normal text-white">
          {task.vendorName || 'Verified Proventa Partner'}
        </h3>
        <p className="text-xs text-[#E5E9ED]/80 mt-1 font-sans">
          {task.originalRequest}
        </p>
      </div>

      {/* Pass Details Pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#111820]/80 border border-[#A7B0B8]/20 mb-6 font-mono text-xs">
        <div>
          <span className="text-[10px] text-[#A7B0B8] uppercase tracking-wider block mb-0.5">Authoritative Reference</span>
          <span className="text-sm font-bold text-emerald-400 tracking-wider">
            {task.externalReferenceId}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-[#A7B0B8] uppercase tracking-wider block mb-0.5">Verification Timestamp</span>
          <span className="text-xs text-[#E5E9ED]">
            {task.completedAt ? new Date(task.completedAt).toLocaleString('en-IN') : 'Live Confirmed'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#A7B0B8]/15 text-xs text-[#A7B0B8] font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Authoritative confirmation registered on provider ledger</span>
        </div>
      </div>
    </div>
  );
}

